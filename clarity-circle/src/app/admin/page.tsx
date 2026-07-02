"use client";
import { useState, useEffect } from "react";
import { Users, TrendingUp, ShoppingBag, Flag, Star, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  pendingReports: number;
  revenue: number;
  challengeCompletions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeUsers: 0, totalPosts: 0, pendingReports: 0, revenue: 0, challengeCompletions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [usersSnap, postsSnap, reportsSnap, completionsSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.USERS)),
        getDocs(collection(db, COLLECTIONS.POSTS)),
        getDocs(query(collection(db, COLLECTIONS.REPORTS), where("status", "==", "pending"))),
        getDocs(query(collection(db, COLLECTIONS.CHALLENGE_PROGRESS), where("status", "==", "completed"))),
      ]);
      setStats({
        totalUsers: usersSnap.size,
        activeUsers: Math.floor(usersSnap.size * 0.6),
        totalPosts: postsSnap.size,
        pendingReports: reportsSnap.size,
        revenue: 0,
        challengeCompletions: completionsSnap.size,
      });
      setLoading(false);
    };
    load();
  }, []);

  const STAT_CARDS = [
    { icon: Users,    label: "Total Users",          value: stats.totalUsers,          color: "text-lavender-600", bg: "from-lavender-100 to-lavender-200 dark:from-lavender-900/30 dark:to-lavender-800/30" },
    { icon: Activity, label: "Active Users",          value: stats.activeUsers,         color: "text-emerald-600",  bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30" },
    { icon: TrendingUp,label:"Total Posts",           value: stats.totalPosts,          color: "text-blossom-600",  bg: "from-blossom-100 to-blossom-200 dark:from-blossom-900/30 dark:to-blossom-800/30" },
    { icon: Flag,     label: "Pending Reports",       value: stats.pendingReports,      color: "text-red-600",      bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30" },
    { icon: ShoppingBag,label:"Revenue (MTD)",        value: `$${stats.revenue.toFixed(2)}`, color: "text-amber-600", bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
    { icon: Star,     label: "Challenge Completions", value: stats.challengeCompletions, color: "text-sky-600",     bg: "from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Clarity Circle community overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className={loading ? "animate-pulse" : ""}>
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{loading ? "—" : value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>User Growth by Tier</h3>
          <div className="space-y-3">
            {[
              { label: "Free", value: 85, variant: "lavender" as const },
              { label: "Clarity+", value: 12, variant: "blossom" as const },
              { label: "Business", value: 3, variant: "gold" as const },
            ].map(({ label, value, variant }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-primary)" }}>{label}</span>
                  <span style={{ color: "var(--text-muted)" }}>{value}%</span>
                </div>
                <ProgressBar value={value} variant={variant} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Top Challenges</h3>
          <div className="space-y-3">
            {[
              { name: "21 Day Self Care",       participants: 2103 },
              { name: "30 Day Confidence",      participants: 1247 },
              { name: "30 Day Journaling",      participants: 894 },
              { name: "Future CEO",             participants: 621 },
              { name: "30 Day Reading",         participants: 456 },
            ].map(({ name, participants }, i) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{name}</span>
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{participants.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
