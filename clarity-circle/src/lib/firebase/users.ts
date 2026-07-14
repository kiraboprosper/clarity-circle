import {
  doc, getDoc, updateDoc, collection,
  query, where, getDocs, limit,
  serverTimestamp, increment, setDoc,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import { awardPointsSecure } from "./functions";
import type { UserProfile } from "../types";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    console.warn("Firestore profile lookup failed, returning null:", error);
    return null;
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "displayName" | "bio" | "photoURL" | "isPrivate" | "theme" | "notificationSettings" | "onboardingCompleted" | "blockedUsers">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    lastActiveAt: serverTimestamp(),
  });
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const q = query(collection(db, COLLECTIONS.USERS), where("username", "==", username), limit(1));
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
  try {
    const today = new Date().toISOString().split("T")[0];
    const loginRef = doc(db, `${COLLECTIONS.USERS}/${uid}/loginDates/${today}`);
    const snap = await getDoc(loginRef);
    if (!snap.exists()) {
      await setDoc(loginRef, { date: today, recordedAt: serverTimestamp() });
      await awardPointsSecure({ amount: 5, type: "daily_login", description: "Daily login bonus", referenceId: today });
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), { lastActiveAt: serverTimestamp() });
    }
  } catch (error) {
    console.warn("Daily login update skipped:", error);
  }
}
