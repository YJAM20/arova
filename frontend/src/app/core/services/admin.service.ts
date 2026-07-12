import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { AppModeService } from './app-mode.service';
import { AdminApiService, AdminEngagementOverview } from './admin-api.service';
export type { AdminEngagementOverview } from './admin-api.service';
import { AdminDataService } from './admin-data.service';
import { toFriendlyError } from './error-handler.utils';

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
      catchError(err =>
        toFriendlyError(
          err,
          'Admin engagement request failed.',
          'Requested couple or data was not found.',
          'Admin session unauthorized. Please login.',
          'Admin access forbidden. You are not a system admin.'
        )
      )
    );
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }
}
