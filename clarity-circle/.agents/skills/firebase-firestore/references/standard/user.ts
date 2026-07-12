import { Timestamp } from 'firebase/firestore';

/**
 * Represents the public-facing user profile data.
 * This data can be stored in a separate `profiles` collection or denormalized.
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
  username: string; // A unique, user-settable handle
  bio?: string;
}

/**
 * Represents the main user document in the 'users' collection.
 * Contains private and sensitive information.
 */
export interface User {
  uid: string; // Firebase Auth UID
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin'; // Role for RBAC
  createdAt: Timestamp;
  stripeCustomerId?: string; // For future payment integrations
  points: number; // For the points economy
  onboardingCompleted?: boolean;
  onboardingData?: {
    goals?: string[];
    interests?: string[];
  };
}