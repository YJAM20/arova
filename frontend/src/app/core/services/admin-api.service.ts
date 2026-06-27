import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminEngagementOverview {
  totalMemories: number;
  totalLetters: number;
  totalReasons: number;
  totalMoodEntries: number;
  totalSongs: number;
  totalGoals: number;
  completedGoals: number;
  activeStreak: number;
  totalPoints: number;
  currentRank: string;
  mostUsedFeature: string;
  lastActivityAt: string | null;
  activityByFeature: Record<string, number>;
  activityByDay: Record<string, number>;
  limitations: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getEngagementOverview(coupleId?: string): Observable<AdminEngagementOverview> {
    const url = coupleId
      ? `${this.apiBaseUrl}/api/admin/engagement?coupleId=${coupleId}`
      : `${this.apiBaseUrl}/api/admin/engagement`;
    return this.http.get<AdminEngagementOverview>(url);
  }
}
