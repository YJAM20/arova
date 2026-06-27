import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AppModeService } from './app-mode.service';
import { AdminApiService, AdminEngagementOverview } from './admin-api.service';
export type { AdminEngagementOverview } from './admin-api.service';
import { AdminDataService } from './admin-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    private appMode: AppModeService,
    private apiService: AdminApiService,
    private localData: AdminDataService
  ) {}

  getEngagementOverview(coupleId?: string): Observable<AdminEngagementOverview> {
    if (this.appMode.isLocalMode()) {
      return this.localData.getEngagementOverview();
    }

    return this.apiService.getEngagementOverview(coupleId).pipe(
      catchError(err => this.toFriendlyError(err))
    );
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  private toFriendlyError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error('Admin engagement request failed.'));
    }

    if (error.status === 0) {
      return throwError(
        () =>
          new Error(
            `Backend is not reachable. Make sure ${environment.apiBaseUrl} is running.`
          )
      );
    }
    if (error.status === 401) return throwError(() => new Error('Admin session unauthorized. Please login.'));
    if (error.status === 403) return throwError(() => new Error('Admin access forbidden. You are not a system admin.'));
    if (error.status === 404) return throwError(() => new Error('Requested couple or data was not found.'));
    
    return throwError(() => new Error(error.error?.message || `Request failed with status ${error.status}`));
  }
}
