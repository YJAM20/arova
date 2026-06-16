import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import {
  FuturePlan,
  FuturePlanStatus,
} from '../../shared/models/future-plan.model';

export type FuturePlanInput = Omit<FuturePlan, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

import { RelationshipPointsService } from './relationship-points.service';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable({ providedIn: 'root' })
export class FuturePlanService {
  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private pointsService: RelationshipPointsService
  ) {}

  getFuturePlans(): FuturePlan[] {
    return this.storage.getFuturePlans();
  }

  getFuturePlanById(id: string): FuturePlan | null {
    return this.getFuturePlans().find(plan => plan.id === id) ?? null;
  }

  getVisibleFuturePlansForCurrentUser(): FuturePlan[] {
    const plans = this.getFuturePlans();
    return this.auth.isAdmin()
      ? plans
      : plans.filter(plan => plan.status !== 'secret' || this.isOwner(plan));
  }

  getPlansByStatus(status: FuturePlanStatus): FuturePlan[] {
    return this.getVisibleFuturePlansForCurrentUser().filter(plan => plan.status === status);
  }

  addFuturePlan(input: FuturePlanInput): FuturePlan {
    const data = this.storage.loadFullAppData();
    const timestamp = nowIso();
    const plan: FuturePlan = {
      ...input,
      status: this.auth.isAdmin() ? input.status : input.status === 'secret' ? 'one-day' : input.status,
      createdBy: this.currentUserId(),
      id: `future-${uid()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    data.futurePlans.unshift(plan);
    this.storage.saveFullAppData(data);
    this.pointsService.rewardFuturePlanCreated();
    return plan;
  }

  updateFuturePlan(id: string, changes: Partial<FuturePlan>): FuturePlan | null {
    const data = this.storage.loadFullAppData();
    let updated: FuturePlan | null = null;
    const existing = data.futurePlans.find(plan => plan.id === id);
    if (!existing || !this.canEditFuturePlan(existing)) return null;

    data.futurePlans = data.futurePlans.map(plan => {
      if (plan.id !== id) return plan;
      const safeChanges = !this.auth.isAdmin() && changes.status === 'secret'
        ? { ...changes, status: plan.status }
        : changes;
      updated = {
        ...plan,
        ...safeChanges,
        id: plan.id,
        createdBy: plan.createdBy,
        createdAt: plan.createdAt,
        updatedAt: nowIso(),
      };
      return updated;
    });

    if (!updated) return null;
    this.storage.saveFullAppData(data);
    return updated;
  }

  deleteFuturePlan(id: string): boolean {
    const data = this.storage.loadFullAppData();
    const existing = data.futurePlans.find(plan => plan.id === id);
    if (!existing || !this.canEditFuturePlan(existing)) return false;
    const before = data.futurePlans.length;
    data.futurePlans = data.futurePlans.filter(plan => plan.id !== id);
    if (data.futurePlans.length === before) return false;

    this.storage.saveFullAppData(data);
    return true;
  }

  markAsDone(id: string): FuturePlan | null {
    return this.updateFuturePlan(id, { status: 'done' });
  }

  canEditFuturePlan(plan: FuturePlan): boolean {
    return this.auth.isAdmin() || this.isOwner(plan);
  }

  private isOwner(plan: FuturePlan): boolean {
    return plan.createdBy === this.currentUserId();
  }

  private currentUserId(): string {
    return this.auth.getCurrentUser()?.id ?? 'user-owner';
  }
}
