import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppModeService } from './app-mode.service';

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
  private readonly LOCAL_ANSWERS_KEY = 'arova-local-onboarding-answers-v1';

  constructor(private http: HttpClient, private appMode: AppModeService) {}

  getQuestions(): Observable<OnboardingQuestion[]> {
    if (this.appMode.isLocalMode()) {
      return of([]);
    }

    return this.http.get<OnboardingQuestion[]>(`${this.apiBaseUrl}/api/onboarding/questions`);
  }

  getMyAnswers(): Observable<OnboardingAnswer[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.readLocalAnswers());
    }

    return this.http.get<OnboardingAnswer[]>(`${this.apiBaseUrl}/api/onboarding/my-answers`);
  }

  saveAnswers(answers: OnboardingAnswer[]): Observable<unknown> {
    if (this.appMode.isLocalMode()) {
      localStorage.setItem(this.LOCAL_ANSWERS_KEY, JSON.stringify(answers));
      return of({ saved: true }).pipe(delay(0));
    }

    return this.http.post<unknown>(`${this.apiBaseUrl}/api/onboarding/answers`, { answers });
  }

  private readLocalAnswers(): OnboardingAnswer[] {
    const raw = localStorage.getItem(this.LOCAL_ANSWERS_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(item => this.isAnswerRecord(item))
        .map(item => ({
          questionId: item.questionId,
          answer: item.answer,
        }));
    } catch {
      return [];
    }
  }

  private isAnswerRecord(value: unknown): value is OnboardingAnswer {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as OnboardingAnswer).questionId === 'string' &&
      typeof (value as OnboardingAnswer).answer === 'string'
    );
  }
}
