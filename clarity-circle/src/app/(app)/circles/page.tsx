"use client";
import { Lock, MessageCircle, Sparkles, Trophy, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";

const circles = [
  { name: "Confidence Circle", members: 12800, desc: "Self-belief, reflection, and bold daily action.", premium: false },
  { name: "Study Circle", members: 7200, desc: "Focus rooms, accountability, and learning goals.", premium: false },
  { name: "Creator Circle", members: 5400, desc: "Make, publish, and share creative progress.", premium: false },
  { name: "Wellness Circle", members: 9400, desc: "Movement, rest, hydration, and steady routines.", premium: false },
  { name: "Entrepreneur Circle", members: 3100, desc: "Business ideas, launches, and product promotion.", premium: true },
  { name: "Family Circle", members: 1800, desc: "Parent-supported habits and family goals.", premium: true },
];

export default function CirclesPage() {
  const { profile } = useAuth();
  const isFree = !profile || profile.subscriptionTier === "free";
  return (
    <div className="section-container py-6 space-y-6 max-w-6xl">
      <div><h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Community Circles</h1><p className="text-sm" style={{ color: "var(--text-muted)" }}>Smaller supportive spaces for your goals and interests.</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{circles.map((circle, i) => {
        const locked = circle.premium && isFree;
        return <Card key={circle.name} className="space-y-4 overflow-hidden"><div className="h-24 -mx-5 -mt-5 bg-gradient-to-br from-lavender-200 via-blossom-100 to-white flex items-center justify-center"><Sparkles className="w-8 h-8 text-lavender-500" /></div><div className="flex items-start justify-between gap-2"><h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{circle.name}</h2>{circle.premium && <Badge variant="gold">Plus</Badge>}</div><p className="text-sm" style={{ color: "var(--text-muted)" }}>{circle.desc}</p><div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}><span className="flex items-center gap-1"><Users className="w-3 h-3" />{circle.members.toLocaleString()}</span><span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{i + 2} challenges</span><span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />Chat</span></div><Button className="w-full" variant={locked ? "secondary" : "primary"} disabled={locked} leftIcon={locked ? <Lock className="w-4 h-4" /> : undefined}>{locked ? "Upgrade to join" : "Join Circle"}</Button></Card>;
      })}</div>
    </div>
  );
}
