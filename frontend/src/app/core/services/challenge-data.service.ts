import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toFriendlyError as friendlyErrorHelper } from './error-handler.utils';
import {
  Challenge,
  ChallengeCategory,
  ChallengeCompletion,
} from '../../shared/models/challenge.model';
import { AppModeService } from './app-mode.service';
import { AuthService } from './auth.service';
import {
  ChallengeApiResponse,
  ChallengeApiService,
  ChallengeCompletionApiResponse,
  CreateChallengeApiRequest,
  UpdateChallengeApiRequest,
} from './challenge-api.service';
import { ChallengeInput, ChallengeService } from './challenge.service';
import { TokenStorageService } from './token-storage.service';

const VALID_CATEGORIES: ChallengeCategory[] = [
  'romantic',
  'funny',
  'deep',
  'reassurance',
  'memory',
  'future',
  'random',
];

@Injectable({ providedIn: 'root' })
export class ChallengeDataService {
  constructor(
    private appMode: AppModeService,
    private auth: AuthService,
    private localChallenges: ChallengeService,
    private challengeApi: ChallengeApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getChallenges(): Observable<Challenge[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localChallenges.getChallenges());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.challengeApi.getChallenges().pipe(
      map(challenges => challenges.map(challenge => this.fromApi(challenge))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getDailyChallenge(): Observable<Challenge | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localChallenges.getDailyChallenge());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.challengeApi.getDailyChallenge().pipe(
      map(challenge => (challenge ? this.fromApi(challenge) : null)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  completeChallenge(id: string, answer?: string): Observable<Challenge | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localChallenges.completeChallenge(id, answer));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.challengeApi.completeChallenge(id, { answer: answer?.trim() || null }).pipe(
      map(challenge => this.fromApi(challenge)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getCompletedChallenges(challenges?: Challenge[]): Observable<Challenge[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localChallenges.getCompletedChallenges());
    }

    if (challenges) {
      return of(challenges.filter(challenge => !!this.getCompletion(challenge)));
    }

    return this.getChallenges().pipe(
      map(items => items.filter(challenge => !!this.getCompletion(challenge)))
    );
  }

  addChallenge(input: ChallengeInput): Observable<Challenge> {
    if (this.appMode.isLocalMode()) {
      return of(this.localChallenges.addChallenge(input));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.challengeApi.createChallenge(this.toCreateApi(input)).pipe(
      map(challenge => this.fromApi(challenge)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateChallenge(id: string, changes: Partial<Challenge>): Observable<Challenge | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localChallenges.updateChallenge(id, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.challengeApi.updateChallenge(id, this.toUpdateApi(changes)).pipe(
      map(challenge => this.fromApi(challenge)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteChallenge(id: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.localChallenges.deleteChallenge(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.challengeApi.deleteChallenge(id).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getCompletion(challenge: Challenge): ChallengeCompletion | null {
    if (this.appMode.isLocalMode()) {
      const user = this.auth.getCurrentUser();
      if (!user) return null;
      return challenge.completedBy.find(item => item.userId === user.id) ?? null;
    }

    const apiUserId = this.currentApiUserId();
    if (!apiUserId) return challenge.completedBy[0] ?? null;
    return challenge.completedBy.find(item => item.userId === apiUserId) ?? null;
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  private toCreateApi(input: ChallengeInput): CreateChallengeApiRequest {
    return {
      title: input.title,
      description: input.description,
      category: input.category,
      isDaily: input.isDaily,
    };
  }

  private toUpdateApi(changes: Partial<Challenge>): UpdateChallengeApiRequest {
    const request: UpdateChallengeApiRequest = {};
    if ('title' in changes) request.title = changes.title;
    if ('description' in changes) request.description = changes.description;
    if ('category' in changes) request.category = changes.category;
    if ('isDaily' in changes) request.isDaily = changes.isDaily;
    return request;
  }

  private fromApi(challenge: ChallengeApiResponse): Challenge {
    const category = VALID_CATEGORIES.includes(challenge.category as ChallengeCategory)
      ? (challenge.category as ChallengeCategory)
      : 'random';
    const completions = challenge.completedBy ?? challenge.completions ?? [];

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category,
      isDaily: !!challenge.isDaily,
      completedBy: completions.map(completion => this.completionFromApi(completion)),
      createdAt: challenge.createdAt ?? new Date().toISOString(),
    };
  }

  private completionFromApi(completion: ChallengeCompletionApiResponse): ChallengeCompletion {
    return {
      userId: completion.userId ?? '',
      answer: completion.answer ?? undefined,
      completedAt: completion.completedAt ?? new Date().toISOString(),
    };
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
      'The challenge request failed. Please try again.',
      'Item not found.'
    );
  }
}
