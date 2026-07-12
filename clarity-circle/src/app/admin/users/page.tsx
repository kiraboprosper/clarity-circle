"use client";
import { useState, useEffect } from "react";
import { Search, Shield } from "lucide-react";
import { collection, getDocs, orderBy, query, limit, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import type { UserProfile } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, COLLECTIONS.USERS), orderBy("joinedAt", "desc"), limit(100));
      const snap = await getDocs(q);
      setUsers(snap.docs.map((d) => d.data() as UserProfile));
      setLoading(false);
    };
    load();
  }, []);

  const handleRoleChange = async (uid: string, role: "user" | "moderator" | "admin") => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { role });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role } : u));
  };

  const filtered = users.filter((u) =>
    !search || u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Users</h1>
        <span className="badge badge-lavender">{users.length} total</span>
      </div>
      <Input placeholder="Search by name or emailâ€¦" value={search} onChange={(e) => setSearch(e.target.value)} leftElement={<Search className="w-4 h-4" />} />
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs font-medium text-left" style={{ borderColor: "var(--border-default)", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)" }}>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3 hidden md:table-cell">Subscription</th>
              <th className="px-4 py-3 hidden md:table-cell">Points</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
              ))
              : filtered.map((user) => (
                <tr key={user.uid} className="hover:bg-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.photoURL} name={user.displayName} size="sm" verified={user.isVerified} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.displayName}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={user.subscriptionTier === "free" ? "gray" : "lavender"}>
                      {user.subscriptionTier}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-amber-500 font-medium">âœ¦ {user.points}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "blossom" : user.role === "moderator" ? "gold" : "gray"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {user.role !== "moderator" && (
                        <Button size="sm" variant="secondary" onClick={() => handleRoleChange(user.uid, "moderator")} leftIcon={<Shield className="w-3 h-3" />}>
                          Mod
                        </Button>
                      )}
                      {user.role !== "user" && (
                        <Button size="sm" variant="secondary" onClick={() => handleRoleChange(user.uid, "user")}>
                          Demote
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

