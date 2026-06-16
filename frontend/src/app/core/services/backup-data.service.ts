import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, from, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppModeService } from './app-mode.service';
import { BackupApiService } from './backup-api.service';
import { BackupResult, BackupService } from './backup.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class BackupDataService {
  constructor(
    private appMode: AppModeService,
    private localBackup: BackupService,
    private backupApi: BackupApiService,
    private tokenStorage: TokenStorageService
  ) {}

  downloadBackupFile(): Observable<BackupResult> {
    if (this.appMode.isLocalMode()) {
      return of(this.localBackup.downloadBackupFile());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return of({ success: false, message: readyError });

    return this.backupApi.exportBackup().pipe(
      map(data => {
        this.downloadJson(data, `arova-api-backup-${new Date().toISOString().slice(0, 10)}.json`);
        this.localBackup.updateLastBackupDate();
        return { success: true, message: 'API backup downloaded safely.' };
      }),
      catchError(error => this.toBackupResult(error))
    );
  }

  importDataFromFile(file: File): Observable<BackupResult> {
    if (this.appMode.isLocalMode()) {
      return from(this.localBackup.importDataFromFile(file));
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      return of({ success: false, message: 'Please choose a JSON backup file.' });
    }

    const readyError = this.apiReadinessError();
    if (readyError) return of({ success: false, message: readyError });

    return from(file.text()).pipe(
      map(text => JSON.parse(text) as unknown),
      switchMap(data => this.backupApi.importBackup(data)),
      map(() => ({ success: true, message: 'API backup imported successfully.' })),
      catchError(error => {
        if (error instanceof SyntaxError) {
          return of({ success: false, message: 'That file is not valid JSON. Nothing was changed.' });
        }

        return this.toBackupResult(error);
      })
    );
  }

  resetData(confirmation: string): BackupResult {
    return this.localBackup.resetData(confirmation);
  }

  getLastBackupDate(): string | undefined {
    return this.localBackup.getLastBackupDate();
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  private downloadJson(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private apiReadinessError(): string | null {
    return this.tokenStorage.hasToken() ? null : 'Please login in API Mode first.';
  }

  private toBackupResult(error: unknown): Observable<BackupResult> {
    return of({ success: false, message: this.errorMessage(error) });
  }

  private errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The backup request failed. Please try again.';
    }

    if (error.status === 0) return `Backend is not reachable. Make sure ${environment.apiBaseUrl} is running.`;
    if (error.status === 401) return 'Please login in API Mode first.';
    if (error.status === 403) return 'You do not have permission for this action.';
    if (error.status === 404) return 'Item not found.';
    if (error.status === 400) return this.extractServerMessage(error) ?? 'The backend rejected this backup.';

    return this.extractServerMessage(error) ?? `Backup request failed with status ${error.status}.`;
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
