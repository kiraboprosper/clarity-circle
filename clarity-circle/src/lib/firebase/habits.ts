﻿import {
  collection, addDoc, doc, updateDoc, getDocs,
  query, where, orderBy, serverTimestamp, increment, arrayUnion, Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import { awardPointsSecure } from "./functions";
import { createPost } from "./posts";
import type { Habit, UserProfile } from "../types";

export async function createHabit(userId: string, data: Omit<Habit, "id" | "userId" | "streak" | "longestStreak" | "completedDates" | "totalCompletions" | "createdAt" | "isArchived">): Promise<Habit> {
  const payload = {
    ...data,
    userId,
    streak: 0,
    longestStreak: 0,
    completedDates: [],
    totalCompletions: 0,
    isArchived: false,
    lastCompletedAt: null,
    completed: false,
    createdAt: Timestamp.now(),
  } as Omit<Habit, "id"> & { lastCompletedAt: Timestamp | null; completed: boolean };

  const ref = await addDoc(collection(db, COLLECTIONS.HABITS), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  return { id: ref.id, ...payload } as Habit;
}

export async function getUserHabits(userId: string): Promise<Habit[]> {
  const q = query(collection(db, COLLECTIONS.HABITS), where("userId", "==", userId), where("isArchived", "==", false), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), completed: false, lastCompletedAt: null } as Habit));
}

export const getHabitsForUser = getUserHabits;

export async function updateHabitStatus(habitId: string, completed: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.HABITS, habitId), {
    completed,
    lastCompletedAt: completed ? serverTimestamp() : null,
  } as any);
}

export async function deleteHabit(habitId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.HABITS, habitId), { isArchived: true });
}

export async function completeHabit(habitId: string, user: UserProfile, habit: Habit): Promise<void> {
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

  // Auto-post on streak milestones
  if ([3, 7, 14, 30, 100].includes(newStreak)) {
    const authorData = { uid: user.uid, displayName: user.displayName, username: user.username, isVerified: user.isVerified, photoURL: user.photoURL };
    const postContent = `🎉 Just hit a ${newStreak}-day streak for my habit: "${habit.name}"! Feeling proud of the consistency.`;
    await createPost(user.uid, authorData, postContent, [], ["habit-streak", habit.name.toLowerCase().replace(/\s/g, '-')]);
  }

  if (newStreak > habit.longestStreak) {
    await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), { longestStreak: Math.max(habit.longestStreak, newStreak) });
  }
  await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), { habitStreak: newStreak });
  await awardPointsSecure({ amount: 10, type: "habit_completed", description: `Completed: ${habit.name}`, referenceId: habitId });
}
