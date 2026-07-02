import { Timestamp } from "firebase/firestore";

// â”€â”€â”€ User â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SubscriptionTier = "free" | "clarity_plus" | "family" | "business";
export type UserRole = "user" | "moderator" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string | null;
  bio: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry: Timestamp | null;
  points: number;
  level: number;
  xp: number;
  growthStage: GrowthStage;
  isPrivate: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  habitStreak: number;
  longestStreak: number;
  joinedAt: Timestamp;
  lastActiveAt: Timestamp;
  onboardingCompleted: boolean;
  blockedUsers: string[];
  theme: ThemePreference;
  notificationSettings: NotificationSettings;
  age: number | null;
  ageVerified: boolean;
}

export type GrowthStage = "seed" | "sprout" | "bloom" | "flourish" | "radiant";
export type ThemePreference = "light" | "dark" | "system";

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  challenges: boolean;
  directMessages: boolean;
  communityUpdates: boolean;
}

// â”€â”€â”€ Post â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PostType = "text" | "image" | "habit_share" | "challenge_update" | "garden_share";

export interface Post {
  id: string;
  authorId: string;
  author: Pick<UserProfile, "uid" | "displayName" | "username" | "photoURL" | "isVerified">;
  type: PostType;
  content: string;
  mediaURLs: string[];
  likesCount: number;
  commentsCount: number;
  likedBy: string[];
  tags: string[];
  challengeRef: string | null;
  habitRef: string | null;
  isReported: boolean;
  isHidden: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: Pick<UserProfile, "uid" | "displayName" | "username" | "photoURL">;
  content: string;
  likesCount: number;
  likedBy: string[];
  isReported: boolean;
  parentCommentId: string | null;
  createdAt: Timestamp;
}

// â”€â”€â”€ Habits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type HabitFrequency = "daily" | "weekly";
export type HabitCategory = "health" | "mindset" | "learning" | "faith" | "creativity" | "social" | "finance";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays: number[];
  streak: number;
  longestStreak: number;
  completedDates: string[];
  totalCompletions: number;
  pointsPerCompletion: number;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: Timestamp;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Timestamp;
  note: string;
  pointsEarned: number;
}

// â”€â”€â”€ Challenges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ChallengeStatus = "upcoming" | "active" | "completed" | "archived";
export type ChallengeDifficulty = "beginner" | "intermediate" | "advanced";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  coverImageURL: string;
  category: HabitCategory;
  tasks: ChallengeTask[];
  pointsReward: number;
  badgeReward: string | null;
  participantsCount: number;
  isPremium: boolean;
  createdAt: Timestamp;
  startsAt: Timestamp | null;
  endsAt: Timestamp | null;
}

export interface ChallengeTask {
  day: number;
  title: string;
  description: string;
  pointsReward: number;
}

export interface ChallengeProgress {
  id: string;
  challengeId: string;
  userId: string;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  currentDay: number;
  completedDays: number[];
  totalPointsEarned: number;
  status: "active" | "completed" | "abandoned";
}

// â”€â”€â”€ Points & Rewards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type PointEventType =
  | "account_created"
  | "onboarding_completed"
  | "daily_login"
  | "habit_completed"
  | "helpful_comment"
  | "post_created"
  | "challenge_completed"
  | "referral"
  | "reward_redeemed";

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: PointEventType;
  description: string;
  referenceId: string | null;
  createdAt: Timestamp;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: "theme" | "badge" | "discount" | "premium_trial";
  pointsCost: number;
  imageURL: string;
  discountAmount: number | null;
  isPremiumOnly: boolean;
  stock: number | null;
  expiresAt: Timestamp | null;
}

// â”€â”€â”€ Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Conversation {
  id: string;
  type: "direct" | "group";
  participants: string[];
  participantProfiles: Pick<UserProfile, "uid" | "displayName" | "photoURL">[];
  lastMessage: string;
  lastMessageAt: Timestamp;
  lastMessageBy: string;
  unreadCounts: Record<string, number>;
  name: string | null;
  avatarURL: string | null;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderProfile: Pick<UserProfile, "uid" | "displayName" | "photoURL">;
  content: string;
  mediaURLs: string[];
  isRead: boolean;
  readBy: string[];
  isDeleted: boolean;
  isReported: boolean;
  createdAt: Timestamp;
}

// â”€â”€â”€ Store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Product {
  id: string;
  printifyId: string;
  name: string;
  description: string;
  imageURLs: string[];
  price: number;
  category: string;
  season: string;
  stock: number;
  isActive: boolean;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  discountApplied: number;
  pointsUsed: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: ShippingAddress;
  printifyOrderId: string | null;
  createdAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageURL: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// â”€â”€â”€ Safety / Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ReportReason = "bullying" | "harassment" | "hate_speech" | "spam" | "scam" | "inappropriate";
export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";
export type ReportTarget = "post" | "comment" | "message" | "profile";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  targetUserId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: Timestamp | null;
  actionTaken: string | null;
  createdAt: Timestamp;
}

// â”€â”€â”€ Growth Garden â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Garden {
  id: string;
  userId: string;
  stage: GrowthStage;
  flowers: GardenFlower[];
  totalWatered: number;
  lastWateredAt: Timestamp | null;
}

export interface GardenFlower {
  id: string;
  type: string;
  bloomedAt: Timestamp;
  habitId: string | null;
  challengeId: string | null;
}

// â”€â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type NotificationType = "like" | "comment" | "follow" | "challenge" | "reward" | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  actorProfile: Pick<UserProfile, "uid" | "displayName" | "photoURL"> | null;
  createdAt: Timestamp;
}

