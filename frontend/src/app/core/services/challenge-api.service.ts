import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChallengeCompletionApiResponse {
  userId?: string;
  answer?: string | null;
  completedAt?: string;
}

export interface ChallengeApiResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  isDaily?: boolean;
  completedBy?: ChallengeCompletionApiResponse[] | null;
  completions?: ChallengeCompletionApiResponse[] | null;
  createdAt?: string;
}

export interface CreateChallengeApiRequest {
  title: string;
  description: string;
  category: string;
  isDaily: boolean;
}

export type UpdateChallengeApiRequest = Partial<CreateChallengeApiRequest>;

export interface CompleteChallengeApiRequest {
  answer?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ChallengeApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getChallenges(): Observable<ChallengeApiResponse[]> {
    return this.http.get<ChallengeApiResponse[]>(`${this.apiBaseUrl}/api/challenges`);
  }

  getDailyChallenge(): Observable<ChallengeApiResponse | null> {
    return this.http.get<ChallengeApiResponse | null>(`${this.apiBaseUrl}/api/challenges/daily`);
  }

  createChallenge(request: CreateChallengeApiRequest): Observable<ChallengeApiResponse> {
    return this.http.post<ChallengeApiResponse>(`${this.apiBaseUrl}/api/challenges`, request);
  }

  updateChallenge(id: string, request: UpdateChallengeApiRequest): Observable<ChallengeApiResponse> {
    return this.http.put<ChallengeApiResponse>(`${this.apiBaseUrl}/api/challenges/${id}`, request);
  }

  deleteChallenge(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/challenges/${id}`);
  }

  completeChallenge(id: string, request: CompleteChallengeApiRequest): Observable<ChallengeApiResponse> {
    return this.http.post<ChallengeApiResponse>(
      `${this.apiBaseUrl}/api/challenges/${id}/complete`,
      request
    );
  }
}
