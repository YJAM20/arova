export type ReasonCategory = 'love' | 'trust' | 'choose-you' | 'miss-you' | 'future';
export type ReasonReactionType = 'heart' | 'smile' | 'cry' | 'saved' | 'favorite';

export interface ReasonReaction {
  userId: string;
  type: ReasonReactionType;
  createdAt: string;
}

export interface Reason {
  id: string;
  title: string;
  body: string;
  category: ReasonCategory;
  order: number;
  unlockDate?: string;
  isSecret: boolean;
  isFavorite: boolean;
  reactions?: ReasonReaction[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
