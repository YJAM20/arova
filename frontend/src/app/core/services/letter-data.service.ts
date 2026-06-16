import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Letter, LetterCategory } from '../../shared/models/letter.model';
import { AppModeService } from './app-mode.service';
import { AuthService } from './auth.service';
import {
  CreateLetterApiRequest,
  LetterApiResponse,
  LetterApiService,
  UpdateLetterApiRequest,
} from './letter-api.service';
import { LetterInput, LetterService } from './letter.service';
import { TokenStorageService } from './token-storage.service';

const VALID_CATEGORIES: LetterCategory[] = [
  'miss-me',
  'sad',
  'argument',
  'overthinking',
  'birthday',
  'reassurance',
  'future',
];

@Injectable({ providedIn: 'root' })
export class LetterDataService {
  constructor(
    private appMode: AppModeService,
    private auth: AuthService,
    private localLetters: LetterService,
    private letterApi: LetterApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getLetters(): Observable<Letter[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localLetters.getVisibleLettersForCurrentUser());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.letterApi.getLetters().pipe(
      map(letters => letters.map(letter => this.fromApi(letter))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getAllLettersForAdmin(): Observable<Letter[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localLetters.getLetters());
    }

    return this.getLetters();
  }

  getLetterById(id: string): Observable<Letter | null> {
    if (this.appMode.isLocalMode()) {
      const letter = this.localLetters.getLetterById(id);
      return of(letter && this.localLetters.canViewLetter(letter) ? letter : null);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.letterApi.getLetterById(id).pipe(
      map(letter => this.fromApi(letter)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  addLetter(input: LetterInput): Observable<Letter> {
    if (this.appMode.isLocalMode()) {
      return of(this.localLetters.addLetter(input));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.letterApi.createLetter(this.toCreateApi(input)).pipe(
      map(letter => this.fromApi(letter)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateLetter(id: string, changes: Partial<Letter>): Observable<Letter | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localLetters.updateLetter(id, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.letterApi.updateLetter(id, this.toUpdateApi(changes)).pipe(
      map(letter => this.fromApi(letter)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteLetter(id: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.localLetters.deleteLetter(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.letterApi.deleteLetter(id).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  toggleFavorite(id: string): Observable<Letter | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localLetters.toggleFavorite(id));
    }

    return this.getLetterById(id).pipe(
      switchMap(letter =>
        letter ? this.updateLetter(id, { isFavorite: !letter.isFavorite }) : of(null)
      )
    );
  }

  canEditLetter(letter: Letter): boolean {
    if (this.appMode.isLocalMode()) {
      return this.localLetters.canEditLetter(letter);
    }

    if (this.auth.isAdmin()) return true;

    const apiUserId = this.currentApiUserId();
    return !!apiUserId && letter.createdBy === apiUserId;
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  getApiModeMissingMessage(): string | null {
    return this.apiReadinessError();
  }

  private toCreateApi(input: LetterInput): CreateLetterApiRequest {
    return {
      title: input.title,
      body: input.body,
      visibilityLevel: this.toVisibility(input.visibleToPartner),
      openOnUtc: input.unlockDate ? new Date(input.unlockDate).toISOString() : null,
      isLocked: input.isLocked,
      passcode: input.passcode ?? null,
    };
  }

  private toUpdateApi(changes: Partial<Letter>): UpdateLetterApiRequest {
    const request: UpdateLetterApiRequest = {};

    if ('title' in changes) request.title = changes.title;
    if ('body' in changes) request.body = changes.body;
    if ('unlockDate' in changes) request.openOnUtc = changes.unlockDate ? new Date(changes.unlockDate).toISOString() : null;
    if ('passcode' in changes) request.passcode = changes.passcode ?? null;
    if ('isLocked' in changes) request.isLocked = changes.isLocked;
    if ('visibleToPartner' in changes && typeof changes.visibleToPartner === 'boolean') {
      request.visibilityLevel = this.toVisibility(changes.visibleToPartner);
    }

    return request;
  }

  private fromApi(letter: LetterApiResponse): Letter {
    const createdAt = letter.createdAt ?? new Date().toISOString();
    const category: LetterCategory = 'miss-me';

    return {
      id: letter.id,
      title: letter.title,
      body: letter.body ?? '',
      category,
      unlockDate: letter.openOnUtc ? this.toDateOnly(letter.openOnUtc) : undefined,
      passcode: undefined,
      isLocked: !!letter.isLocked,
      isFavorite: false,
      visibleToPartner: this.fromVisibility(letter.visibilityLevel),
      createdBy: letter.createdByUserId,
      createdAt,
      updatedAt: letter.updatedAt ?? createdAt,
    };
  }

  private toVisibility(visibleToPartner: boolean): number {
    return visibleToPartner ? 1 : 2;
  }

  private fromVisibility(visibilityLevel?: number): boolean {
    if (typeof visibilityLevel === 'undefined') {
      return true;
    }
    return visibilityLevel === 1 || visibilityLevel === 3;
  }

  private toDateOnly(value: string): string {
    return value.includes('T') ? value.slice(0, 10) : value;
  }

  private apiReadinessError(): string | null {
    if (!this.tokenStorage.hasToken()) {
      return 'API Mode needs login and a couple space first.';
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
      if (error instanceof Error) {
        return throwError(() => error);
      }

      return throwError(() => new Error('The letter request failed. Please try again.'));
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
      return throwError(() => new Error('You do not have permission for this letter.'));
    }

    if (error.status === 404) {
      return throwError(() => new Error('Letter not found.'));
    }

    if (error.status === 400) {
      return throwError(
        () =>
          new Error(
            this.extractServerMessage(error) ??
              'The backend rejected this letter. Check the required fields.'
          )
      );
    }

    return throwError(
      () =>
        new Error(
          this.extractServerMessage(error) ?? `Letter request failed with status ${error.status}.`
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
