import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CoupleGoalMilestoneApiResponse {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CoupleGoalApiResponse {
  id: string;
  coupleId: string;
  createdByUserId: string;
  createdByDisplayName?: string | null;
  title: string;
  description?: string | null;
  category: string;
  status: string;
  targetDate?: string | null;
  progressPercent: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string | null;
  completedAt?: string | null;
  milestones: CoupleGoalMilestoneApiResponse[];
}

export interface CreateCoupleGoalApiRequest {
  title: string;
  description?: string | null;
  category: string;
  status: string;
  targetDate?: string | null;
  isPrivate: boolean;
  progressPercent?: number;
}

export type UpdateCoupleGoalApiRequest = Partial<CreateCoupleGoalApiRequest>;

export interface CreateMilestoneApiRequest {
  title: string;
}

export interface UpdateMilestoneApiRequest {
  title: string;
  isCompleted: boolean;
}

@Injectable({ providedIn: 'root' })
export class CoupleGoalApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getGoals(): Observable<CoupleGoalApiResponse[]> {
    return this.http.get<CoupleGoalApiResponse[]>(`${this.apiBaseUrl}/api/couple-goals`);
  }

  getGoalById(id: string): Observable<CoupleGoalApiResponse> {
    return this.http.get<CoupleGoalApiResponse>(`${this.apiBaseUrl}/api/couple-goals/${id}`);
  }

  createGoal(request: CreateCoupleGoalApiRequest): Observable<CoupleGoalApiResponse> {
    return this.http.post<CoupleGoalApiResponse>(`${this.apiBaseUrl}/api/couple-goals`, request);
  }

  updateGoal(id: string, request: UpdateCoupleGoalApiRequest): Observable<CoupleGoalApiResponse> {
    return this.http.put<CoupleGoalApiResponse>(`${this.apiBaseUrl}/api/couple-goals/${id}`, request);
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/couple-goals/${id}`);
  }

  completeGoal(id: string): Observable<CoupleGoalApiResponse> {
    return this.http.post<CoupleGoalApiResponse>(`${this.apiBaseUrl}/api/couple-goals/${id}/complete`, {});
  }

  createMilestone(goalId: string, request: CreateMilestoneApiRequest): Observable<CoupleGoalMilestoneApiResponse> {
    return this.http.post<CoupleGoalMilestoneApiResponse>(`${this.apiBaseUrl}/api/couple-goals/${goalId}/milestones`, request);
  }

  updateMilestone(goalId: string, milestoneId: string, request: UpdateMilestoneApiRequest): Observable<CoupleGoalMilestoneApiResponse> {
    return this.http.put<CoupleGoalMilestoneApiResponse>(`${this.apiBaseUrl}/api/couple-goals/${goalId}/milestones/${milestoneId}`, request);
  }

  deleteMilestone(goalId: string, milestoneId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/couple-goals/${goalId}/milestones/${milestoneId}`);
  }
}
