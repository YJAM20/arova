export type DailyQuestionCategory =
  | 'connection'
  | 'fun'
  | 'deep'
  | 'appreciation'
  | 'future'
  | 'conflict-safe';

export interface DailyQuestion {
  id: string;
  category: DailyQuestionCategory;
  prompt: string;
}

export interface DailyQuestionAnswer {
  id: string;
  questionId: string;
  dateKey: string;
  userId: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}
