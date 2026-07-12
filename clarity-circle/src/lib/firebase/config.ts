import type { FirebaseApp } from "firebase/app";
import { initializeApp, getApps, getApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { getAuth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";

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
  if (getApps().length) return getApp();
  ensureFirebaseConfig();
  return initializeApp(firebaseConfig);
}

function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return Reflect.get(getFirebaseAuth(), prop);
  },
  set(_, prop, value) {
    return Reflect.set(getFirebaseAuth() as any, prop, value);
  },
  has(_, prop) {
    return prop in getFirebaseAuth();
  },
  getOwnPropertyDescriptor(_, prop) {
    return Object.getOwnPropertyDescriptor(getFirebaseAuth() as any, prop);
  },
  ownKeys() {
    return Reflect.ownKeys(getFirebaseAuth());
  },
});

export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    return Reflect.get(getFirestoreDb(), prop);
  },
  set(_, prop, value) {
    return Reflect.set(getFirestoreDb() as any, prop, value);
  },
  has(_, prop) {
    return prop in getFirestoreDb();
  },
  getOwnPropertyDescriptor(_, prop) {
    return Object.getOwnPropertyDescriptor(getFirestoreDb() as any, prop);
  },
  ownKeys() {
    return Reflect.ownKeys(getFirestoreDb());
  },
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(_, prop) {
    return Reflect.get(getFirebaseStorage(), prop);
  },
  set(_, prop, value) {
    return Reflect.set(getFirebaseStorage() as any, prop, value);
  },
  has(_, prop) {
    return prop in getFirebaseStorage();
  },
  getOwnPropertyDescriptor(_, prop) {
    return Object.getOwnPropertyDescriptor(getFirebaseStorage() as any, prop);
  },
  ownKeys() {
    return Reflect.ownKeys(getFirebaseStorage());
  },
});

const appProxy = new Proxy({} as FirebaseApp, {
  get(_, prop) {
    return Reflect.get(getFirebaseApp(), prop);
  },
  set(_, prop, value) {
    return Reflect.set(getFirebaseApp() as any, prop, value);
  },
  has(_, prop) {
    return prop in getFirebaseApp();
  },
  getOwnPropertyDescriptor(_, prop) {
    return Object.getOwnPropertyDescriptor(getFirebaseApp() as any, prop);
  },
  ownKeys() {
    return Reflect.ownKeys(getFirebaseApp());
  },
});

export const app = appProxy;
export default appProxy;
