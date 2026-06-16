import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OnboardingQuestion {
  id: string;
  prompt: string;
  category?: string;
  required?: boolean;
  options?: string[];
}

export interface OnboardingAnswer {
  questionId: string;
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class OnboardingApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getQuestions(): Observable<OnboardingQuestion[]> {
    return this.http.get<OnboardingQuestion[]>(`${this.apiBaseUrl}/api/onboarding/questions`);
  }

  getMyAnswers(): Observable<OnboardingAnswer[]> {
    return this.http.get<OnboardingAnswer[]>(`${this.apiBaseUrl}/api/onboarding/my-answers`);
  }

  saveAnswers(answers: OnboardingAnswer[]): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/onboarding/answers`, { answers });
  }
}
