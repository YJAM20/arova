import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CheckInApiResponse {
  id: string;
  userId: string;
  userDisplayName: string;
  dateKey: string;
  connectionLevel: number;
  energyLevel: number;
  communicationFeeling: number;
  note?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CheckInCreateApiRequest {
  connectionLevel: number;
  energyLevel: number;
  communicationFeeling: number;
  note?: string | null;
}

export interface CheckInUpdateApiRequest {
  connectionLevel: number;
  energyLevel: number;
  communicationFeeling: number;
  note?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CheckInApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getCheckIns(): Observable<CheckInApiResponse[]> {
    return this.http.get<CheckInApiResponse[]>(`${this.apiBaseUrl}/api/check-ins`);
  }

  getTodayCheckIns(): Observable<CheckInApiResponse[]> {
    return this.http.get<CheckInApiResponse[]>(`${this.apiBaseUrl}/api/check-ins/today`);
  }

  createCheckIn(request: CheckInCreateApiRequest): Observable<CheckInApiResponse> {
    return this.http.post<CheckInApiResponse>(`${this.apiBaseUrl}/api/check-ins`, request);
  }

  updateCheckIn(id: string, request: CheckInUpdateApiRequest): Observable<CheckInApiResponse> {
    return this.http.put<CheckInApiResponse>(`${this.apiBaseUrl}/api/check-ins/${id}`, request);
  }

  deleteCheckIn(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/check-ins/${id}`);
  }
}
