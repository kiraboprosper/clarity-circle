"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Plus, Trash2, Flame } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import type { Habit } from "@/lib/types";
// We'll assume these functions will be created in src/lib/firebase/habits.ts
import {
  getHabitsForUser,
  createHabit,
  updateHabitStatus,
  deleteHabit,
} from "@/lib/firebase/habits";
import { isYesterday, isToday } from 'date-fns';
import { PostSkeleton } from "@/components/ui/Skeleton";

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadHabits = async () => {
      setLoading(true);
      const userHabits = await getHabitsForUser(user.uid);
      setHabits(userHabits);
      setLoading(false);
    };

    void loadHabits();
  }, [user]);

  const handleAddHabit = async () => {
    if (!user || !newHabitTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const newHabit = await createHabit(user.uid, {
        name: newHabitTitle.trim(),
        description: "",
        category: "mindset",
        frequency: "daily",
        targetDays: [1, 2, 3, 4, 5, 6, 7],
        pointsPerCompletion: 5,
        color: "lavender",
        icon: "sparkles",
      });
      setHabits((prev) => [{ ...newHabit, completed: false, title: newHabit.name }, ...prev]);
      setNewHabitTitle("");
    } catch (error) {
      console.error("Error creating habit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHabit = async (habitId: string, currentStatus: boolean) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (!currentStatus) {
      // --- Completing a habit ---
      setAnimatingHabitId(habitId);

      // Optimistically update streak
      const lastCompleted = habit.lastCompletedAt && "toDate" in habit.lastCompletedAt ? habit.lastCompletedAt.toDate() : (typeof habit.lastCompletedAt === "number" ? new Date(habit.lastCompletedAt) : null);
      const wasCompletedYesterday = lastCompleted ? isYesterday(lastCompleted) : false;
      const newStreak = wasCompletedYesterday ? (habit.streak || 0) + 1 : 1;

      // Wait for animation to finish before moving the habit visually
      setTimeout(() => {
        setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, completed: true, streak: newStreak, lastCompletedAt: Timestamp.fromDate(new Date()) } : h)));
        setAnimatingHabitId(null);
      }, 800); // Match animation duration

      await updateHabitStatus(habitId, true); // The backend will handle the real streak logic
    } else {
      // --- Un-completing a habit ---
      const lastCompleted = habit.lastCompletedAt && "toDate" in habit.lastCompletedAt ? habit.lastCompletedAt.toDate() : null;
      const wasCompletedToday = lastCompleted ? isToday(lastCompleted) : false;
      // Only decrement streak if it was completed today
      const newStreak = wasCompletedToday ? Math.max(0, (habit.streak || 0) - 1) : (habit.streak || 0);

      // Update immediately without animation
      setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, completed: false, streak: newStreak, lastCompletedAt: null } : h)));
      await updateHabitStatus(habitId, false);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    await deleteHabit(habitId);
  };

  const { activeHabits, completedHabits } = useMemo(() => {
    return habits.reduce(
      (acc, habit) => {
        if (habit.completed) {
          acc.completedHabits.push(habit);
        } else {
          acc.activeHabits.push(habit);
        }
        return acc;
      },
      { activeHabits: [] as Habit[], completedHabits: [] as Habit[] }
    );
  }, [habits]);

  return (
    <div className="section-container py-5 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Manage Habits</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Add, track, and complete your habits to build momentum.</p>
      </header>

      <Card>
        <div className="flex gap-3">
          <Input
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            placeholder="e.g., Meditate for 10 minutes"
            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
          />
          <Button onClick={handleAddHabit} loading={isSubmitting} disabled={!newHabitTitle.trim()} rightIcon={<Plus className="w-4 h-4" />}>
            Add
          </Button>
        </div>
      </Card>

      {loading ? (
        <PostSkeleton />
      ) : (
        <div className="space-y-6">
          <HabitList title="Active Habits" habits={activeHabits} onToggle={handleToggleHabit} onDelete={handleDeleteHabit} animatingHabitId={animatingHabitId} />
          <HabitList title="Completed" habits={completedHabits} onToggle={handleToggleHabit} onDelete={handleDeleteHabit} animatingHabitId={animatingHabitId} />
        </div>
      )}
    </div>
  );
}

function HabitList({ title, habits, onToggle, onDelete, animatingHabitId }: { title: string; habits: Habit[]; onToggle: (id: string, status: boolean) => void; onDelete: (id: string) => void; animatingHabitId?: string | null; }) {
  if (habits.length === 0 && title === "Completed") return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>{title}</h2>
      <Card className="p-2 space-y-2">
        {habits.length > 0 ? (
          habits.map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-subtle transition-colors group ${animatingHabitId === habit.id ? 'animate-celebrate' : ''}`}
            >
              <input
                type="checkbox"
                checked={habit.completed ?? false}
                onChange={() => onToggle(habit.id, habit.completed ?? false)}
                className="w-5 h-5 rounded-md border-gray-300 text-lavender-600 focus:ring-lavender-500"
              />
              <span className={`flex-1 text-sm ${habit.completed ? "line-through text-muted" : "text-primary"}`}>
                {habit.name}
              </span>
              {habit.streak > 0 && (
                <div className="flex items-center gap-1 text-sm text-amber-500">
                  <Flame className="w-4 h-4" />
                  <span>{habit.streak}</span>
                </div>
              )}
              <button onClick={() => onDelete(habit.id)} className="p-1 text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-muted py-4">No active habits. Add one above to get started!</p>
        )}
      </Card>
    </div>
  );
}