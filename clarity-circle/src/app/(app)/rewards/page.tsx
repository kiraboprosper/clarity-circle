"use client";
import { useEffect, useState } from "react";
import { Gift, Lock, Sparkles, Ticket, Wallpaper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { getRewards, redeemReward } from "@/lib/firebase/rewards";
import { formatPoints } from "@/lib/utils/format";
import type { Reward } from "@/lib/types";

const DEFAULT_REWARDS: Reward[] = [
  { id: "default_5_discount", name: "5% Store Discount", description: "Save on your next store order.", type: "discount", pointsCost: 1000, imageURL: "", discountAmount: 5, isPremiumOnly: false, stock: null, expiresAt: null },
  { id: "default_10_discount", name: "10% Store Discount", description: "A bigger reward for consistent growth.", type: "discount", pointsCost: 2500, imageURL: "", discountAmount: 10, isPremiumOnly: false, stock: null, expiresAt: null },
  { id: "default_15_discount", name: "15% Store Discount", description: "Use points to unlock a larger store discount.", type: "discount", pointsCost: 5000, imageURL: "", discountAmount: 15, isPremiumOnly: false, stock: null, expiresAt: null },
  { id: "default_wallpaper", name: "Premium Wallpaper Pack", description: "Digital wallpapers for your devices.", type: "theme", pointsCost: 800, imageURL: "", discountAmount: null, isPremiumOnly: false, stock: null, expiresAt: null },
  { id: "default_frame", name: "Bloom Profile Frame", description: "Decorate your profile with a bloom frame.", type: "badge", pointsCost: 1200, imageURL: "", discountAmount: null, isPremiumOnly: false, stock: null, expiresAt: null },
  { id: "default_trial", name: "7 Day Plus Trial", description: "Try premium features for a week.", type: "premium_trial", pointsCost: 3000, imageURL: "", discountAmount: null, isPremiumOnly: false, stock: null, expiresAt: null },
];

function rewardIcon(type: Reward["type"]) {
  if (type === "discount") return Ticket;
  if (type === "theme") return Wallpaper;
  if (type === "badge") return Sparkles;
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
  const points = profile?.points ?? 0;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const realRewards = await getRewards();
      setRewards(realRewards.length > 0 ? realRewards : DEFAULT_REWARDS);
      setLoading(false);
    };
    load();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (!user || points < reward.pointsCost) return;
    setRedeeming(reward.id);
    await redeemReward(user.uid, reward);
    await refreshProfile();
    setRedeeming(null);
  };

  return (
    <div className="section-container py-6 space-y-6 max-w-5xl">
      <div className="rounded-3xl p-6 bg-gradient-to-r from-lavender-100 via-blossom-100 to-white border" style={{ borderColor: "var(--border-default)" }}>
        <p className="text-sm font-medium text-lavender-700">Your Points</p>
        <h1 className="text-4xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{formatPoints(points)}</h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Earn points through daily logins, habits, posts, comments, and completed challenges.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Card key={i} className="h-52 animate-pulse"><span className="sr-only">Loading reward</span></Card>)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const Icon = rewardIcon(reward.type);
            const locked = points < reward.pointsCost;
            return (
              <Card key={reward.id} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-lavender-100 grid place-items-center"><Icon className="w-6 h-6 text-lavender-600" /></div>
                  <Badge variant={reward.type === "discount" ? "gold" : "lavender"}>{rewardTypeLabel(reward.type)}</Badge>
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{reward.name}</h2>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{reward.description}</p>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{formatPoints(reward.pointsCost)} points</p>
                </div>
                <Button
                  className="w-full"
                  variant={locked ? "secondary" : "primary"}
                  disabled={locked}
                  loading={redeeming === reward.id}
                  onClick={() => handleRedeem(reward)}
                  leftIcon={locked ? <Lock className="w-4 h-4" /> : undefined}
                >
                  {locked ? "Keep earning" : "Redeem"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
