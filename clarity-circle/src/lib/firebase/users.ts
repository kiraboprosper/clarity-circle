import {
  doc, getDoc, updateDoc, collection,
  query, where, getDocs, orderBy, limit,
  serverTimestamp, increment, setDoc,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import type { UserProfile } from "../types";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "email" | "joinedAt">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    lastActiveAt: serverTimestamp(),
  });
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where("username", "==", username),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfile;
}

export async function followUser(currentUserId: string, targetUserId: string): Promise<void> {
  const followRef = doc(db, COLLECTIONS.FOLLOWS, `${currentUserId}_${targetUserId}`);
  await setDoc(followRef, {
    followerId: currentUserId,
    followingId: targetUserId,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COLLECTIONS.USERS, currentUserId), { followingCount: increment(1) });
  await updateDoc(doc(db, COLLECTIONS.USERS, targetUserId), { followersCount: increment(1) });
}

export async function unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, COLLECTIONS.FOLLOWS, `${currentUserId}_${targetUserId}`));
  await updateDoc(doc(db, COLLECTIONS.USERS, currentUserId), { followingCount: increment(-1) });
  await updateDoc(doc(db, COLLECTIONS.USERS, targetUserId), { followersCount: increment(-1) });
}

export async function isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, COLLECTIONS.FOLLOWS, `${currentUserId}_${targetUserId}`));
  return snap.exists();
}

export async function blockUser(currentUserId: string, targetUserId: string): Promise<void> {
  const { arrayUnion } = await import("firebase/firestore");
  await updateDoc(doc(db, COLLECTIONS.USERS, currentUserId), {
    blockedUsers: arrayUnion(targetUserId),
  });
}

export async function recordDailyLogin(uid: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const loginRef = doc(db, `${COLLECTIONS.USERS}/${uid}/loginDates/${today}`);
  const snap = await getDoc(loginRef);
  if (!snap.exists()) {
    await setDoc(loginRef, { date: today, recordedAt: serverTimestamp() });
    const { awardPoints } = await import("./auth");
    await awardPoints(uid, 5, "daily_login", "Daily login bonus");
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { lastActiveAt: serverTimestamp() });
  }
}
