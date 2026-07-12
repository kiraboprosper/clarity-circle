import { Timestamp } from 'firebase/firestore';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

/**
 * Represents the relationship between two users.
 * The document ID should be a composite of the two user UIDs, sorted alphabetically.
 * e.g., `${uid1}_${uid2}`
 */
export interface Friendship {
  id: string;
  userIds: string[]; // Array containing the two user UIDs
  status: FriendshipStatus;
  requesterId: string; // The UID of the user who initiated the request
  createdAt: Timestamp;
  updatedAt: Timestamp;
}