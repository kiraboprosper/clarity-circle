"use client";
import { useEffect, useState } from "react";
import { Gift, Lock, Sparkles, Wallpaper, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { getRewards, redeemReward } from "@/lib/firebase/rewards";
import { formatPoints } from "@/lib/utils/format";
import type { Reward } from "@/lib/types";

const STEPS = [
  { title: "Earn", description: "Collect points by completing habits, logging progress, and joining challenges." },
  { title: "Track", description: "Watch your point total grow from trusted server-side transactions." },
  { title: "Redeem", description: "Choose a reward and confirm the redemption when you have enough points." },
  { title: "Confirm", description: "Rewards are recorded in Firestore for reliable account history." },
];

function rewardIcon(type: Reward["type"]) {
  if (type === "theme") return Wallpaper;
  return Gift;
}

function rewardTypeLabel(type: Reward["type"]) {
  if (type === "premium_trial") return "Trial";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function RewardsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const points = profile?.points ?? 0;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setRewards(await getRewards());
      setLoading(false);
    }
    void load();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (!user || points < reward.pointsCost) return;
    setRedeeming(reward.id);
    try {
      await redeemReward(user.uid, reward);
      await refreshProfile();
      setMessage(`Redeemed ${reward.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to redeem reward. Please try again.");
    } finally {
      setRedeeming(null);
      window.setTimeout(() => setMessage(null), 4500);
    }
  };

  return (
    <div className="section-container py-6 space-y-6 max-w-5xl">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{STEPS.map((step) => <Card key={step.title} className="space-y-2 p-5"><div className="flex items-center justify-between"><h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{step.title}</h3><CheckCircle2 className="w-5 h-5 text-lavender-500" /></div><p className="text-sm" style={{ color: "var(--text-muted)" }}>{step.description}</p></Card>)}</div>
      <div className="rounded-3xl p-6 bg-gradient-to-r from-lavender-100 via-blossom-100 to-white border" style={{ borderColor: "var(--border-default)" }}><p className="text-sm font-medium text-lavender-700">Your Points</p><h1 className="text-4xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{formatPoints(points)}</h1><p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Rewards are redeemed through trusted backend functions.</p></div>
      {message && <div className="rounded-3xl border border-lavender-200 bg-lavender-50 p-4"><div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-lavender-600" /><p className="text-sm" style={{ color: "var(--text-primary)" }}>{message}</p></div></div>}
      {loading ? <Card>Loading rewards...</Card> : rewards.length === 0 ? <Card className="py-16 text-center"><Sparkles className="mx-auto w-10 h-10 text-lavender-500" /><p className="font-semibold mt-3">No rewards available</p><p className="text-sm" style={{ color: "var(--text-muted)" }}>Admins can seed rewards in Firestore.</p></Card> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rewards.map((reward) => { const Icon = rewardIcon(reward.type); const locked = points < reward.pointsCost; return <Card key={reward.id} className="space-y-4"><div className="flex items-start justify-between"><div className="w-12 h-12 rounded-2xl bg-lavender-100 grid place-items-center"><Icon className="w-6 h-6 text-lavender-600" /></div><Badge variant="lavender">{rewardTypeLabel(reward.type)}</Badge></div><div><h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{reward.name}</h2><p className="text-sm" style={{ color: "var(--text-muted)" }}>{reward.description}</p><p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{formatPoints(reward.pointsCost)} points</p></div><Button className="w-full" variant={locked ? "secondary" : "primary"} disabled={locked} loading={redeeming === reward.id} onClick={() => handleRedeem(reward)} leftIcon={locked ? <Lock className="w-4 h-4" /> : undefined}>{locked ? "Keep earning" : "Redeem"}</Button></Card>; })}</div>}
    </div>
  );
}
