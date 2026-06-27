import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DailyQuestionApiResponse {
  id: string;
  prompt: string;
  category: string;
}

export interface DailyQuestionAnswerApiResponse {
  id: string;
  questionId: string;
  dateKey: string;
  userId: string;
  userDisplayName: string;
  answer: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DailyQuestionAnswerApiRequest {
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class DailyQuestionApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getTodayQuestion(): Observable<DailyQuestionApiResponse> {
    return this.http.get<DailyQuestionApiResponse>(`${this.apiBaseUrl}/api/daily-questions/today`);
  }

  getHistoryAnswers(): Observable<DailyQuestionAnswerApiResponse[]> {
    return this.http.get<DailyQuestionAnswerApiResponse[]>(`${this.apiBaseUrl}/api/daily-questions/history`);
  }

  getTodayAnswers(): Observable<DailyQuestionAnswerApiResponse[]> {
    return this.http.get<DailyQuestionAnswerApiResponse[]>(`${this.apiBaseUrl}/api/daily-questions/today/answers`);
  }

  answerTodayQuestion(request: DailyQuestionAnswerApiRequest): Observable<DailyQuestionAnswerApiResponse> {
    return this.http.post<DailyQuestionAnswerApiResponse>(`${this.apiBaseUrl}/api/daily-questions/answer`, request);
  }

  updateAnswer(id: string, request: DailyQuestionAnswerApiRequest): Observable<DailyQuestionAnswerApiResponse> {
    return this.http.put<DailyQuestionAnswerApiResponse>(`${this.apiBaseUrl}/api/daily-questions/answers/${id}`, request);
  }

  deleteAnswer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/daily-questions/answers/${id}`);
  }
}
