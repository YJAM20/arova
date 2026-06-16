import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppSettings } from '../../shared/models/app-settings.model';
import { AppModeService } from './app-mode.service';
import { SettingsApiResponse, SettingsApiService } from './settings-api.service';
import { ThemeService } from './theme.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class SettingsDataService {
  constructor(
    private appMode: AppModeService,
    private themeService: ThemeService,
    private settingsApi: SettingsApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getSettings(): Observable<AppSettings> {
    if (this.appMode.isLocalMode() || !this.tokenStorage.hasToken()) {
      return of(this.themeService.getSettings());
    }

    return this.settingsApi.getSettings().pipe(
      map(settings => this.applyLocally(settings)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  saveSettings(settings: AppSettings): Observable<AppSettings> {
    if (this.appMode.isLocalMode()) {
      return of(this.themeService.updateSettings(settings));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    const localApplied = this.themeService.updateSettings(settings);
    return this.settingsApi.updateSettings(settings).pipe(
      map(response => this.applyLocally({ ...localApplied, ...response })),
      catchError(error => this.toFriendlyError(error))
    );
  }

  private applyLocally(response: SettingsApiResponse): AppSettings {
    const current = this.themeService.getSettings();
    return this.themeService.updateSettings({
      ...current,
      ...response,
      activeTheme: response.activeTheme ?? current.activeTheme,
      languageMode: response.languageMode ?? current.languageMode,
      animationsEnabled:
        typeof response.animationsEnabled === 'boolean'
          ? response.animationsEnabled
          : current.animationsEnabled,
      musicEnabled:
        typeof response.musicEnabled === 'boolean' ? response.musicEnabled : current.musicEnabled,
      onboardingCompleted:
        typeof response.onboardingCompleted === 'boolean'
          ? response.onboardingCompleted
          : current.onboardingCompleted,
      lastBackupAt: response.lastBackupAt ?? current.lastBackupAt,
    });
  }

  private apiReadinessError(): string | null {
    return this.tokenStorage.hasToken() ? null : 'Please login in API Mode first.';
  }

  private toFriendlyError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error('The settings request failed. Please try again.'));
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
            this.extractServerMessage(error) ?? 'The backend rejected these settings.'
          )
      );
    }

    return throwError(
      () =>
        new Error(
          this.extractServerMessage(error) ?? `Settings request failed with status ${error.status}.`
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
