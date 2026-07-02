"use client";
import { useState, useEffect } from "react";
import { Plus, Flame, CheckCircle2, Circle, Leaf, BarChart2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserHabits, createHabit, completeHabit } from "@/lib/firebase/habits";
import type { Habit, HabitCategory } from "@/lib/types";

const CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: "health",     label: "Health",     emoji: "💪" },
  { value: "mindset",    label: "Mindset",    emoji: "🧘" },
  { value: "learning",   label: "Learning",   emoji: "📚" },
  { value: "faith",      label: "Faith",      emoji: "✨" },
  { value: "creativity", label: "Creativity", emoji: "🎨" },
  { value: "social",     label: "Social",     emoji: "🤝" },
  { value: "finance",    label: "Finance",    emoji: "💰" },
];

const ICONS = ["🌸", "💪", "📚", "🧘", "✨", "🎯", "🌱", "💧", "🏃", "📝"];
const COLORS = [
  "from-lavender-400 to-lavender-500",
  "from-blossom-400 to-blossom-500",
  "from-amber-400 to-amber-500",
  "from-emerald-400 to-emerald-500",
  "from-sky-400 to-sky-500",
];

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "health" as HabitCategory, icon: "🌸", color: COLORS[0] });
  const [creating, setCreating] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const loadHabits = async () => {
    if (!user) return;
    setLoading(true);
    const h = await getUserHabits(user.uid);
    setHabits(h);
    setLoading(false);
  };

  useEffect(() => { loadHabits(); }, [user]);

  const handleCreate = async () => {
    if (!user || !form.name.trim()) return;
    setCreating(true);
    await createHabit(user.uid, {
      name: form.name,
      description: form.description,
      category: form.category,
      frequency: "daily",
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      pointsPerCompletion: 10,
      color: form.color,
      icon: form.icon,
    });
    await loadHabits();
    setShowCreate(false);
    setForm({ name: "", description: "", category: "health", icon: "🌸", color: COLORS[0] });
    setCreating(false);
  };

  const handleComplete = async (habit: Habit) => {
    if (!user || habit.completedDates.includes(today)) return;
    setHabits((prev) => prev.map((h) =>
      h.id === habit.id
        ? { ...h, completedDates: [...h.completedDates, today], streak: h.streak + 1, totalCompletions: h.totalCompletions + 1 }
        : h
    ));
    await completeHabit(habit.id, user.uid, habit);
  };

  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const overallStreak = Math.max(...habits.map((h) => h.streak), 0);

  return (
    <div className="section-container py-6 max-w-2xl space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CheckCircle2, label: "Today", value: `${completedToday}/${totalHabits}`, color: "text-lavender-500" },
          { icon: Flame,        label: "Streak", value: `${overallStreak}d`,               color: "text-amber-500" },
          { icon: Trophy,       label: "Total",  value: habits.reduce((a, h) => a + h.totalCompletions, 0), color: "text-blossom-500" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="text-center py-4">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
          </Card>
        ))}
      </div>

      {/* Progress */}
      {totalHabits > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Today's Progress</p>
            <Badge variant="lavender">{Math.round((completedToday / totalHabits) * 100)}%</Badge>
          </div>
          <ProgressBar value={completedToday} max={totalHabits} variant="lavender" />
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>My Habits</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Build the life she lives</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />} size="sm">
          Add Habit
        </Button>
      </div>

      {/* Habit List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-5xl">🌱</div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Plant your first habit</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Small steps, big transformation.</p>
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Create a habit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const done = habit.completedDates.includes(today);
            return (
              <Card key={habit.id} className="animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${habit.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{habit.name}</p>
                      {habit.streak >= 3 && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                          <Flame className="w-3 h-3" />{habit.streak}
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {CATEGORIES.find((c) => c.value === habit.category)?.emoji} {habit.totalCompletions} total completions
                    </p>
                  </div>
                  <button
                    onClick={() => handleComplete(habit)}
                    disabled={done}
                    className="transition-all duration-300"
                  >
                    {done
                      ? <CheckCircle2 className="w-7 h-7 text-lavender-500" />
                      : <Circle className="w-7 h-7 text-gray-300 dark:text-gray-600 hover:text-lavender-400 transition-colors" />
                    }
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Habit" size="md">
        <div className="space-y-4">
          <Input
            label="Habit name"
            placeholder="e.g. Morning journaling"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description (optional)"
            placeholder="Why does this habit matter to you?"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setForm((f) => ({ ...f, category: c.value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
                    form.category === c.value
                      ? "bg-lavender-100 dark:bg-lavender-900/40 text-lavender-700 dark:text-lavender-300 font-medium"
                      : "btn-secondary"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Icon</p>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm((f) => ({ ...f, icon }))}
                  className={`w-10 h-10 rounded-xl text-xl transition-all ${form.icon === icon ? "ring-2 ring-lavender-500 scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: "var(--bg-subtle)" }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} loading={creating} className="w-full">
            Create Habit ✨
          </Button>
        </div>
      </Modal>
    </div>
  );
}
