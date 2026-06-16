export type MemoryCategory = 'firsts' | 'funny' | 'deep' | 'romantic' | 'special-day' | 'random';

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
  category: MemoryCategory;
  mood?: string;
  songId?: string;
  privateNote?: string;
  visibleToPartner: boolean;
  isFavorite: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
