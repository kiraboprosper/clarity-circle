import { Timestamp } from 'firebase/firestore';

export type PostAudience = 'circle' | 'public'; // 'circle' means accepted friends

/**
 * Represents a single post in a user's feed, designed for sharing progress.
 */
export interface Post {
  id: string;
  uid: string; // The author's user ID
  text?: string;
  imageUrl?: string;
  audience: PostAudience;
  relatedGoalId?: string; // Link a post to a specific goal
  relatedHabitId?: string; // Link a post to a specific habit
  likes: string[]; // Array of UIDs of users who liked the post
  commentCount: number;
  createdAt: Timestamp;
}