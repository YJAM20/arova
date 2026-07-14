import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toFriendlyError as friendlyErrorHelper } from './error-handler.utils';
import {
  DailyQuestion,
  DailyQuestionAnswer,
  DailyQuestionCategory,
} from '../../shared/models/daily-question.model';
import { AppModeService } from './app-mode.service';
import { DailyQuestionApiService } from './daily-question-api.service';
import { DailyQuestionDataService } from './daily-question-data.service';
import type { DailyQuestionHistoryItem } from './daily-question-data.service';
import { TokenStorageService } from './token-storage.service';

export type { DailyQuestionHistoryItem };

@Injectable({ providedIn: 'root' })
export class DailyQuestionService {
  constructor(
    private appMode: AppModeService,
    private localData: DailyQuestionDataService,
    private apiService: DailyQuestionApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getTodayQuestion(): Observable<DailyQuestion> {
    if (this.appMode.isLocalMode()) {
      return this.localData.getTodayQuestion();
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.apiService.getTodayQuestion().pipe(
      map(q => this.questionFromApi(q)),
      catchError(err => this.toFriendlyError(err))
    );
  }

  getTodayDateKey(date = new Date()): string {
    return this.localData.getTodayDateKey(date);
  }

  getCategories(): DailyQuestionCategory[] {
    return this.localData.getCategories();
  }

  getAnswersForDate(dateKey: string): Observable<DailyQuestionHistoryItem[]> {
    if (this.appMode.isLocalMode()) {
      return this.localData.getAnswersForDate(dateKey);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    // in API mode, history contains all answers, we can filter today's answers or fetch all
    return this.apiService.getTodayAnswers().pipe(
      map(answers => answers.map(a => this.historyItemFromApi(a))),
      catchError(err => this.toFriendlyError(err))
    );
  }

  getCurrentUserAnswer(questionId: string, dateKey: string): Observable<DailyQuestionAnswer | null> {
    if (this.appMode.isLocalMode()) {
      return this.localData.getCurrentUserAnswer(questionId, dateKey);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    const apiUserId = this.currentApiUserId();
    return this.apiService.getTodayAnswers().pipe(
      map(answers => {
        const found = answers.find(a => a.userId === apiUserId);
        return found ? this.answerFromApi(found) : null;
      }),
      catchError(err => this.toFriendlyError(err))
    );
  }

  saveAnswer(questionId: string, dateKey: string, answer: string): Observable<DailyQuestionAnswer | null> {
    if (this.appMode.isLocalMode()) {
      return this.localData.saveAnswer(questionId, dateKey, answer);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.apiService.answerTodayQuestion({ answer: answer.trim() }).pipe(
      map(a => this.answerFromApi(a)),
      catchError(err => this.toFriendlyError(err))
    );
  }

  getHistory(limit = 18): Observable<DailyQuestionHistoryItem[]> {
    if (this.appMode.isLocalMode()) {
      return this.localData.getHistory(limit);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.apiService.getHistoryAnswers().pipe(
      map(answers => answers.map(a => this.historyItemFromApi(a)).slice(0, limit)),
      catchError(err => this.toFriendlyError(err))
    );
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  getApiModeMissingMessage(): string | null {
    return this.apiReadinessError();
  }

  private questionFromApi(q: any): DailyQuestion {
    return {
      id: q.id,
      prompt: q.prompt,
      category: q.category as DailyQuestionCategory,
    };
  }

  private answerFromApi(a: any): DailyQuestionAnswer {
    return {
      id: a.id,
      questionId: a.questionId,
      dateKey: a.dateKey,
      userId: a.userId,
      answer: a.answer,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt || a.createdAt,
    };
  }

  private historyItemFromApi(a: any): DailyQuestionHistoryItem {
    return {
      ...this.answerFromApi(a),
      userName: a.userDisplayName || 'Partner',
      question: {
        id: a.questionId,
        prompt: this.localData.getQuestionById(a.questionId)?.prompt || 'Daily Question',
        category: this.localData.getQuestionById(a.questionId)?.category || 'connection',
      },
    };
  }

  private apiReadinessError(): string | null {
    if (!this.tokenStorage.hasToken()) {
      return 'Please login in API Mode first.';
    }
    return null;
  }

  private currentApiUserId(): string | null {
    const token = this.tokenStorage.getToken();
    if (!token) return null;

    try {
      const segment = token.split('.')[1];
      if (!segment) return null;

      const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
      return this.asString(payload['sub'])
        ?? this.asString(payload['nameid'])
        ?? this.asString(payload['userId'])
        ?? this.asString(payload['id'])
        ?? this.asString(
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        )
        ?? null;
    } catch {
      return null;
    }
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private toFriendlyError(error: unknown): Observable<never> {
    return friendlyErrorHelper(
      error,
      'Daily question request failed. Please try again.',
      'Question not found.'
    );
  }
}
