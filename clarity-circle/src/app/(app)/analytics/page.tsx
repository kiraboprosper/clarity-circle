"use client";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarCheck, Flame, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserHabits } from "@/lib/firebase/habits";
import type { Habit } from "@/lib/types";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const CATEGORIES = ["health", "mindset", "learning", "faith", "creativity", "social", "finance"];

function isoDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function AnalyticsPage() {
  const { user, profile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setHabits(await getUserHabits(user.uid));
      setLoading(false);
    };
    load();
  }, [user]);

  const weekly = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => isoDateDaysAgo(6 - index));
    return dates.map((date) => {
      if (habits.length === 0) return 0;
      const completed = habits.filter((habit) => habit.completedDates.includes(date)).length;
      return Math.round((completed / habits.length) * 100);
    });
  }, [habits]);

  const categoryBalance = useMemo(() => {
    return CATEGORIES.map((category) => {
      const categoryHabits = habits.filter((habit) => habit.category === category);
      const total = categoryHabits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
      const max = Math.max(...habits.map((habit) => habit.totalCompletions), 1);
      return { label: categoryLabel(category), value: Math.min(100, Math.round((total / max) * 100)) };
    }).filter((item) => item.value > 0);
  }, [habits]);

  return (
    <div className="section-container py-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>A calmer way to understand consistency, energy, and growth.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: Flame, label: "Best Streak", value: profile?.longestStreak ?? 0 },
          { icon: CalendarCheck, label: "Habit Streak", value: profile?.habitStreak ?? 0 },
          { icon: Target, label: "Level", value: profile?.level ?? 1 },
          { icon: TrendingUp, label: "XP", value: profile?.xp ?? 0 },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className={loading ? "animate-pulse" : ""}>
            <Icon className="w-5 h-5 text-lavender-600 mb-3" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-6"><BarChart3 className="w-5 h-5 text-lavender-600" /><h2 className="font-bold text-lg">Weekly Completion Rate</h2></div>
        <div className="flex items-end gap-3 h-56">
          {weekly.map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-2xl bg-gradient-to-t from-lavender-500 to-blossom-300 min-h-1" style={{ height: `${Math.max(value, 2)}%` }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{WEEK_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-lg mb-4">Category Balance</h2>
        {categoryBalance.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Complete habits to see category balance.</p>
        ) : (
          <div className="space-y-4">
            {categoryBalance.map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1"><span>{label}</span><span>{value}%</span></div>
                <ProgressBar value={value} max={100} variant="lavender" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
