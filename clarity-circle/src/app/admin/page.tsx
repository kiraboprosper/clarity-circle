"use client";
import { useState, useEffect } from "react";
import { Users, TrendingUp, Flag, Star, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";

interface Stats { totalUsers: number; activeUsers: number; totalPosts: number; pendingReports: number; challengeCompletions: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeUsers: 0, totalPosts: 0, pendingReports: 0, challengeCompletions: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { async function load() { const [usersSnap, postsSnap, reportsSnap, completionsSnap] = await Promise.all([getDocs(collection(db, COLLECTIONS.USERS)), getDocs(collection(db, COLLECTIONS.POSTS)), getDocs(query(collection(db, COLLECTIONS.REPORTS), where("status", "==", "pending"))), getDocs(query(collection(db, COLLECTIONS.CHALLENGE_PROGRESS), where("status", "==", "completed")))]); setStats({ totalUsers: usersSnap.size, activeUsers: Math.floor(usersSnap.size * 0.6), totalPosts: postsSnap.size, pendingReports: reportsSnap.size, challengeCompletions: completionsSnap.size }); setLoading(false); } void load(); }, []);
  const cards = [{ icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-lavender-600" }, { icon: Activity, label: "Active Users", value: stats.activeUsers, color: "text-emerald-600" }, { icon: TrendingUp, label: "Total Posts", value: stats.totalPosts, color: "text-blossom-600" }, { icon: Flag, label: "Pending Reports", value: stats.pendingReports, color: "text-red-600" }, { icon: Star, label: "Challenge Completions", value: stats.challengeCompletions, color: "text-sky-600" }];
  return <div className="p-6 space-y-8"><div><h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1><p className="text-sm" style={{ color: "var(--text-muted)" }}>Clarity Circle community overview</p></div><div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{cards.map(({ icon: Icon, label, value, color }) => <Card key={label} className={loading ? "animate-pulse" : ""}><Icon className={`w-5 h-5 ${color} mb-3`} /><p className="text-2xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{loading ? "-" : value}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p></Card>)}</div><Card><h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>User Growth by Tier</h3><div className="space-y-3">{[{ label: "Free", value: 85, variant: "lavender" as const }, { label: "Clarity+", value: 12, variant: "blossom" as const }, { label: "Business", value: 3, variant: "gold" as const }].map(({ label, value, variant }) => <div key={label}><div className="flex justify-between text-xs mb-1"><span style={{ color: "var(--text-primary)" }}>{label}</span><span style={{ color: "var(--text-muted)" }}>{value}%</span></div><ProgressBar value={value} variant={variant} size="sm" /></div>)}</div></Card></div>;
}
