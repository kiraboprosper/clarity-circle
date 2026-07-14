import type { User } from "firebase/auth";
import type { UserProfile } from "../types";

export function buildFallbackProfile(user: Pick<User, "uid" | "email" | "displayName" | "photoURL">): UserProfile {
  const fallbackBase = (user.displayName || user.email || "member")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "") || "member";
  const fallbackUsername = fallbackBase.split("_")[0] || "member";

  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "Clarity Member",
    username: fallbackUsername,
    photoURL: user.photoURL || null,
    bio: "",
    role: "user",
    subscriptionTier: "free",
    subscriptionExpiry: null,
    points: 0,
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
    joinedAt: null as never,
    lastActiveAt: null as never,
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
    age: null,
    ageVerified: false,
  };
}
