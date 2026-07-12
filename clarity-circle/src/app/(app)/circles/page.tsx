"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, Sparkles, Users, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { getCircles, getJoinedCircleIds, joinCircle, leaveCircle, type Circle } from "@/lib/firebase/circles";

export default function CirclesPage() {
  const { user, profile } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      const [items, ids] = await Promise.all([getCircles(), getJoinedCircleIds(user.uid)]);
      setCircles(items);
      setJoined(ids);
      setLoading(false);
    }
    void load();
  }, [user]);

  const isFree = !profile || profile.subscriptionTier === "free";
  const toggleJoin = async (circle: Circle) => {
    if (!user || (circle.isPremium && isFree)) return;
    if (joined.includes(circle.id)) {
      await leaveCircle(user.uid, circle.id);
      setJoined((current) => current.filter((id) => id !== circle.id));
    } else {
      await joinCircle(user.uid, circle.id);
      setJoined((current) => [...current, circle.id]);
    }
  };

  return (
    <div className="section-container py-6 space-y-6 max-w-6xl">
      <div><h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Community Circles</h1><p className="text-sm" style={{ color: "var(--text-muted)" }}>Join circles that match your goals and plan.</p></div>
      {isFree && <Card className="p-5 border border-lavender-200 bg-lavender-50"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold" style={{ color: "var(--text-primary)" }}>Free members can join open circles</p><p className="text-sm" style={{ color: "var(--text-muted)" }}>Upgrade to access premium circles.</p></div><Link href="/settings"><Button variant="secondary">Upgrade</Button></Link></div></Card>}
      {loading ? <Card>Loading circles...</Card> : circles.length === 0 ? <Card className="py-16 text-center"><Users className="mx-auto w-10 h-10 text-lavender-500" /><p className="font-semibold mt-3">No circles yet</p><p className="text-sm" style={{ color: "var(--text-muted)" }}>Admins can seed circles in Firestore.</p></Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{circles.map((circle) => {
        const locked = circle.isPremium && isFree;
        const joinedCircle = joined.includes(circle.id);
        return <Card key={circle.id} className="space-y-4 overflow-hidden"><div className="h-24 -mx-5 -mt-5 bg-gradient-to-br from-lavender-200 via-blossom-100 to-white flex items-center justify-center"><Sparkles className="w-8 h-8 text-lavender-500" /></div><div className="flex items-start justify-between gap-2"><div><h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{circle.name}</h2><p className="text-xs uppercase tracking-[0.2em] text-lavender-600">{circle.isPremium ? "Plus" : "Open"}</p></div>{joinedCircle && <Badge variant="gold">Joined</Badge>}</div><p className="text-sm" style={{ color: "var(--text-muted)" }}>{circle.description}</p><div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}><Users className="w-3 h-3" /><span>{circle.memberCount ?? 0} members</span></div>{joinedCircle ? <Button className="w-full" variant="secondary" onClick={() => toggleJoin(circle)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>Leave Circle</Button> : locked ? <Link href="/settings"><Button className="w-full" variant="secondary" leftIcon={<Lock className="w-4 h-4" />}>Upgrade to join</Button></Link> : <Button className="w-full" variant="primary" onClick={() => toggleJoin(circle)}>Join Circle</Button>}</Card>;
      })}</div>}
    </div>
  );
}
