"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Star, Trophy } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserHabits } from "@/lib/firebase/habits";
import type { Habit } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const challenges = ["Browse active challenges", "Track daily progress", "Celebrate completions"];

export function DashboardModules() {
  return <div className="grid gap-5 lg:grid-cols-3"><TodayHabits /><Module title="Challenges" href="/challenges" items={challenges} icon={Trophy} /><Module title="Rewards" href="/rewards" items={["Badges", "Themes", "Premium trials"]} icon={Star} /></div>;
}

function TodayHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchHabits = async () => {
      const userHabits = await getUserHabits(user.uid);
      setHabits(userHabits);
    };
    void fetchHabits();
  }, [user]);

  return <Module title="Today's Habits" href="/habits" items={habits.map(h => h.name)} icon={CheckCircle2} />;
}

function Module({ title, href, items, icon: Icon }: { title: string; href: string; items: string[]; icon: typeof CheckCircle2 }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-subtle grid place-items-center"><Icon className="w-5 h-5 text-muted" /></div>
        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.slice(0, 3).map((item, i) => <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}><div className="w-1 h-1 rounded-full bg-current" />{item}</li>)}
      </ul>
      <Link href={href}><Button variant="link" size="sm" className="mt-2">View all</Button></Link>
    </Card>
  );
}