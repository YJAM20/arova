import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toFriendlyError as friendlyErrorHelper } from './error-handler.utils';
import {
  FuturePlan,
  FuturePlanStatus,
  FuturePlanType,
  Priority,
} from '../../shared/models/future-plan.model';
import { AppModeService } from './app-mode.service';
import { AuthService } from './auth.service';
import {
  CreateFuturePlanApiRequest,
  FuturePlanApiResponse,
  FuturePlanApiService,
  UpdateFuturePlanApiRequest,
} from './future-plan-api.service';
import { FuturePlanInput, FuturePlanService } from './future-plan.service';
import { TokenStorageService } from './token-storage.service';

const VALID_TYPES: FuturePlanType[] = ['travel', 'movie', 'food', 'date', 'dream', 'promise', 'learning'];
const VALID_STATUSES: FuturePlanStatus[] = ['one-day', 'planned', 'in-progress', 'done', 'secret'];
const VALID_PRIORITIES: Priority[] = ['low', 'medium', 'high'];

@Injectable({ providedIn: 'root' })
export class FuturePlanDataService {
  constructor(
    private appMode: AppModeService,
    private auth: AuthService,
    private localPlans: FuturePlanService,
    private planApi: FuturePlanApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getVisibleFuturePlansForCurrentUser(): Observable<FuturePlan[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localPlans.getVisibleFuturePlansForCurrentUser());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.planApi.getFuturePlans().pipe(
      map(plans => plans.map(plan => this.fromApi(plan))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getFuturePlanById(id: string): Observable<FuturePlan | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localPlans.getFuturePlanById(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.planApi.getFuturePlanById(id).pipe(
      map(plan => this.fromApi(plan)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  addFuturePlan(input: FuturePlanInput): Observable<FuturePlan> {
    if (this.appMode.isLocalMode()) {
      return of(this.localPlans.addFuturePlan(input));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.planApi.createFuturePlan(this.toCreateApi(input)).pipe(
      map(plan => this.fromApi(plan)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateFuturePlan(id: string, changes: Partial<FuturePlan>): Observable<FuturePlan | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localPlans.updateFuturePlan(id, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.planApi.updateFuturePlan(id, this.toUpdateApi(changes)).pipe(
      map(plan => this.fromApi(plan)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteFuturePlan(id: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.localPlans.deleteFuturePlan(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.planApi.deleteFuturePlan(id).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  markAsDone(id: string): Observable<FuturePlan | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localPlans.markAsDone(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.planApi.markDone(id).pipe(
      map(plan => this.fromApi(plan)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  canEditFuturePlan(plan: FuturePlan): boolean {
    if (this.appMode.isLocalMode()) {
      return this.localPlans.canEditFuturePlan(plan);
    }

    if (this.auth.isAdmin()) return true;
    const apiUserId = this.currentApiUserId();
    return !!apiUserId && plan.createdBy === apiUserId;
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  private toCreateApi(input: FuturePlanInput): CreateFuturePlanApiRequest {
    return {
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      status: input.status,
      targetDate: input.targetDate ?? null,
      priority: input.priority,
    };
  }

  private toUpdateApi(changes: Partial<FuturePlan>): UpdateFuturePlanApiRequest {
    const request: UpdateFuturePlanApiRequest = {};
    if ('title' in changes) request.title = changes.title;
    if ('description' in changes) request.description = changes.description ?? null;
    if ('type' in changes) request.type = changes.type;
    if ('status' in changes) request.status = changes.status;
    if ('targetDate' in changes) request.targetDate = changes.targetDate ?? null;
    if ('priority' in changes) request.priority = changes.priority;
    return request;
  }

  private fromApi(plan: FuturePlanApiResponse): FuturePlan {
    const type = VALID_TYPES.includes(plan.type as FuturePlanType)
      ? (plan.type as FuturePlanType)
      : 'dream';
    const status = VALID_STATUSES.includes(plan.status as FuturePlanStatus)
      ? (plan.status as FuturePlanStatus)
      : 'one-day';
    const priority = VALID_PRIORITIES.includes(plan.priority as Priority)
      ? (plan.priority as Priority)
      : 'medium';
    const createdAt = plan.createdAt ?? new Date().toISOString();

    return {
      id: plan.id,
      title: plan.title,
      description: plan.description ?? undefined,
      type,
      status,
      targetDate: plan.targetDate ? this.toDateOnly(plan.targetDate) : undefined,
      priority,
      createdBy: plan.createdByUserId,
      createdAt,
      updatedAt: plan.updatedAt ?? createdAt,
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
      'The future plan request failed. Please try again.',
      'Item not found.'
    );
  }
}
