import { Timestamp } from 'firebase/firestore';

export type GoalStatus = 'not-started' | 'in-progress' | 'completed' | 'archived';
export type GoalPriority = 'low' | 'medium' | 'high';

/**
 * Represents a single sub-task or checkpoint within a larger goal.
 */
export interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * Represents a user-defined goal in the 'goals' collection.
 */
export interface Goal {
  id: string;
  uid: string; // The owner's user ID
  name: string;
  description?: string;
  category: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number; // Percentage from 0 to 100, calculated from milestones
  milestones: Milestone[];
  deadline?: Timestamp;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}