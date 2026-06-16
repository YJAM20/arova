import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MoodType } from '../../shared/models/mood.model';

export interface MoodApiResponse {
  id: string;
  userId?: string;
  createdByUserId?: string;
  mood: string;
  note?: string | null;
  response?: string | null;
  date?: string;
  createdAt?: string;
}

export interface CreateMoodApiRequest {
  mood: MoodType;
  note?: string | null;
}

export interface MoodResponseApiRequest {
  response: string;
}

@Injectable({ providedIn: 'root' })
export class MoodApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getMoods(): Observable<MoodApiResponse[]> {
    return this.http.get<MoodApiResponse[]>(`${this.apiBaseUrl}/api/moods`);
  }

  getTodayMood(): Observable<MoodApiResponse | null> {
    return this.http.get<MoodApiResponse | null>(`${this.apiBaseUrl}/api/moods/today`);
  }

  createMood(request: CreateMoodApiRequest): Observable<MoodApiResponse> {
    return this.http.post<MoodApiResponse>(`${this.apiBaseUrl}/api/moods`, request);
  }

  respondToMood(id: string, request: MoodResponseApiRequest): Observable<MoodApiResponse> {
    return this.http.post<MoodApiResponse>(`${this.apiBaseUrl}/api/moods/${id}/response`, request);
  }
}
