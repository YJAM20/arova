import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { MoodEntry, MoodType } from '../../shared/models/mood.model';

import { RelationshipPointsService } from './relationship-points.service';

const MOOD_MESSAGES: Record<MoodType, string> = {
  happy: 'I love seeing your heart light up. Stay in this softness for a while.',
  tired: 'Rest without guilt. You do not have to earn tenderness here.',
  'missing-you': 'Distance does not make you less close to me.',
  overthinking: 'Nothing changed. I still choose you. Breathe.',
  silent: 'You can be quiet here. I will not mistake your silence for absence.',
  'need-attention': 'Come closer. You are allowed to want care and to ask for it.',
  sad: 'I am here with you, even in the heavy parts. You do not have to carry this alone.',
  excited: 'Tell me everything. Your joy has a place here.',
  'angry-but-soft': 'Even when it is messy, your heart is safe here. We can be gentle and honest.',
  'need-reassurance': 'You are not a burden. You are loved here.',
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class MoodService {
  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private pointsService: RelationshipPointsService
  ) {}

  getMoodHistory(): MoodEntry[] {
    return [...this.storage.getMoods()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getTodayMoodForCurrentUser(): MoodEntry | null {
    const user = this.auth.getCurrentUser();
    if (!user) return null;

    const today = todayKey();
    return (
      this.getMoodHistory().find(entry => entry.userId === user.id && entry.date === today) ?? null
    );
  }

  setTodayMood(mood: MoodType, note?: string): MoodEntry {
    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('A user must be logged in to save a mood.');
    }

    const today = todayKey();
    const cleanNote = note?.trim() ? note.trim() : undefined;
    const existing = this.getTodayMoodForCurrentUser();

    if (!existing) {
      const entry = this.storage.addMood({
        userId: user.id,
        mood,
        note: cleanNote,
        date: today,
      });
      this.pointsService.rewardMoodCheck();
      return entry;
    }

    const data = this.storage.loadFullAppData();
    let updated: MoodEntry = {
      ...existing,
      mood,
      note: cleanNote,
      date: today,
    };

    data.moods = data.moods.map(entry => {
      if (entry.id !== existing.id) return entry;
      updated = { ...entry, mood, note: cleanNote, date: today };
      return updated;
    });

    this.storage.saveFullAppData(data);
    return updated;
  }

  respondToMood(entryId: string, response: string): MoodEntry | null {
    return this.storage.updateMoodResponse(entryId, response);
  }

  getMoodMessage(mood: MoodType): string {
    return MOOD_MESSAGES[mood];
  }
}
