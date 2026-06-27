import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GamificationService } from './gamification.service';
import { StorageService } from './storage.service';
import { AppModeService } from './app-mode.service';
import { ActivityDay } from '../../shared/models/activity-day.model';

export function calculateStreak(dates: string[], today: Date = new Date()): number {
  if (!dates || dates.length === 0) return 0;
  
  // Normalize and clean dates
  const uniqueDates = Array.from(new Set(dates.map(d => d.slice(0, 10))))
    .sort((a, b) => b.localeCompare(a)); // Descending order
    
  const todayStr = formatDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);
  
  const mostRecent = uniqueDates[0];
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }
  
  let streak = 0;
  let expectedStr = mostRecent;
  const expectedDate = new Date(expectedStr);
  
  for (const dateStr of uniqueDates) {
    if (dateStr === expectedStr) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
      expectedStr = formatDateStr(expectedDate);
    } else {
      break;
    }
  }
  
  return streak;
}

export function groupActivityByDate(
  ledgerEntries: { timestamp: string; points: number; action: string }[],
  localFeatures: { date: string; type: string }[]
): ActivityDay[] {
  const activityMap = new Map<string, { count: number; points: number; types: Set<string> }>();
  
  // 1. Group ledger entries
  for (const entry of ledgerEntries) {
    if (!entry.timestamp) continue;
    const date = entry.timestamp.slice(0, 10);
    if (!activityMap.has(date)) {
      activityMap.set(date, { count: 0, points: 0, types: new Set() });
    }
    const day = activityMap.get(date)!;
    day.count++;
    day.points += (entry.points || 0);
    day.types.add(entry.action || 'points_award');
  }
  
  // 2. Group local features only for dates that do NOT have ledger entries
  for (const item of localFeatures) {
    if (!item.date) continue;
    const date = item.date.slice(0, 10);
    if (!activityMap.has(date)) {
      activityMap.set(date, { count: 0, points: 0, types: new Set() });
    }
    const day = activityMap.get(date)!;
    if (day.points === 0 && day.count === 0) {
      day.count++;
      day.types.add(item.type);
    }
  }
  
  return Array.from(activityMap.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      points: data.points,
      types: Array.from(data.types),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Injectable({ providedIn: 'root' })
export class RelationshipActivityService {
  constructor(
    private gamification: GamificationService,
    private storage: StorageService,
    private appMode: AppModeService
  ) {}

  getActivityDays(): Observable<ActivityDay[]> {
    return this.gamification.getLedger().pipe(
      map(ledger => {
        if (this.appMode.isLocalMode()) {
          // Gather local features
          const localFeatures: { date: string; type: string }[] = [];
          
          try {
            const memories = this.storage.getMemories();
            memories.forEach(m => localFeatures.push({ date: m.date || m.createdAt, type: 'Memory' }));
          } catch {}

          try {
            const reasons = this.storage.getReasons();
            reasons.forEach(r => localFeatures.push({ date: r.createdAt, type: 'Reason' }));
          } catch {}

          try {
            const letters = this.storage.getLetters();
            letters.forEach(l => localFeatures.push({ date: l.createdAt, type: 'Letter' }));
          } catch {}

          try {
            const moods = this.storage.getMoods();
            moods.forEach(m => localFeatures.push({ date: m.date || m.createdAt, type: 'Mood' }));
          } catch {}

          try {
            const songs = this.storage.getSongs();
            songs.forEach(s => localFeatures.push({ date: s.createdAt, type: 'Song' }));
          } catch {}

          try {
            const plans = this.storage.getFuturePlans();
            plans.forEach(p => localFeatures.push({ date: p.createdAt, type: 'FuturePlan' }));
          } catch {}

          try {
            const answers = this.storage.getDailyQuestionAnswers();
            answers.forEach(a => localFeatures.push({ date: a.dateKey || a.createdAt, type: 'DailyQuestion' }));
          } catch {}

          try {
            const checkIns = this.storage.getCheckIns();
            checkIns.forEach(c => localFeatures.push({ date: c.dateKey || c.createdAt, type: 'CheckIn' }));
          } catch {}

          try {
            const dates = this.storage.getImportantDates();
            dates.forEach(d => localFeatures.push({ date: d.createdAt, type: 'ImportantDate' }));
          } catch {}
          
          return groupActivityByDate(ledger, localFeatures);
        } else {
          // API Mode - use ledger only (single request)
          return groupActivityByDate(ledger, []);
        }
      })
    );
  }
}
