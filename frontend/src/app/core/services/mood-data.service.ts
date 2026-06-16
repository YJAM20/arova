import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MoodEntry, MoodType } from '../../shared/models/mood.model';
import { AppModeService } from './app-mode.service';
import { MoodApiResponse, MoodApiService } from './mood-api.service';
import { MoodService } from './mood.service';
import { TokenStorageService } from './token-storage.service';

const VALID_MOODS: MoodType[] = [
  'happy',
  'tired',
  'missing-you',
  'overthinking',
  'silent',
  'need-attention',
  'sad',
  'excited',
  'angry-but-soft',
  'need-reassurance',
];

@Injectable({ providedIn: 'root' })
export class MoodDataService {
  constructor(
    private appMode: AppModeService,
    private localMoods: MoodService,
    private moodApi: MoodApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getMoodHistory(): Observable<MoodEntry[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMoods.getMoodHistory());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.moodApi.getMoods().pipe(
      map(entries => entries.map(entry => this.fromApi(entry))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getTodayMoodForCurrentUser(): Observable<MoodEntry | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMoods.getTodayMoodForCurrentUser());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.moodApi.getTodayMood().pipe(
      map(entry => (entry ? this.fromApi(entry) : null)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  setTodayMood(mood: MoodType, note?: string): Observable<MoodEntry> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMoods.setTodayMood(mood, note));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.moodApi.createMood({ mood, note: note?.trim() || null }).pipe(
      map(entry => this.fromApi(entry)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  respondToMood(entryId: string, response: string): Observable<MoodEntry | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMoods.respondToMood(entryId, response));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.moodApi.respondToMood(entryId, { response }).pipe(
      map(entry => this.fromApi(entry)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getMoodMessage(mood: MoodType): string {
    return this.localMoods.getMoodMessage(mood);
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  private fromApi(entry: MoodApiResponse): MoodEntry {
    const createdAt = entry.createdAt ?? new Date().toISOString();
    const date = entry.date ? this.toDateOnly(entry.date) : createdAt.slice(0, 10);
    const mood = VALID_MOODS.includes(entry.mood as MoodType)
      ? (entry.mood as MoodType)
      : 'happy';

    return {
      id: entry.id,
      userId: entry.userId ?? entry.createdByUserId ?? '',
      mood,
      note: entry.note ?? undefined,
      response: entry.response ?? undefined,
      date,
      createdAt,
    };
  }

  private toDateOnly(value: string): string {
    return value.includes('T') ? value.slice(0, 10) : value;
  }

  private apiReadinessError(): string | null {
    return this.tokenStorage.hasToken() ? null : 'Please login in API Mode first.';
  }

  private toFriendlyError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error('The mood request failed. Please try again.'));
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
            this.extractServerMessage(error) ?? 'The backend rejected this mood. Check the fields.'
          )
      );
    }

    return throwError(
      () =>
        new Error(
          this.extractServerMessage(error) ?? `Mood request failed with status ${error.status}.`
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
