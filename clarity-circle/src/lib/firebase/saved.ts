"use client";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import type { SavedItem } from "../utils/saved";

export async function getSavedItemsForUser(userId: string): Promise<SavedItem[]> {
  const q = query(collection(db, COLLECTIONS.SAVED_ITEMS), where("userId", "==", userId), orderBy("savedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedItem));
}

export async function saveItemForUser(userId: string, item: SavedItem): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.SAVED_ITEMS, `${userId}_${item.type}_${item.id}`), {
    ...item,
    userId,
    savedAt: serverTimestamp(),
  });
}

export async function removeSavedItemForUser(userId: string, itemId: string): Promise<void> {
  const q = query(collection(db, COLLECTIONS.SAVED_ITEMS), where("userId", "==", userId), where("id", "==", itemId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((item) => deleteDoc(item.ref)));
}
