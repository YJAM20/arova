import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Reason,
  ReasonCategory,
  ReasonReaction,
  ReasonReactionType,
} from '../../shared/models/reason.model';
import { AppModeService } from './app-mode.service';
import {
  CreateReasonApiRequest,
  ReasonApiResponse,
  ReasonApiService,
  ReasonReactionApiResponse,
  UpdateReasonApiRequest,
} from './reason-api.service';
import { ReasonInput, ReasonService } from './reason.service';
import { TokenStorageService } from './token-storage.service';

const VALID_CATEGORIES: ReasonCategory[] = [
  'love',
  'trust',
  'choose-you',
  'miss-you',
  'future',
];

const REACTION_TO_API: Record<ReasonReactionType, number> = {
  heart: 1,
  smile: 2,
  cry: 3,
  saved: 4,
  favorite: 5,
};

@Injectable({ providedIn: 'root' })
export class ReasonDataService {
  constructor(
    private appMode: AppModeService,
    private localReasons: ReasonService,
    private reasonApi: ReasonApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getReasons(): Observable<Reason[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.getVisibleReasonsForCurrentUser());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.getReasons().pipe(
      map(reasons => reasons.map(reason => this.fromApi(reason))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getAllReasonsForAdmin(): Observable<Reason[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.getReasons());
    }

    return this.getReasons();
  }

  getDailyReason(): Observable<Reason | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.getDailyReason());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.getDailyReason().pipe(
      map(reason => this.fromApi(reason)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getRandomReason(): Observable<Reason | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.getRandomReason());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.getRandomReason().pipe(
      map(reason => this.fromApi(reason)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getReasonById(id: string): Observable<Reason | null> {
    if (this.appMode.isLocalMode()) {
      const reason = this.localReasons.getReasonById(id);
      return of(reason && this.localReasons.canViewReason(reason) ? reason : null);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.getReasonById(id).pipe(
      map(reason => this.fromApi(reason)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  addReason(input: ReasonInput): Observable<Reason> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.addReason(input));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.createReason(this.toCreateApi(input)).pipe(
      map(reason => this.fromApi(reason)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateReason(id: string, changes: Partial<Reason>): Observable<Reason | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.updateReason(id, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.updateReason(id, this.toUpdateApi(changes)).pipe(
      map(reason => this.fromApi(reason)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteReason(id: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.deleteReason(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.deleteReason(id).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  toggleFavorite(id: string): Observable<Reason | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.toggleFavorite(id));
    }

    return this.getReasonById(id).pipe(
      switchMap(reason =>
        reason ? this.updateReason(id, { isFavorite: !reason.isFavorite }) : of(null)
      )
    );
  }

  addReaction(id: string, type: ReasonReactionType): Observable<Reason | null> {
    if (this.appMode.isLocalMode()) {
      return this.ensureLocalReaction(id, type, true);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.addReaction(id, REACTION_TO_API[type]).pipe(
      switchMap(() => this.getReasonById(id)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  removeReaction(id: string, type: ReasonReactionType): Observable<Reason | null> {
    if (this.appMode.isLocalMode()) {
      return this.ensureLocalReaction(id, type, false);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.reasonApi.removeReaction(id, REACTION_TO_API[type]).pipe(
      switchMap(() => this.getReasonById(id)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  toggleReaction(id: string, type: ReasonReactionType): Observable<Reason | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localReasons.toggleReaction(id, type));
    }

    return this.getReasonById(id).pipe(
      switchMap(reason => {
        if (!reason) return of(null);
        return this.hasReaction(reason, type)
          ? this.removeReaction(id, type)
          : this.addReaction(id, type);
      })
    );
  }

  hasReaction(reason: Reason, type: ReasonReactionType): boolean {
    if (this.appMode.isLocalMode()) {
      return this.localReasons.hasReaction(reason, type);
    }

    return (reason.reactions ?? []).some(reaction => reaction.type === type);
  }

  getReactionCount(reason: Reason, type: ReasonReactionType): number {
    return (reason.reactions ?? []).filter(reaction => reaction.type === type).length;
  }

  canEditReason(reason: Reason): boolean {
    return this.appMode.isLocalMode() ? this.localReasons.canEditReason(reason) : true;
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  getApiModeMissingMessage(): string | null {
    return this.apiReadinessError();
  }

  private ensureLocalReaction(
    id: string,
    type: ReasonReactionType,
    shouldExist: boolean
  ): Observable<Reason | null> {
    const reason = this.localReasons.getReasonById(id);
    if (!reason || !this.localReasons.canViewReason(reason)) return of(null);

    const hasReaction = this.localReasons.hasReaction(reason, type);
    if (hasReaction === shouldExist) return of(reason);

    return of(this.localReasons.toggleReaction(id, type));
  }

  private toCreateApi(input: ReasonInput): CreateReasonApiRequest {
    const text = input.body?.trim() || input.title?.trim() || '';
    return {
      text,
      visibilityLevel: input.isSecret ? 4 : 1,
      unlockDate: input.unlockDate ? new Date(input.unlockDate).toISOString() : null,
    };
  }

  private toUpdateApi(changes: Partial<Reason>): UpdateReasonApiRequest {
    const request: UpdateReasonApiRequest = {};

    if ('body' in changes || 'title' in changes) {
      request.text = changes.body?.trim() || changes.title?.trim();
    }
    if ('isSecret' in changes) {
      request.visibilityLevel = changes.isSecret ? 4 : 1;
    }
    if ('unlockDate' in changes) {
      request.unlockDate = changes.unlockDate ? new Date(changes.unlockDate).toISOString() : null;
    }

    return request;
  }

  private fromApi(reason: ReasonApiResponse): Reason {
    const createdAt = reason.createdAt ?? new Date().toISOString();
    const category: ReasonCategory = 'love';

    return {
      id: reason.id,
      title: 'Reason',
      body: reason.text ?? '',
      category,
      order: 1,
      unlockDate: reason.unlockDate ? this.toDateOnly(reason.unlockDate) : undefined,
      isSecret: reason.visibilityLevel === 4,
      isFavorite: false,
      reactions: (reason.reactions ?? []).map(reaction => this.reactionFromApi(reaction)),
      createdBy: reason.createdByUserId,
      createdAt,
      updatedAt: reason.updatedAt ?? createdAt,
    };
  }

  private reactionFromApi(reaction: ReasonReactionApiResponse): ReasonReaction {
    return {
      userId: reaction.userId ?? '',
      type: this.reactionTypeFromApi(reaction.type),
      createdAt: reaction.createdAt ?? new Date().toISOString(),
    };
  }

  private reactionTypeFromApi(type: number | string): ReasonReactionType {
    if (typeof type === 'number') {
      return this.reactionTypeFromNumber(type);
    }

    const normalized = type.trim().toLowerCase().replace(/[\s_-]/g, '');
    if (normalized.includes('heart') || normalized === '1') return 'heart';
    if (normalized.includes('smile') || normalized === '2') return 'smile';
    if (normalized.includes('cry') || normalized === '3') return 'cry';
    if (normalized.includes('saved') || normalized === '4') return 'saved';
    if (normalized.includes('favorite') || normalized === '5') return 'favorite';
    return 'heart';
  }

  private reactionTypeFromNumber(type: number): ReasonReactionType {
    if (type === 2) return 'smile';
    if (type === 3) return 'cry';
    if (type === 4) return 'saved';
    if (type === 5) return 'favorite';
    return 'heart';
  }

  private toDateOnly(value: string): string {
    return value.includes('T') ? value.slice(0, 10) : value;
  }

  private apiReadinessError(): string | null {
    if (!this.tokenStorage.hasToken()) {
      return 'Please login in API Mode first.';
    }

    return null;
  }

  private toFriendlyError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      if (error instanceof Error) {
        return throwError(() => error);
      }

      return throwError(() => new Error('The reason request failed. Please try again.'));
    }

    if (error.status === 0) {
      return throwError(
        () =>
          new Error(
            `Backend is not reachable. Make sure ${environment.apiBaseUrl} is running.`
          )
      );
    }

    if (error.status === 401) {
      return throwError(() => new Error('Please login in API Mode first.'));
    }

    if (error.status === 403) {
      return throwError(() => new Error('You do not have permission for this reason.'));
    }

    if (error.status === 404) {
      return throwError(() => new Error('Reason not found.'));
    }

    if (error.status === 400) {
      return throwError(
        () =>
          new Error(
            this.extractServerMessage(error) ??
              'The backend rejected this reason. Check the required fields.'
          )
      );
    }

    return throwError(
      () =>
        new Error(
          this.extractServerMessage(error) ?? `Reason request failed with status ${error.status}.`
        )
    );
  }

  private extractServerMessage(error: HttpErrorResponse): string | null {
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (typeof error.error === 'object' && error.error) {
      if ('message' in error.error) return String(error.error.message);
      if ('title' in error.error) return String(error.error.title);
    }

    return null;
  }
}
