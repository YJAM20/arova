import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import {
  Challenge,
  ChallengeCategory,
  ChallengeCompletion,
} from '../../shared/models/challenge.model';

export type ChallengeInput = Omit<Challenge, 'id' | 'completedBy' | 'createdAt'>;

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowIso(): string {
  return new Date().toISOString();
}

function todayIndex(length: number): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return length > 0 ? seed % length : 0;
}

import { GamificationService } from './gamification.service';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private gamification: GamificationService
  ) {}

  getChallenges(): Challenge[] {
    return this.storage.getChallenges();
  }

  getChallengeById(id: string): Challenge | null {
    return this.getChallenges().find(challenge => challenge.id === id) ?? null;
  }

  getDailyChallenge(): Challenge | null {
    const daily = this.getChallenges().filter(challenge => challenge.isDaily);
    const source = daily.length > 0 ? daily : this.getChallenges();
    if (source.length === 0) return null;
    return source[todayIndex(source.length)];
  }

  getChallengesByCategory(category: ChallengeCategory): Challenge[] {
    return this.getChallenges().filter(challenge => challenge.category === category);
  }

  completeChallenge(id: string, answer?: string): Challenge | null {
    const user = this.auth.getCurrentUser();
    if (!user) return null;

    const existingChallenge = this.getChallengeById(id);
    if (!existingChallenge) return null;
    const alreadyCompleted = existingChallenge.completedBy.some(item => item.userId === user.id);

    const data = this.storage.loadFullAppData();
    let updated: Challenge | null = null;
    const completion: ChallengeCompletion = {
      userId: user.id,
      answer: answer?.trim() ? answer.trim() : undefined,
      completedAt: nowIso(),
    };

    data.challenges = data.challenges.map(challenge => {
      if (challenge.id !== id) return challenge;

      const completions = challenge.completedBy.filter(item => item.userId !== user.id);
      updated = {
        ...challenge,
        completedBy: [...completions, completion],
      };
      return updated;
    });

    if (!updated) return null;
    this.storage.saveFullAppData(data);
    if (!alreadyCompleted) {
      this.gamification.rewardChallengeComplete();
    }
    return updated;
  }

  getCompletedChallenges(): Challenge[] {
    const user = this.auth.getCurrentUser();
    if (!user) return [];
    return this.getChallenges().filter(challenge =>
      challenge.completedBy.some(item => item.userId === user.id)
    );
  }

  getPendingChallenges(): Challenge[] {
    const user = this.auth.getCurrentUser();
    if (!user) return this.getChallenges();
    return this.getChallenges().filter(
      challenge => !challenge.completedBy.some(item => item.userId === user.id)
    );
  }

  addChallenge(input: ChallengeInput): Challenge {
    const data = this.storage.loadFullAppData();
    const challenge: Challenge = {
      ...input,
      id: `chg-${uid()}`,
      completedBy: [],
      createdAt: nowIso(),
    };

    data.challenges.unshift(challenge);
    this.storage.saveFullAppData(data);
    return challenge;
  }

  updateChallenge(id: string, changes: Partial<Challenge>): Challenge | null {
    const data = this.storage.loadFullAppData();
    let updated: Challenge | null = null;

    data.challenges = data.challenges.map(challenge => {
      if (challenge.id !== id) return challenge;
      updated = {
        ...challenge,
        ...changes,
        id: challenge.id,
        completedBy: changes.completedBy ?? challenge.completedBy,
        createdAt: challenge.createdAt,
      };
      return updated;
    });

    if (!updated) return null;
    this.storage.saveFullAppData(data);
    return updated;
  }

  deleteChallenge(id: string): boolean {
    const data = this.storage.loadFullAppData();
    const before = data.challenges.length;
    data.challenges = data.challenges.filter(challenge => challenge.id !== id);
    if (data.challenges.length === before) return false;

    this.storage.saveFullAppData(data);
    return true;
  }
}
