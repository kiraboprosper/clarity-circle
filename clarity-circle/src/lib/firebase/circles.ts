"use client";
import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";

export interface Circle {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  memberCount?: number;
}

export async function getCircles(): Promise<Circle[]> {
  const snap = await getDocs(query(collection(db, COLLECTIONS.CIRCLES), orderBy("name", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Circle));
}

export async function getJoinedCircleIds(userId: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db, COLLECTIONS.CIRCLE_MEMBERSHIPS), where("userId", "==", userId)));
  return snap.docs.map((d) => String(d.data().circleId));
}

export async function joinCircle(userId: string, circleId: string): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.CIRCLE_MEMBERSHIPS, `${userId}_${circleId}`), { userId, circleId, joinedAt: serverTimestamp() });
}

export async function leaveCircle(userId: string, circleId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CIRCLE_MEMBERSHIPS, `${userId}_${circleId}`));
}
