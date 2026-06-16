import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReasonReactionApiResponse {
  id?: string;
  userId?: string;
  type: number | string;
  createdAt?: string;
}

export interface ReasonApiResponse {
  id: string;
  text: string;
  visibilityLevel?: number;
  unlockDate?: string | null;
  createdByUserId: string;
  createdByDisplayName?: string;
  createdAt?: string;
  updatedAt?: string;
  reactions?: ReasonReactionApiResponse[] | null;
}

export interface CreateReasonApiRequest {
  text: string;
  visibilityLevel: number;
  unlockDate?: string | null;
}

export interface UpdateReasonApiRequest {
  text?: string;
  visibilityLevel?: number;
  unlockDate?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReasonApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getReasons(): Observable<ReasonApiResponse[]> {
    return this.http.get<ReasonApiResponse[]>(`${this.apiBaseUrl}/api/reasons`);
  }

  getDailyReason(): Observable<ReasonApiResponse> {
    return this.http.get<ReasonApiResponse>(`${this.apiBaseUrl}/api/reasons/daily`);
  }

  getRandomReason(): Observable<ReasonApiResponse> {
    return this.http.get<ReasonApiResponse>(`${this.apiBaseUrl}/api/reasons/random`);
  }

  getReasonById(id: string): Observable<ReasonApiResponse> {
    return this.http.get<ReasonApiResponse>(`${this.apiBaseUrl}/api/reasons/${id}`);
  }

  createReason(request: CreateReasonApiRequest): Observable<ReasonApiResponse> {
    return this.http.post<ReasonApiResponse>(`${this.apiBaseUrl}/api/reasons`, request);
  }

  updateReason(id: string, request: UpdateReasonApiRequest): Observable<ReasonApiResponse> {
    return this.http.put<ReasonApiResponse>(`${this.apiBaseUrl}/api/reasons/${id}`, request);
  }

  deleteReason(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/reasons/${id}`);
  }

  addReaction(id: string, type: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/reasons/${id}/reactions`, { type });
  }

  removeReaction(id: string, type: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/reasons/${id}/reactions/${type}`);
  }
}
