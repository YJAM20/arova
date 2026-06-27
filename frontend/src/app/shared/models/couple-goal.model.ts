export type GoalCategory =
  | 'relationship'
  | 'travel'
  | 'health'
  | 'finance'
  | 'creative'
  | 'home'
  | 'learning'
  | 'custom';

export type GoalStatus = 'not-started' | 'in-progress' | 'paused' | 'completed';

export interface CoupleGoalMilestone {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CoupleGoal {
  id: string;
  coupleId: string;
  createdByUserId: string;
  createdByDisplayName?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  targetDate?: string;
  progressPercent: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  milestones: CoupleGoalMilestone[];
}
