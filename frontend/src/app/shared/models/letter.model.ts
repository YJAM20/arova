export type LetterCategory = 'miss-me' | 'sad' | 'argument' | 'overthinking' | 'birthday' | 'reassurance' | 'future';

export interface Letter {
  id: string;
  title: string;
  body: string;
  category: LetterCategory;
  unlockDate?: string;
  passcode?: string;
  isLocked: boolean;
  isFavorite: boolean;
  visibleToPartner: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
