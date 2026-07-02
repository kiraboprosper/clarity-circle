import {
  collection, addDoc, doc, updateDoc, getDocs,
  query, where, orderBy, serverTimestamp, increment, arrayUnion,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import type { Habit } from "../types";
import { awardPoints } from "./auth";

export async function createHabit(
  userId: string,
  data: Omit<Habit, "id" | "userId" | "streak" | "longestStreak" | "completedDates" | "totalCompletions" | "createdAt" | "isArchived">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.HABITS), {
    ...data,
    userId,
    streak: 0,
    longestStreak: 0,
    completedDates: [],
    totalCompletions: 0,
    isArchived: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserHabits(userId: string): Promise<Habit[]> {
  const q = query(
    collection(db, COLLECTIONS.HABITS),
    where("userId", "==", userId),
    where("isArchived", "==", false),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Habit));
}

export async function completeHabit(
  habitId: string,
  userId: string,
  habit: Habit
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  if (habit.completedDates.includes(today)) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newStreak = habit.completedDates.includes(yesterday) ? habit.streak + 1 : 1;

  await updateDoc(doc(db, COLLECTIONS.HABITS, habitId), {
    completedDates: arrayUnion(today),
    totalCompletions: increment(1),
    streak: newStreak,
    longestStreak: Math.max(habit.longestStreak, newStreak),
  });

  if (newStreak > habit.longestStreak) {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      longestStreak: Math.max(habit.longestStreak, newStreak),
    });
  }
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), { habitStreak: newStreak });
  await awardPoints(userId, 10, "habit_completed", `Completed: ${habit.name}`, habitId);
}
