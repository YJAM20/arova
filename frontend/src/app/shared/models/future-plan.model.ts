export type FuturePlanType = 'travel' | 'movie' | 'food' | 'date' | 'dream' | 'promise' | 'learning';

export type FuturePlanStatus = 'one-day' | 'planned' | 'in-progress' | 'done' | 'secret';

export type Priority = 'low' | 'medium' | 'high';

export interface FuturePlan {
  id: string;
  title: string;
  description?: string;
  type: FuturePlanType;
  status: FuturePlanStatus;
  targetDate?: string;
  priority: Priority;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
