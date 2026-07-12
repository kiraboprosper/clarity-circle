"use client";
import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";

export interface EventItem {
  id: string;
  title: string;
  startsAt: unknown;
  place: string;
  tag: string;
  description?: string;
}

export async function getEvents(): Promise<EventItem[]> {
  const snap = await getDocs(query(collection(db, COLLECTIONS.EVENTS), orderBy("startsAt", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
}

export async function getRsvpedEventIds(userId: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db, COLLECTIONS.EVENT_RSVPS), where("userId", "==", userId)));
  return snap.docs.map((d) => String(d.data().eventId));
}

export async function rsvpEvent(userId: string, eventId: string): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.EVENT_RSVPS, `${userId}_${eventId}`), { userId, eventId, createdAt: serverTimestamp() });
}

export async function cancelRsvp(userId: string, eventId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EVENT_RSVPS, `${userId}_${eventId}`));
}
