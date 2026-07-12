import { Timestamp } from 'firebase/firestore';

// Using a union of strings for mood to allow for easy extension.
export type Mood = 'rad' | 'good' | 'meh' | 'bad' | 'awful';

/**
 * Represents a single journal entry in the 'journal' collection.
 */
export interface JournalEntry {
  id: string;
  uid: string; // The owner's user ID
  date: Timestamp; // The date the entry is for (e.g., user is writing about yesterday)
  content: any; // JSON content from the rich-text editor (e.g., Tiptap)
  mood?: Mood;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}