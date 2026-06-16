import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface PointsLedgerEntry {
  id: string;
  action: string;
  points: number;
  timestamp: string;
}

export interface RelationshipPointsState {
  totalPoints: number;
  streak: number;
  lastActiveDate: string;
  ledger: PointsLedgerEntry[];
}

export interface RankInfo {
  title: string;
  minPoints: number;
  maxPoints: number;
}

const RANKS: RankInfo[] = [
  { title: 'Spark', minPoints: 0, maxPoints: 99 },
  { title: 'Warmth', minPoints: 100, maxPoints: 249 },
  { title: 'Orbit', minPoints: 250, maxPoints: 499 },
  { title: 'Bond', minPoints: 500, maxPoints: 999 },
  { title: 'Constellation', minPoints: 1000, maxPoints: 1749 },
  { title: 'Gravity', minPoints: 1750, maxPoints: 2999 },
  { title: 'Eclipse', minPoints: 3000, maxPoints: 4999 },
  { title: 'Eternal Orbit', minPoints: 5000, maxPoints: 999999 },
];

const POINTS_KEY = 'arova-relationship-points-v1';

@Injectable({ providedIn: 'root' })
export class RelationshipPointsService {
  private state: RelationshipPointsState = {
    totalPoints: 0,
    streak: 0,
    lastActiveDate: '',
    ledger: [],
  };

  constructor(private storage: StorageService) {
    this.loadState();
    this.verifyStreak();
  }

  private loadState(): void {
    const raw = localStorage.getItem(POINTS_KEY);
    if (raw) {
      try {
        this.state = JSON.parse(raw);
        if (!this.state.ledger) this.state.ledger = [];
      } catch {
        this.resetState();
      }
    } else {
      this.resetState();
    }
  }

  private resetState(): void {
    this.state = {
      totalPoints: 0,
      streak: 0,
      lastActiveDate: '',
      ledger: [],
    };
    this.saveState();
  }

  private saveState(): void {
    localStorage.setItem(POINTS_KEY, JSON.stringify(this.state));
  }

  getTotalPoints(): number {
    return this.state.totalPoints;
  }

  getStreak(): number {
    return this.state.streak;
  }

  getLedger(): PointsLedgerEntry[] {
    return this.state.ledger;
  }

  getCurrentRank(): RankInfo {
    const pts = this.state.totalPoints;
    return RANKS.find(r => pts >= r.minPoints && pts <= r.maxPoints) ?? RANKS[0];
  }

  getNextRank(): RankInfo | null {
    const currentIdx = RANKS.findIndex(r => this.state.totalPoints >= r.minPoints && this.state.totalPoints <= r.maxPoints);
    if (currentIdx !== -1 && currentIdx < RANKS.length - 1) {
      return RANKS[currentIdx + 1];
    }
    return null;
  }

  getProgressPercent(): number {
    const current = this.getCurrentRank();
    const next = this.getNextRank();
    if (!next) return 100;
    const range = next.minPoints - current.minPoints;
    const progress = this.state.totalPoints - current.minPoints;
    return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  awardPoints(action: string, amount: number): void {
    const dateStr = new Date().toISOString().slice(0, 10);
    
    // Update streak on check-in or daily task completion
    if (this.state.lastActiveDate !== dateStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      
      if (this.state.lastActiveDate === yesterdayStr) {
        this.state.streak += 1;
      } else {
        this.state.streak = 1;
      }
      this.state.lastActiveDate = dateStr;
    }

    this.state.totalPoints += amount;
    const entry: PointsLedgerEntry = {
      id: `pts-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      points: amount,
      timestamp: new Date().toISOString(),
    };
    this.state.ledger.unshift(entry);
    if (this.state.ledger.length > 50) {
      this.state.ledger.pop();
    }
    this.saveState();
  }

  private verifyStreak(): void {
    const dateStr = new Date().toISOString().slice(0, 10);
    if (this.state.lastActiveDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      
      if (this.state.lastActiveDate !== dateStr && this.state.lastActiveDate !== yesterdayStr) {
        // missed a day, reset streak
        this.state.streak = 0;
        this.saveState();
      }
    }
  }

  // Hook-up helper rewards
  rewardPlanetComplete(): void {
    this.awardPoints('Completed daily planet ritual', 50);
  }

  rewardDailyQuestion(): void {
    this.awardPoints('Answered daily question', 15);
  }

  rewardMemoryCreated(): void {
    this.awardPoints('Preserved a new memory', 20);
  }

  rewardLetterWritten(): void {
    this.awardPoints('Deposited letter in vault', 25);
  }

  rewardChatMessage(): void {
    this.awardPoints('Sent chat message', 2);
  }

  rewardReasonReaction(): void {
    this.awardPoints('Reacted to reason listing', 5);
  }

  rewardMoodCheck(): void {
    this.awardPoints('Shared mood check-in', 10);
  }

  rewardChallengeComplete(): void {
    this.awardPoints('Finished relationship challenge', 30);
  }

  rewardFuturePlanCreated(): void {
    this.awardPoints('Added future board listing', 15);
  }
}
