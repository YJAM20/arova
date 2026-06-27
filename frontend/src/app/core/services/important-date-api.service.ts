import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportantDateType, RecurrenceType } from '../../shared/models/important-date.model';

export interface ImportantDateApiResponse {
  id: string;
  coupleId: string;
  createdByUserId: string;
  title: string;
  description?: string | null;
  date: string;
  type: string;
  recurrence: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  isPrivate: boolean;
  daysRemaining?: number;
  nextOccurrenceDate?: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateImportantDateApiRequest {
  title: string;
  description?: string | null;
  date: string;
  type: ImportantDateType;
  recurrence: RecurrenceType;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  isPrivate: boolean;
}

export type UpdateImportantDateApiRequest = Partial<CreateImportantDateApiRequest>;

@Injectable({ providedIn: 'root' })
export class ImportantDateApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getImportantDates(): Observable<ImportantDateApiResponse[]> {
    return this.http.get<ImportantDateApiResponse[]>(`${this.apiBaseUrl}/api/important-dates`);
  }

  getUpcomingDates(): Observable<ImportantDateApiResponse[]> {
    return this.http.get<ImportantDateApiResponse[]>(`${this.apiBaseUrl}/api/important-dates/upcoming`);
  }

  getDateById(id: string): Observable<ImportantDateApiResponse> {
    return this.http.get<ImportantDateApiResponse>(`${this.apiBaseUrl}/api/important-dates/${id}`);
  }

  createDate(request: CreateImportantDateApiRequest): Observable<ImportantDateApiResponse> {
    return this.http.post<ImportantDateApiResponse>(`${this.apiBaseUrl}/api/important-dates`, request);
  }

  updateDate(id: string, request: UpdateImportantDateApiRequest): Observable<ImportantDateApiResponse> {
    return this.http.put<ImportantDateApiResponse>(`${this.apiBaseUrl}/api/important-dates/${id}`, request);
  }

  deleteDate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/important-dates/${id}`);
  }

  sendTestReminders(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiBaseUrl}/api/important-dates/reminders/send-test`, {});
  }
}
