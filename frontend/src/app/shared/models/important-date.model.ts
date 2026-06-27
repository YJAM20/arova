export type ImportantDateType = 'anniversary' | 'birthday' | 'first-moment' | 'future-plan' | 'letter-unlock' | 'custom';
export type RecurrenceType = 'none' | 'yearly' | 'monthly';

export interface ImportantDate {
  id: string;
  coupleId: string;
  createdByUserId: string;
  title: string;
  description?: string;
  date: string;
  type: ImportantDateType;
  recurrence: RecurrenceType;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  isPrivate: boolean;
  daysRemaining?: number;
  nextOccurrenceDate?: string;
  createdAt: string;
  updatedAt?: string;
}
