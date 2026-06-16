import { MoodType } from './mood.model';

export interface Song {
  id: string;
  title: string;
  artist?: string;
  audioUrl?: string;
  coverUrl?: string;
  mood?: MoodType;
  memoryId?: string;
  isFavorite: boolean;
  sourceName?: string;
  sourceUrl?: string;
  license?: string;
  attribution?: string;
  createdAt: string;
}
