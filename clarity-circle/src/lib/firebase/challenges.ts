import {
  collection, addDoc, doc, getDoc, getDocs, updateDoc,
  query, where, orderBy, serverTimestamp, increment, arrayUnion,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import { awardPointsSecure } from "./functions";
import type { Challenge, ChallengeProgress } from "../types";

export async function getChallenges(): Promise<Challenge[]> {
  const q = query(collection(db, COLLECTIONS.CHALLENGES), where("status", "in", ["active", "upcoming"]), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Challenge));
}

export async function joinChallenge(challengeId: string, userId: string): Promise<string> {
  const challengeRef = doc(db, COLLECTIONS.CHALLENGES, challengeId);
  const challengeSnap = await getDoc(challengeRef);
  const ref = await addDoc(collection(db, COLLECTIONS.CHALLENGE_PROGRESS), {
    challengeId,
    userId,
    startedAt: serverTimestamp(),
    completedAt: null,
    currentDay: 1,
    completedDays: [],
    totalPointsEarned: 0,
    status: "active",
  });
  if (challengeSnap.exists()) await updateDoc(challengeRef, { participantsCount: increment(1) });
  return ref.id;
}

export async function getUserChallengeProgress(userId: string): Promise<ChallengeProgress[]> {
  const q = query(collection(db, COLLECTIONS.CHALLENGE_PROGRESS), where("userId", "==", userId), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChallengeProgress));
}

export async function completeChallengeDay(progressId: string, _userId: string, day: number, pointsForDay: number): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CHALLENGE_PROGRESS, progressId), {
    completedDays: arrayUnion(day),
    currentDay: day + 1,
    totalPointsEarned: increment(pointsForDay),
  });
  await awardPointsSecure({ amount: pointsForDay, type: "habit_completed", description: `Challenge day ${day} complete`, referenceId: progressId });
}

export async function completeChallenge(progressId: string, challengeId: string, _userId: string, totalPoints: number): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CHALLENGE_PROGRESS, progressId), { status: "completed", completedAt: serverTimestamp() });
  await awardPointsSecure({ amount: totalPoints, type: "challenge_completed", description: "Challenge completed", referenceId: challengeId });
}
