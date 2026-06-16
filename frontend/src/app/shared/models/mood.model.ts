export type MoodType =
  | 'happy'
  | 'tired'
  | 'missing-you'
  | 'overthinking'
  | 'silent'
  | 'need-attention'
  | 'sad'
  | 'excited'
  | 'angry-but-soft'
  | 'need-reassurance';

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodType;
  note?: string;
  response?: string;
  date: string;
  createdAt: string;
}
