import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RelationshipScoreApiResponse {
  totalPoints: number;
  currentRank: string;
  nextRank: string | null;
  nextRankThreshold: number;
  progressPercent: number;
  streak: number;
}

export interface PointLedgerApiEntry {
  id: string;
  userId: string;
  actionType: string;
  points: number;
  reason: string;
  sourceType: string | null;
  createdAt: string;
}

export interface DailyTaskApiResponse {
  id: string;
  taskKey: string;
  title: string;
  description: string;
  pointsReward: number;
  date: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface AwardPointsApiRequest {
  actionType: string;
  points: number;
  reason: string;
  sourceType?: string | null;
}

export interface AwardPointsApiResponse {
  id: string;
  userId: string;
  actionType: string;
  points: number;
  reason: string;
  sourceType: string | null;
  createdAt: string;
  newTotalPoints: number;
}

@Injectable({ providedIn: 'root' })
export class RelationshipScoreApiService {
  private readonly base = `${environment.apiBaseUrl}/api/relationship-score`;

  constructor(private http: HttpClient) {}

  getScore(): Observable<RelationshipScoreApiResponse> {
    return this.http.get<RelationshipScoreApiResponse>(this.base);
  }

  getLedger(): Observable<PointLedgerApiEntry[]> {
    return this.http.get<PointLedgerApiEntry[]>(`${this.base}/ledger`);
  }

  getDailyTasks(): Observable<DailyTaskApiResponse[]> {
    return this.http.get<DailyTaskApiResponse[]>(`${this.base}/daily-tasks`);
  }

  completeDailyTask(id: string): Observable<DailyTaskApiResponse> {
    return this.http.post<DailyTaskApiResponse>(`${this.base}/daily-tasks/${id}/complete`, {});
  }

  awardPoints(request: AwardPointsApiRequest): Observable<AwardPointsApiResponse> {
    return this.http.post<AwardPointsApiResponse>(`${this.base}/award`, request);
  }
}
