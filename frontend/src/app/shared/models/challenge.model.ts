export type ChallengeCategory =
  | 'romantic'
  | 'funny'
  | 'deep'
  | 'reassurance'
  | 'memory'
  | 'future'
  | 'random';

export interface ChallengeCompletion {
  userId: string;
  answer?: string;
  completedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  isDaily: boolean;
  completedBy: ChallengeCompletion[];
  createdAt: string;
}
