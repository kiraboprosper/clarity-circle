"use client";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Crown, Flower2, Sparkles, Sprout, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserChallengeProgress } from "@/lib/firebase/challenges";
import { getUserHabits } from "@/lib/firebase/habits";
import { formatPoints, xpToNextLevel } from "@/lib/utils/format";
import type { ChallengeProgress, Habit } from "@/lib/types";

const decorationNames = ["Moonlit path", "Blossom arch", "Lavender bed", "Reflection pond"];

export default function GrowthGardenPage() {
  const { user, profile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress[]>([]);
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const next = xpToNextLevel(level);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const [userHabits, progress] = await Promise.all([
        getUserHabits(user.uid),
        getUserChallengeProgress(user.uid),
      ]);
      setHabits(userHabits);
      setChallengeProgress(progress);
    };
    load();
  }, [user]);

  const totalCompletions = useMemo(
    () => habits.reduce((sum, habit) => sum + habit.totalCompletions, 0),
    [habits]
  );

  const plantsGrown = Math.max(habits.length, Math.floor(totalCompletions / 5));
  const completedChallenges = challengeProgress.filter((progress) => progress.status === "completed").length;
  const achievements = [
    totalCompletions >= 10 && { title: "Consistency Builder", tone: "from-lavender-400 to-lavender-700" },
    (profile?.habitStreak ?? 0) >= 7 && { title: "Week Streak", tone: "from-amber-300 to-orange-500" },
    habits.length >= 3 && { title: "Habit Gardener", tone: "from-blossom-300 to-pink-600" },
    completedChallenges > 0 && { title: "Challenge Champion", tone: "from-slate-500 to-amber-500" },
  ].filter(Boolean) as { title: string; tone: string }[];

  const unlockedDecorations = decorationNames.slice(0, Math.min(decorationNames.length, Math.floor(level / 2) + (profile?.subscriptionTier === "free" ? 0 : 1)));

  return (
    <div className="section-container py-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Growth Garden</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Your habits and challenges become visible progress.</p>
        </div>
        <Button variant="secondary" leftIcon={<Sparkles className="w-4 h-4" />}>Customize</Button>
      </div>

      <section className="relative overflow-hidden rounded-3xl border min-h-[360px] bg-gradient-to-br from-sky-100 via-lavender-100 to-blossom-100" style={{ borderColor: "var(--border-default)" }}>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-emerald-200/80 to-transparent" />
        <div className="absolute left-1/2 top-14 -translate-x-1/2 w-48 h-48 rounded-full bg-blossom-200/70 blur-2xl" />
        <div className="absolute left-1/2 bottom-14 -translate-x-1/2 w-56 h-16 rounded-[50%] bg-emerald-700/20" />
        <div className="absolute left-1/2 bottom-20 -translate-x-1/2">
          <div className="relative w-72 h-56">
            <div className="absolute left-1/2 bottom-10 h-36 w-7 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-800 to-amber-950" />
            {["left-4 top-12", "left-16 top-3", "left-28 top-0", "right-10 top-8", "right-1 top-20", "left-0 top-28", "right-20 top-28"].slice(0, Math.max(3, Math.min(7, level + 2))).map((pos) => (
              <div key={pos} className={`absolute ${pos} w-28 h-24 rounded-full bg-gradient-to-br from-lavender-300 via-blossom-200 to-white shadow-soft`} />
            ))}
            {["left-8 bottom-0", "left-24 bottom-4", "right-10 bottom-0", "right-24 bottom-8"].slice(0, Math.max(1, Math.min(4, habits.length))).map((pos) => (
              <Flower2 key={pos} className={`absolute ${pos} w-8 h-8 text-blossom-500`} />
            ))}
          </div>
        </div>
        <Card className="absolute right-4 top-4 w-44 bg-white/85 backdrop-blur">
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Level {level}</p>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{profile?.growthStage ?? "seed"}</p>
          <ProgressBar value={xp} max={next} variant="lavender" />
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{formatPoints(xp)} / {formatPoints(next)} XP</p>
        </Card>
      </section>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: Sprout, label: "Plants Grown", value: plantsGrown },
          { icon: CalendarCheck, label: "Habits Completed", value: totalCompletions },
          { icon: Trophy, label: "Current Streak", value: `${profile?.habitStreak ?? 0} days` },
          { icon: Crown, label: "Points", value: formatPoints(profile?.points ?? 0) },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 grid place-items-center"><Icon className="w-5 h-5 text-lavender-600" /></div>
            <div><p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-lg">Recent Achievements</h2><Button variant="ghost" size="sm">View All</Button></div>
          {achievements.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Complete habits and challenges to unlock achievements.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {achievements.map((item) => <div key={item.title} className="text-center"><div className={`mx-auto mb-2 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.tone} grid place-items-center shadow-soft`}><Trophy className="w-8 h-8 text-white" /></div><p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</p></div>)}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="font-bold text-lg mb-4">Unlocked Decorations</h2>
          {unlockedDecorations.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Level up to unlock garden decorations.</p>
          ) : (
            <div className="space-y-3">{unlockedDecorations.map((item) => <div key={item} className="flex items-center justify-between rounded-2xl bg-subtle px-3 py-2"><span className="text-sm font-medium">{item}</span><Sparkles className="w-4 h-4 text-lavender-500" /></div>)}</div>
          )}
        </Card>
      </div>
    </div>
  );
}
