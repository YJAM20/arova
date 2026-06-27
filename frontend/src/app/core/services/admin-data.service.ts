import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { CoupleGoalService } from './couple-goal.service';
import { RelationshipPointsService } from './relationship-points.service';
import { Observable, of } from 'rxjs';
import { AdminEngagementOverview } from './admin-api.service';

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  constructor(
    private storage: StorageService,
    private coupleGoalService: CoupleGoalService,
    private pointsService: RelationshipPointsService
  ) {}

  getEngagementOverview(): Observable<AdminEngagementOverview> {
    const data = this.storage.getAll();
    const goals = this.coupleGoalService.getGoals();
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalPoints = this.pointsService.getTotalPoints();
    const activeStreak = this.pointsService.getStreak();
    const currentRank = this.pointsService.getCurrentRank().title;

    const totalMemories = data.memories ? data.memories.length : 0;
    const totalLetters = data.letters ? data.letters.length : 0;
    const totalReasons = data.reasons ? data.reasons.length : 0;
    const totalMoodEntries = data.moods ? data.moods.length : 0;
    const totalSongs = data.songs ? data.songs.length : 0;

    // Determine most used feature
    const features: Record<string, number> = {
      Memories: totalMemories,
      Letters: totalLetters,
      Reasons: totalReasons,
      Moods: totalMoodEntries,
      Songs: totalSongs,
      Goals: totalGoals,
    };
    let mostUsedFeature = 'None';
    let maxVal = -1;
    for (const [key, val] of Object.entries(features)) {
      if (val > maxVal) {
        maxVal = val;
        mostUsedFeature = key;
      }
    }
    if (maxVal <= 0) {
      mostUsedFeature = 'None';
    }

    // ActivityByFeature
    const activityByFeature = features;

    // ActivityByDay: count of ledger items per day over the last 7 days
    const activityByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      activityByDay[key] = 0;
    }

    const ledger = this.pointsService.getLedger() || [];
    ledger.forEach(entry => {
      if (entry.timestamp) {
        const dateKey = entry.timestamp.slice(0, 10);
        if (dateKey in activityByDay) {
          activityByDay[dateKey] += 1;
        }
      }
    });

    // LastActivityAt
    let lastActivityAt: string | null = null;
    const dates: string[] = [];
    if (data.updatedAt) dates.push(data.updatedAt);
    if (ledger.length > 0 && ledger[0].timestamp) {
      dates.push(ledger[0].timestamp);
    }
    if (dates.length > 0) {
      dates.sort();
      lastActivityAt = dates[dates.length - 1];
    }

    return of({
      totalMemories,
      totalLetters,
      totalReasons,
      totalMoodEntries,
      totalSongs,
      totalGoals,
      completedGoals,
      activeStreak,
      totalPoints,
      currentRank,
      mostUsedFeature,
      lastActivityAt,
      activityByFeature,
      activityByDay,
      limitations: [
        'Local Mode analytics are based on browser-local demo data.',
        'No End-to-End Encryption (E2EE) is active or claimed.',
        'Push notifications and billing are simulated previews only.',
      ]
    });
  }
}
