import type { FirebaseApp } from "firebase/app";
import { initializeApp, getApps, getApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { getAuth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;
let firebaseDbInstance: Firestore | null = null;
let firebaseStorageInstance: FirebaseStorage | null = null;

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function ensureFirebaseConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(
      `Missing Firebase environment variables: ${missing.join(", ")}. ` +
      `Set all NEXT_PUBLIC_FIREBASE_* values for build/runtime.`
    );
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (firebaseAppInstance) return firebaseAppInstance;
  if (getApps().length) {
    firebaseAppInstance = getApp();
    return firebaseAppInstance;
  }
  ensureFirebaseConfig();
  firebaseAppInstance = initializeApp(firebaseConfig);
  return firebaseAppInstance;
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuthInstance) {
    firebaseAuthInstance = getAuth(getFirebaseApp());
  }
  return firebaseAuthInstance;
}

export function getFirestoreDb(): Firestore {
  if (!firebaseDbInstance) {
    firebaseDbInstance = getFirestore(getFirebaseApp());
  }
  return firebaseDbInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!firebaseStorageInstance) {
    firebaseStorageInstance = getStorage(getFirebaseApp());
  }
  return firebaseStorageInstance;
}

export const auth = getFirebaseAuth();
export const db = getFirestoreDb();
export const storage = getFirebaseStorage();
export const app = getFirebaseApp();
export default app;
