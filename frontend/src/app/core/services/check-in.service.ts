import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RelationshipCheckIn } from '../../shared/models/check-in.model';
import { AppModeService } from './app-mode.service';
import { CheckInApiService } from './check-in-api.service';
import { CheckInDataService } from './check-in-data.service';
import { TokenStorageService } from './token-storage.service';

export interface CheckInInput {
  connectionLevel: number;
  energyLevel: number;
  communicationFeeling: number;
  note?: string;
}

export interface CheckInView extends RelationshipCheckIn {
  userName: string;
}

@Injectable({ providedIn: 'root' })
export class CheckInService {
  constructor(
    private appMode: AppModeService,
    private localData: CheckInDataService,
    private apiService: CheckInApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getTodayDateKey(date = new Date()): string {
    return this.localData.getTodayDateKey(date);
  }

  getTodayCheckIns(): Observable<CheckInView[]> {
    if (this.appMode.isLocalMode()) {
      return this.localData.getTodayCheckIns();
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.apiService.getTodayCheckIns().pipe(
      map(checkIns => checkIns.map(c => this.viewFromApi(c))),
      catchError(err => this.toFriendlyError(err))
    );
  }

  getCurrentUserTodayCheckIn(): Observable<RelationshipCheckIn | null> {
    if (this.appMode.isLocalMode()) {
      return this.localData.getCurrentUserTodayCheckIn();
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    const apiUserId = this.currentApiUserId();
    return this.apiService.getTodayCheckIns().pipe(
      map(checkIns => {
        const found = checkIns.find(c => c.userId === apiUserId);
        return found ? this.checkInFromApi(found) : null;
      }),
      catchError(err => this.toFriendlyError(err))
    );
  }

  saveTodayCheckIn(input: CheckInInput): Observable<RelationshipCheckIn | null> {
    if (this.appMode.isLocalMode()) {
      return this.localData.saveTodayCheckIn(input);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.apiService.createCheckIn({
      connectionLevel: input.connectionLevel,
      energyLevel: input.energyLevel,
      communicationFeeling: input.communicationFeeling,
      note: input.note || null,
    }).pipe(
      map(c => this.checkInFromApi(c)),
      catchError(err => this.toFriendlyError(err))
    );
  }

  getRecentHistory(limit = 12): Observable<CheckInView[]> {
    if (this.appMode.isLocalMode()) {
      return this.localData.getRecentHistory(limit);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.apiService.getCheckIns().pipe(
      map(checkIns => checkIns.map(c => this.viewFromApi(c)).slice(0, limit)),
      catchError(err => this.toFriendlyError(err))
    );
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  getApiModeMissingMessage(): string | null {
    return this.apiReadinessError();
  }

  private checkInFromApi(c: any): RelationshipCheckIn {
    return {
      id: c.id,
      userId: c.userId,
      dateKey: c.dateKey,
      connectionLevel: c.connectionLevel,
      energyLevel: c.energyLevel,
      communicationFeeling: c.communicationFeeling,
      note: c.note || undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt || c.createdAt,
    };
  }

  private viewFromApi(c: any): CheckInView {
    return {
      ...this.checkInFromApi(c),
      userName: c.userDisplayName || 'Partner',
    };
  }

  private apiReadinessError(): string | null {
    if (!this.tokenStorage.hasToken()) {
      return 'Please login in API Mode first.';
    }
    return null;
  }

  private currentApiUserId(): string | null {
    const token = this.tokenStorage.getToken();
    if (!token) return null;

    try {
      const segment = token.split('.')[1];
      if (!segment) return null;

      const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
      return this.asString(payload['sub'])
        ?? this.asString(payload['nameid'])
        ?? this.asString(payload['userId'])
        ?? this.asString(payload['id'])
        ?? this.asString(
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        )
        ?? null;
    } catch {
      return null;
    }
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private toFriendlyError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error('Check-in request failed. Please try again.'));
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
      return throwError(() => new Error('You do not have permission for this action.'));
    }

    if (error.status === 404) {
      return throwError(() => new Error('Check-in not found.'));
    }

    if (error.status === 400) {
      return throwError(
        () =>
          new Error(
            this.extractServerMessage(error) ??
              'The backend rejected this check-in. Check required fields.'
          )
      );
    }

    return throwError(
      () =>
        new Error(
          this.extractServerMessage(error) ?? `Request failed with status ${error.status}.`
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
