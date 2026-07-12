import { Timestamp } from 'firebase/firestore';

/**
 * Represents a single ephemeral story item. A user can have multiple story items.
 */
export interface Story {
  id: string;
  uid: string; // The author's user ID
  imageUrl: string;
  expiresAt: Timestamp; // Typically 24 hours from creation
  viewedBy: string[]; // Array of UIDs of users who have viewed the story
  createdAt: Timestamp;
}