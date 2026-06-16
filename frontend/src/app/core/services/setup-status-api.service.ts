import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SetupStatusResponse {
  isVerified?: boolean;
  hasCompletedQuickOnboarding?: boolean;
  hasCompletedProfile?: boolean;
  hasCouple?: boolean;
  hasSubscription?: boolean;
  preferredLanguage?: string;
  canEnableMatureMode?: boolean;
  matureContentEnabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SetupStatusApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getStatus(): Observable<SetupStatusResponse> {
    return this.http.get<SetupStatusResponse>(`${this.apiBaseUrl}/api/setup/status`);
  }

  getNextRoute(status: SetupStatusResponse): string {
    const verified = status.isVerified ?? false;
    if (!verified) return '/verify-account';
    if (!status.hasCompletedQuickOnboarding) {
      return '/onboarding/questions';
    }
    if (!status.hasCompletedProfile) return '/profile-setup';
    if (!status.hasCouple) return '/pairing-choice';
    return '/universe';
  }
}
