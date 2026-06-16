import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FuturePlanApiResponse {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  targetDate?: string | null;
  priority: string;
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFuturePlanApiRequest {
  title: string;
  description?: string | null;
  type: string;
  status: string;
  targetDate?: string | null;
  priority: string;
}

export type UpdateFuturePlanApiRequest = Partial<CreateFuturePlanApiRequest>;

@Injectable({ providedIn: 'root' })
export class FuturePlanApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getFuturePlans(): Observable<FuturePlanApiResponse[]> {
    return this.http.get<FuturePlanApiResponse[]>(`${this.apiBaseUrl}/api/future-plans`);
  }

  getFuturePlanById(id: string): Observable<FuturePlanApiResponse> {
    return this.http.get<FuturePlanApiResponse>(`${this.apiBaseUrl}/api/future-plans/${id}`);
  }

  createFuturePlan(request: CreateFuturePlanApiRequest): Observable<FuturePlanApiResponse> {
    return this.http.post<FuturePlanApiResponse>(`${this.apiBaseUrl}/api/future-plans`, request);
  }

  updateFuturePlan(id: string, request: UpdateFuturePlanApiRequest): Observable<FuturePlanApiResponse> {
    return this.http.put<FuturePlanApiResponse>(`${this.apiBaseUrl}/api/future-plans/${id}`, request);
  }

  deleteFuturePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/future-plans/${id}`);
  }

  markDone(id: string): Observable<FuturePlanApiResponse> {
    return this.http.post<FuturePlanApiResponse>(`${this.apiBaseUrl}/api/future-plans/${id}/mark-done`, {});
  }
}
