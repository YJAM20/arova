import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CoupleGoal, CoupleGoalMilestone, GoalCategory, GoalStatus } from '../../shared/models/couple-goal.model';
import { RelationshipPointsService } from './relationship-points.service';

const STORAGE_KEY = 'arova-couple-goals-v1';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

@Injectable({ providedIn: 'root' })
export class CoupleGoalService {
  constructor(
    private auth: AuthService,
    private pointsService: RelationshipPointsService
  ) {}

  getGoals(): CoupleGoal[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as CoupleGoal[];
    } catch {
      return [];
    }
  }

  saveGoals(goals: CoupleGoal[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }

  getGoalById(id: string): CoupleGoal | null {
    return this.getGoals().find(g => g.id === id) ?? null;
  }

  getVisibleGoalsForCurrentUser(): CoupleGoal[] {
    const goals = this.getGoals();
    const currentUserId = this.currentUserId();
    return goals.filter(g => !g.isPrivate || g.createdByUserId === currentUserId);
  }

  addGoal(input: {
    title: string;
    description?: string;
    category: GoalCategory;
    status: GoalStatus;
    targetDate?: string;
    isPrivate: boolean;
    progressPercent?: number;
  }): CoupleGoal {
    const goals = this.getGoals();
    const timestamp = new Date().toISOString();
    const goal: CoupleGoal = {
      ...input,
      id: `goal-${uid()}`,
      coupleId: 'local-couple',
      createdByUserId: this.currentUserId(),
      createdByDisplayName: this.currentUserDisplayName(),
      progressPercent: input.status === 'completed' ? 100 : (input.progressPercent ?? 0),
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: input.status === 'completed' ? timestamp : undefined,
      milestones: []
    };

    goals.unshift(goal);
    this.saveGoals(goals);

    // Gamification
    this.pointsService.awardPoints('Created couple goal', 15);
    if (goal.status === 'completed') {
      this.pointsService.awardPoints('Completed couple goal', 30);
    }

    return goal;
  }

  updateGoal(id: string, changes: Partial<CoupleGoal>): CoupleGoal | null {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) return null;

    const existing = goals[idx];
    if (!this.canEditGoal(existing)) return null;

    const wasCompleted = existing.status === 'completed';
    const now = new Date().toISOString();

    const updated: CoupleGoal = {
      ...existing,
      ...changes,
      id: existing.id,
      coupleId: existing.coupleId,
      createdByUserId: existing.createdByUserId,
      createdByDisplayName: existing.createdByDisplayName,
      createdAt: existing.createdAt,
      updatedAt: now
    };

    if (changes.status === 'completed') {
      updated.completedAt = existing.completedAt ?? now;
    } else {
      updated.completedAt = undefined;
    }

    // Recalculate progress
    this.recalculateProgress(updated, changes.progressPercent);

    goals[idx] = updated;
    this.saveGoals(goals);

    // Gamification
    if (!wasCompleted && updated.status === 'completed') {
      this.pointsService.awardPoints('Completed couple goal', 30);
    }

    return updated;
  }

  deleteGoal(id: string): boolean {
    const goals = this.getGoals();
    const existing = goals.find(g => g.id === id);
    if (!existing || !this.canEditGoal(existing)) return false;

    const filtered = goals.filter(g => g.id !== id);
    this.saveGoals(filtered);
    return true;
  }

  completeGoal(id: string): CoupleGoal | null {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) return null;

    const existing = goals[idx];
    if (!this.canEditGoal(existing)) return null;

    if (existing.status === 'completed') return existing;

    const now = new Date().toISOString();
    existing.status = 'completed';
    existing.completedAt = now;
    existing.updatedAt = now;
    existing.progressPercent = 100;

    // Mark milestones completed
    existing.milestones.forEach(m => {
      if (!m.isCompleted) {
        m.isCompleted = true;
        m.completedAt = now;
        m.updatedAt = now;
      }
    });

    goals[idx] = existing;
    this.saveGoals(goals);

    this.pointsService.awardPoints('Completed couple goal', 30);

    return existing;
  }

  // ─── Milestones ─────────────────────────────────────────────────────────

  createMilestone(goalId: string, title: string): CoupleGoalMilestone | null {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx === -1) return null;

    const goal = goals[idx];
    if (!this.canEditGoal(goal)) return null;

    const milestone: CoupleGoalMilestone = {
      id: `ms-${uid()}`,
      goalId: goal.id,
      title: title.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    goal.milestones.push(milestone);
    this.recalculateProgress(goal);

    goals[idx] = goal;
    this.saveGoals(goals);

    return milestone;
  }

  updateMilestone(goalId: string, milestoneId: string, changes: Partial<CoupleGoalMilestone>): CoupleGoalMilestone | null {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx === -1) return null;

    const goal = goals[idx];
    if (!this.canEditGoal(goal)) return null;

    const milestoneIdx = goal.milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIdx === -1) return null;

    const milestone = goal.milestones[milestoneIdx];
    const wasCompleted = milestone.isCompleted;
    const now = new Date().toISOString();

    const updatedMilestone: CoupleGoalMilestone = {
      ...milestone,
      ...changes,
      id: milestone.id,
      goalId: milestone.goalId,
      createdAt: milestone.createdAt,
      updatedAt: now
    };

    if (changes.isCompleted !== undefined) {
      updatedMilestone.completedAt = changes.isCompleted ? now : undefined;
    }

    goal.milestones[milestoneIdx] = updatedMilestone;

    const wasGoalCompleted = goal.status === 'completed';
    this.recalculateProgress(goal);

    goals[idx] = goal;
    this.saveGoals(goals);

    // Gamification
    if (!wasCompleted && updatedMilestone.isCompleted) {
      this.pointsService.awardPoints('Completed goal milestone', 5);
    }
    if (!wasGoalCompleted && goal.status === 'completed') {
      this.pointsService.awardPoints('Completed couple goal', 30);
    }

    return updatedMilestone;
  }

  deleteMilestone(goalId: string, milestoneId: string): boolean {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx === -1) return false;

    const goal = goals[idx];
    if (!this.canEditGoal(goal)) return false;

    const before = goal.milestones.length;
    goal.milestones = goal.milestones.filter(m => m.id !== milestoneId);
    if (goal.milestones.length === before) return false;

    this.recalculateProgress(goal);

    goals[idx] = goal;
    this.saveGoals(goals);
    return true;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  canEditGoal(goal: CoupleGoal): boolean {
    return goal.createdByUserId === this.currentUserId();
  }

  private currentUserId(): string {
    return this.auth.getCurrentUser()?.id ?? 'user-owner';
  }

  private currentUserDisplayName(): string {
    return this.auth.getCurrentUser()?.displayName ?? 'Partner A';
  }

  private recalculateProgress(goal: CoupleGoal, manualProgress?: number): void {
    if (goal.milestones.length > 0) {
      const completed = goal.milestones.filter(m => m.isCompleted).length;
      const total = goal.milestones.length;
      goal.progressPercent = Math.round((completed / total) * 100 * 100) / 100;

      if (completed === total && total > 0) {
        if (goal.status !== 'completed') {
          goal.status = 'completed';
          goal.completedAt = new Date().toISOString();
        }
      } else if (goal.status === 'completed') {
        goal.status = 'in-progress';
        goal.completedAt = undefined;
      } else if (completed > 0 && goal.status === 'not-started') {
        goal.status = 'in-progress';
        goal.completedAt = undefined;
      }
    } else {
      if (goal.status === 'completed') {
        goal.progressPercent = 100;
      } else {
        goal.progressPercent = Math.min(100, Math.max(0, manualProgress ?? goal.progressPercent));
      }
    }
  }
}
