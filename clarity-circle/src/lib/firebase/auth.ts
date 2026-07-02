import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { COLLECTIONS } from "./collections";
import type { UserProfile } from "../types";

const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  username: string,
  age: number
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserDocument(credential.user, { displayName, username, age });
  return credential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const userRef = doc(db, COLLECTIONS.USERS, credential.user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await createUserDocument(credential.user, {
      displayName: credential.user.displayName || "Clarity Member",
      username: generateUsername(credential.user.displayName || "user"),
      age: null,
    });
  }
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

async function createUserDocument(
  user: User,
  extras: { displayName: string; username: string; age: number | null }
): Promise<void> {
  const ref = doc(db, COLLECTIONS.USERS, user.uid);
  const profile: Partial<UserProfile> = {
    uid: user.uid,
    email: user.email || "",
    displayName: extras.displayName,
    username: extras.username,
    photoURL: user.photoURL,
    bio: "",
    role: "user",
    subscriptionTier: "free",
    subscriptionExpiry: null,
    points: 50,
    level: 1,
    xp: 0,
    growthStage: "seed",
    isPrivate: false,
    isVerified: false,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    habitStreak: 0,
    longestStreak: 0,
    onboardingCompleted: false,
    blockedUsers: [],
    theme: "system",
    notificationSettings: {
      likes: true,
      comments: true,
      follows: true,
      challenges: true,
      directMessages: true,
      communityUpdates: true,
    },
    age: extras.age,
    ageVerified: extras.age !== null,
    joinedAt: serverTimestamp() as any,
    lastActiveAt: serverTimestamp() as any,
  };
  await setDoc(ref, profile);

  // Award account creation points
  await awardPoints(user.uid, 50, "account_created", "Welcome to Clarity Circle!");
}

export async function awardPoints(
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string
): Promise<void> {
  const { doc: firestoreDoc, collection, addDoc, increment, updateDoc } = await import("firebase/firestore");
  const txRef = collection(db, COLLECTIONS.POINTS);
  await addDoc(txRef, {
    userId,
    amount,
    type,
    description,
    referenceId: referenceId || null,
    createdAt: serverTimestamp(),
  });
  const userRef = firestoreDoc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, { points: increment(amount) });
}

function generateUsername(displayName: string): string {
  return displayName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + Math.floor(Math.random() * 9999);
}
