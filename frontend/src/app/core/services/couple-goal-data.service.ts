import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toFriendlyError as friendlyErrorHelper } from './error-handler.utils';
import { CoupleGoal, CoupleGoalMilestone, GoalCategory, GoalStatus } from '../../shared/models/couple-goal.model';
import { AppModeService } from './app-mode.service';
import { AuthService } from './auth.service';
import { CoupleGoalApiService, CoupleGoalApiResponse, CoupleGoalMilestoneApiResponse } from './couple-goal-api.service';
import { CoupleGoalService } from './couple-goal.service';
import { TokenStorageService } from './token-storage.service';

const VALID_CATEGORIES: GoalCategory[] = ['relationship', 'travel', 'health', 'finance', 'creative', 'home', 'learning', 'custom'];
const VALID_STATUSES: GoalStatus[] = ['not-started', 'in-progress', 'paused', 'completed'];

@Injectable({ providedIn: 'root' })
export class CoupleGoalDataService {
  constructor(
    private appMode: AppModeService,
    private auth: AuthService,
    private localGoals: CoupleGoalService,
    private goalApi: CoupleGoalApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getGoals(): Observable<CoupleGoal[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.getVisibleGoalsForCurrentUser());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.getGoals().pipe(
      map(goals => goals.map(g => this.fromApi(g))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getGoalById(id: string): Observable<CoupleGoal | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.getGoalById(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.getGoalById(id).pipe(
      map(goal => this.fromApi(goal)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  addGoal(input: {
    title: string;
    description?: string;
    category: GoalCategory;
    status: GoalStatus;
    targetDate?: string;
    isPrivate: boolean;
    progressPercent?: number;
  }): Observable<CoupleGoal> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.addGoal(input));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.createGoal({
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      status: input.status,
      targetDate: input.targetDate ?? null,
      isPrivate: input.isPrivate,
      progressPercent: input.progressPercent
    }).pipe(
      map(g => this.fromApi(g)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateGoal(id: string, changes: Partial<CoupleGoal>): Observable<CoupleGoal | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.updateGoal(id, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.updateGoal(id, {
      title: changes.title,
      description: changes.description ?? null,
      category: changes.category,
      status: changes.status,
      targetDate: changes.targetDate ?? null,
      isPrivate: changes.isPrivate,
      progressPercent: changes.progressPercent
    }).pipe(
      map(g => this.fromApi(g)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteGoal(id: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.deleteGoal(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.deleteGoal(id).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  completeGoal(id: string): Observable<CoupleGoal | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.completeGoal(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.completeGoal(id).pipe(
      map(g => this.fromApi(g)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  createMilestone(goalId: string, title: string): Observable<CoupleGoalMilestone | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.createMilestone(goalId, title));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.createMilestone(goalId, { title }).pipe(
      map(m => this.fromMilestoneApi(m)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateMilestone(goalId: string, milestoneId: string, changes: Partial<CoupleGoalMilestone>): Observable<CoupleGoalMilestone | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.updateMilestone(goalId, milestoneId, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.updateMilestone(goalId, milestoneId, {
      title: changes.title ?? '',
      isCompleted: changes.isCompleted ?? false
    }).pipe(
      map(m => this.fromMilestoneApi(m)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteMilestone(goalId: string, milestoneId: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.localGoals.deleteMilestone(goalId, milestoneId));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.goalApi.deleteMilestone(goalId, milestoneId).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  canEditGoal(goal: CoupleGoal): boolean {
    if (this.appMode.isLocalMode()) {
      return this.localGoals.canEditGoal(goal);
    }
    if (this.auth.isAdmin()) return true;
    const apiUserId = this.currentApiUserId();
    return !!apiUserId && goal.createdByUserId === apiUserId;
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  private fromApi(goal: CoupleGoalApiResponse): CoupleGoal {
    const category = VALID_CATEGORIES.includes(goal.category as GoalCategory)
      ? (goal.category as GoalCategory)
      : 'custom';
    const status = VALID_STATUSES.includes(goal.status as GoalStatus)
      ? (goal.status as GoalStatus)
      : 'not-started';
    const createdAt = goal.createdAt ?? new Date().toISOString();

    return {
      id: goal.id,
      coupleId: goal.coupleId,
      createdByUserId: goal.createdByUserId,
      createdByDisplayName: goal.createdByDisplayName ?? 'Partner',
      title: goal.title,
      description: goal.description ?? undefined,
      category,
      status,
      targetDate: goal.targetDate ? this.toDateOnly(goal.targetDate) : undefined,
      progressPercent: goal.progressPercent ?? 0,
      isPrivate: goal.isPrivate,
      createdAt,
      updatedAt: goal.updatedAt ?? createdAt,
      completedAt: goal.completedAt ?? undefined,
      milestones: goal.milestones ? goal.milestones.map(m => this.fromMilestoneApi(m)) : []
    };
  }

  private fromMilestoneApi(m: CoupleGoalMilestoneApiResponse): CoupleGoalMilestone {
    return {
      id: m.id,
      goalId: m.goalId,
      title: m.title,
      isCompleted: m.isCompleted,
      completedAt: m.completedAt ?? undefined,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt ?? undefined
    };
  }

  private toDateOnly(value: string): string {
    return value.includes('T') ? value.slice(0, 10) : value;
  }

  private apiReadinessError(): string | null {
    return this.tokenStorage.hasToken() ? null : 'Please login in API Mode first.';
  }

  private currentApiUserId(): string | null {
    const token = this.tokenStorage.getToken();
    if (!token) return null;

    try {
      const segment = token.split('.')[1];
      if (!segment) return null;
      const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))) as Record<string, unknown>;
      return this.asString(payload['sub'])
        ?? this.asString(payload['nameid'])
        ?? this.asString(payload['userId'])
        ?? this.asString(payload['id'])
        ?? this.asString(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'])
        ?? null;
    } catch {
      return null;
    }
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private toFriendlyError(error: unknown): Observable<never> {
    return friendlyErrorHelper(
      error,
      'The couple goal request failed. Please try again.',
      'Item not found.'
    );
  }
}
