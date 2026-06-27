import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportantDate, ImportantDateType, RecurrenceType } from '../../shared/models/important-date.model';
import { AppModeService } from './app-mode.service';
import { AuthService } from './auth.service';
import { ImportantDateApiService, CreateImportantDateApiRequest, UpdateImportantDateApiRequest, ImportantDateApiResponse } from './important-date-api.service';
import { ImportantDateInput, ImportantDateService } from './important-date.service';
import { TokenStorageService } from './token-storage.service';

const VALID_TYPES: ImportantDateType[] = ['anniversary', 'birthday', 'first-moment', 'future-plan', 'letter-unlock', 'custom'];
const VALID_RECURRENCES: RecurrenceType[] = ['none', 'yearly', 'monthly'];

@Injectable({ providedIn: 'root' })
export class ImportantDateDataService {
  constructor(
    private appMode: AppModeService,
    private auth: AuthService,
    private localService: ImportantDateService,
    private dateApi: ImportantDateApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getVisibleImportantDatesForCurrentUser(): Observable<ImportantDate[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localService.getVisibleImportantDatesForCurrentUser());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.dateApi.getImportantDates().pipe(
      map(dates => dates.map(d => this.fromApi(d))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getUpcomingImportantDatesForCurrentUser(): Observable<ImportantDate[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localService.getUpcomingImportantDatesForCurrentUser());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.dateApi.getUpcomingDates().pipe(
      map(dates => dates.map(d => this.fromApi(d))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getImportantDateById(id: string): Observable<ImportantDate | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localService.getImportantDateById(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.dateApi.getDateById(id).pipe(
      map(d => this.fromApi(d)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  addImportantDate(input: ImportantDateInput): Observable<ImportantDate> {
    if (this.appMode.isLocalMode()) {
      return of(this.localService.addImportantDate(input));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.dateApi.createDate(this.toCreateApi(input)).pipe(
      map(d => this.fromApi(d)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateImportantDate(id: string, changes: Partial<ImportantDate>): Observable<ImportantDate | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localService.updateImportantDate(id, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.dateApi.updateDate(id, this.toUpdateApi(changes)).pipe(
      map(d => this.fromApi(d)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteImportantDate(id: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.localService.deleteImportantDate(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.dateApi.deleteDate(id).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  sendTestReminders(): Observable<{ message: string }> {
    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.dateApi.sendTestReminders().pipe(
      catchError(error => this.toFriendlyError(error))
    );
  }

  canEditImportantDate(date: ImportantDate): boolean {
    if (this.appMode.isLocalMode()) {
      return this.localService.canEditImportantDate(date);
    }

    if (this.auth.isAdmin()) return true;
    const apiUserId = this.currentApiUserId();
    return !!apiUserId && date.createdByUserId === apiUserId;
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  private toCreateApi(input: ImportantDateInput): CreateImportantDateApiRequest {
    return {
      title: input.title,
      description: input.description ?? null,
      date: input.date,
      type: input.type,
      recurrence: input.recurrence,
      reminderEnabled: input.reminderEnabled,
      reminderDaysBefore: input.reminderDaysBefore,
      isPrivate: input.isPrivate,
    };
  }

  private toUpdateApi(changes: Partial<ImportantDate>): UpdateImportantDateApiRequest {
    const request: UpdateImportantDateApiRequest = {};
    if ('title' in changes) request.title = changes.title;
    if ('description' in changes) request.description = changes.description ?? null;
    if ('date' in changes) request.date = changes.date;
    if ('type' in changes) request.type = changes.type;
    if ('recurrence' in changes) request.recurrence = changes.recurrence;
    if ('reminderEnabled' in changes) request.reminderEnabled = changes.reminderEnabled;
    if ('reminderDaysBefore' in changes) request.reminderDaysBefore = changes.reminderDaysBefore;
    if ('isPrivate' in changes) request.isPrivate = changes.isPrivate;
    return request;
  }

  private fromApi(d: ImportantDateApiResponse): ImportantDate {
    const type = VALID_TYPES.includes(d.type as ImportantDateType)
      ? (d.type as ImportantDateType)
      : 'custom';
    const recurrence = VALID_RECURRENCES.includes(d.recurrence as RecurrenceType)
      ? (d.recurrence as RecurrenceType)
      : 'none';
    const createdAt = d.createdAt ?? new Date().toISOString();

    return {
      id: d.id,
      coupleId: d.coupleId,
      createdByUserId: d.createdByUserId,
      title: d.title,
      description: d.description ?? undefined,
      date: this.toDateOnly(d.date),
      type,
      recurrence,
      reminderEnabled: d.reminderEnabled,
      reminderDaysBefore: d.reminderDaysBefore,
      isPrivate: d.isPrivate,
      daysRemaining: d.daysRemaining,
      nextOccurrenceDate: d.nextOccurrenceDate ? this.toDateOnly(d.nextOccurrenceDate) : undefined,
      createdAt,
      updatedAt: d.updatedAt ?? createdAt,
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
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error('The important date request failed. Please try again.'));
    }

    if (error.status === 0) {
      return throwError(
        () =>
          new Error(
            `Backend is not reachable. Make sure ${environment.apiBaseUrl} is running.`
          )
      );
    }
    if (error.status === 401) return throwError(() => new Error('Please login in API Mode first.'));
    if (error.status === 403) return throwError(() => new Error('You do not have permission for this action.'));
    if (error.status === 404) return throwError(() => new Error('Item not found.'));
    if (error.status === 400) {
      return throwError(
        () =>
          new Error(
            this.extractServerMessage(error) ??
              'The backend rejected this important date. Check the required fields.'
          )
      );
    }

    return throwError(
      () =>
        new Error(
          this.extractServerMessage(error) ?? `Important date request failed with status ${error.status}.`
        )
    );
  }

  private extractServerMessage(error: HttpErrorResponse): string | null {
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (typeof error.error === 'object' && error.error) {
      if ('message' in error.error) return String(error.error['message']);
      if ('title' in error.error) return String(error.error['title']);
    }

    return null;
  }
}
