"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { BarChart3, Users, Trophy, Flag, Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { signOut } from "@/lib/firebase/auth";

const ADMIN_NAV = [
  { href: "/admin", icon: BarChart3, label: "Analytics" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/challenges", icon: Trophy, label: "Challenges" },
  { href: "/admin/reports", icon: Flag, label: "Reports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (!loading && (!user || profile?.role !== "admin")) router.replace("/feed"); }, [user, profile, loading, router]);
  if (loading || profile?.role !== "admin") return null;
  return <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-primary)" }}><aside className="w-60 flex-shrink-0 flex flex-col border-r h-screen sticky top-0" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}><div className="p-5 border-b" style={{ borderColor: "var(--border-default)" }}><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-xl bg-gradient-to-br from-lavender-500 to-blossom-500 flex items-center justify-center"><span className="text-white font-bold text-xs">C</span></div><div><p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Admin Panel</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>Clarity Circle</p></div></div></div><nav className="flex-1 p-3 space-y-1">{ADMIN_NAV.map(({ href, icon: Icon, label }) => { const active = pathname === href; return <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", active ? "bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300" : "hover:bg-subtle")} style={!active ? { color: "var(--text-muted)" } : {}}><Icon className="w-4 h-4 flex-shrink-0" />{label}</Link>; })}</nav><div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border-default)" }}><Link href="/feed" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-subtle transition-all" style={{ color: "var(--text-muted)" }}><Home className="w-4 h-4" /> Back to app</Link><button onClick={() => { void signOut(); router.replace("/login"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all"><LogOut className="w-4 h-4" /> Sign out</button></div></aside><main className="flex-1 overflow-auto">{children}</main></div>;
}
