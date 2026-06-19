import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppModeService } from './app-mode.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

export interface ProfileResponse {
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  ageRange?: string | null;
  relationshipStatus?: string | null;
  relationshipType?: string | null;
  preferredLanguage?: 'en' | 'ar' | 'es';
  preferredTheme?: string | null;
  loveLanguage?: string | null;
  personalityStyle?: string | null;
  matureContentEnabled?: boolean;
}

export type UpdateProfileRequest = ProfileResponse;

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly LOCAL_PROFILE_KEY = 'arova-local-profile-v1';

  constructor(
    private http: HttpClient,
    private appMode: AppModeService,
    private auth: AuthService,
    private storage: StorageService
  ) {}

  getProfile(): Observable<ProfileResponse> {
    if (this.appMode.isLocalMode()) {
      const stored = localStorage.getItem(this.LOCAL_PROFILE_KEY);
      if (stored) {
        try {
          return of({ ...this.defaultLocalProfile(), ...JSON.parse(stored) });
        } catch {
          // Fallback to default
        }
      }
      const defaultProfile = this.defaultLocalProfile();
      localStorage.setItem(this.LOCAL_PROFILE_KEY, JSON.stringify(defaultProfile));
      return of(defaultProfile);
    }
    return this.http.get<ProfileResponse>(`${this.apiBaseUrl}/api/profile/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<ProfileResponse> {
    if (this.appMode.isLocalMode()) {
      const updated = { ...this.defaultLocalProfile(), ...request };
      localStorage.setItem(this.LOCAL_PROFILE_KEY, JSON.stringify(updated));
      this.syncCurrentUserIdentity(updated);
      return of(updated);
    }

    return this.http.put<ProfileResponse>(`${this.apiBaseUrl}/api/profile/me`, request).pipe(
      map(updated => ({ ...request, ...updated })),
      tap(updated => {
        this.syncCurrentUserIdentity(updated);
      })
    );
  }

  getContentSafety(): Observable<unknown> {
    if (this.appMode.isLocalMode()) {
      return of({ status: 'safe', details: 'Local mode is safe by default.' });
    }
    return this.http.get<unknown>(`${this.apiBaseUrl}/api/profile/content-safety`);
  }

  updateMatureContent(enabled: boolean): Observable<unknown> {
    if (this.appMode.isLocalMode()) {
      const stored = localStorage.getItem(this.LOCAL_PROFILE_KEY);
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          profile.matureContentEnabled = enabled;
          localStorage.setItem(this.LOCAL_PROFILE_KEY, JSON.stringify(profile));
        } catch {
          // Ignore
        }
      }
      return of({ success: true, matureContentEnabled: enabled });
    }
    return this.http.put<unknown>(`${this.apiBaseUrl}/api/profile/mature-content`, { enabled });
  }

  private defaultLocalProfile(): ProfileResponse {
    const currentUser = this.auth.getCurrentUser();
    return {
      displayName: currentUser?.displayName || 'Adventurer',
      avatarUrl: currentUser?.avatarUrl || '',
      bio: 'Just another soul in this shared universe.',
      dateOfBirth: '',
      ageRange: '',
      relationshipStatus: 'Paired',
      relationshipType: 'Monogamous',
      preferredLanguage: 'en',
      preferredTheme: 'dark-romantic',
      loveLanguage: 'Quality Time',
      personalityStyle: 'Dreamer',
      matureContentEnabled: false,
    };
  }

  private syncCurrentUserIdentity(profile: ProfileResponse): void {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) return;

    const userChanges: { displayName?: string; avatarUrl?: string } = {};
    if (profile.displayName !== undefined) userChanges.displayName = profile.displayName;
    if (profile.avatarUrl !== undefined) userChanges.avatarUrl = profile.avatarUrl || undefined;

    this.storage.updateUser(currentUser.id, userChanges);
    this.auth.updateCurrentUserProfile({
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    });
  }
}
