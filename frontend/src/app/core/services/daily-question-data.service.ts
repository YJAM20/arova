import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  DailyQuestion,
  DailyQuestionAnswer,
  DailyQuestionCategory,
} from '../../shared/models/daily-question.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

export interface DailyQuestionHistoryItem extends DailyQuestionAnswer {
  question: DailyQuestion;
  userName: string;
}

const QUESTION_BANK: DailyQuestion[] = [
  {
    id: 'dq-connection-001',
    category: 'connection',
    prompt: 'What helped you feel close to your partner recently?',
  },
  {
    id: 'dq-fun-001',
    category: 'fun',
    prompt: 'What small silly thing would make today lighter for both of you?',
  },
  {
    id: 'dq-deep-001',
    category: 'deep',
    prompt: 'What is one feeling you want your partner to understand better?',
  },
  {
    id: 'dq-appreciation-001',
    category: 'appreciation',
    prompt: 'What is one ordinary thing your partner does that you appreciate?',
  },
  {
    id: 'dq-future-001',
    category: 'future',
    prompt: 'What is one simple future moment you would like to share?',
  },
  {
    id: 'dq-conflict-safe-001',
    category: 'conflict-safe',
    prompt: 'What helps you feel respected during a hard conversation?',
  },
  {
    id: 'dq-connection-002',
    category: 'connection',
    prompt: 'What is one way you can make distance feel smaller this week?',
  },
  {
    id: 'dq-fun-002',
    category: 'fun',
    prompt: 'What would be your ideal low-effort date at home?',
  },
  {
    id: 'dq-deep-002',
    category: 'deep',
    prompt: 'What is something you are learning about yourself in this relationship?',
  },
  {
    id: 'dq-appreciation-002',
    category: 'appreciation',
    prompt: 'What made you feel cared for recently?',
  },
  {
    id: 'dq-future-002',
    category: 'future',
    prompt: 'What shared habit would you like to build slowly?',
  },
  {
    id: 'dq-conflict-safe-002',
    category: 'conflict-safe',
    prompt: 'What gentle reset would help after a misunderstanding?',
  },
];

@Injectable({ providedIn: 'root' })
export class DailyQuestionDataService {
  constructor(private storage: StorageService, private auth: AuthService) {}

  getTodayQuestion(date = new Date()): Observable<DailyQuestion> {
    const dateKey = this.toDateKey(date);
    const seed = Array.from(dateKey).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return of(QUESTION_BANK[seed % QUESTION_BANK.length]);
  }

  getTodayDateKey(date = new Date()): string {
    return this.toDateKey(date);
  }

  getCategories(): DailyQuestionCategory[] {
    return ['connection', 'fun', 'deep', 'appreciation', 'future', 'conflict-safe'];
  }

  getAnswersForDate(dateKey: string): Observable<DailyQuestionHistoryItem[]> {
    const answers = this.storage.getDailyQuestionAnswers().filter(answer => answer.dateKey === dateKey);
    return of(this.toHistoryItems(answers));
  }

  getCurrentUserAnswer(questionId: string, dateKey: string): Observable<DailyQuestionAnswer | null> {
    const user = this.auth.getCurrentUser();
    if (!user) return of(null);

    const answer = this.storage
      .getDailyQuestionAnswers()
      .find(
        ans =>
          ans.userId === user.id &&
          ans.questionId === questionId &&
          ans.dateKey === dateKey
      ) ?? null;

    return of(answer);
  }

  saveAnswer(questionId: string, dateKey: string, answer: string): Observable<DailyQuestionAnswer | null> {
    const user = this.auth.getCurrentUser();
    const trimmed = answer.trim();
    if (!user || !trimmed) return of(null);

    const saved = this.storage.upsertDailyQuestionAnswer({
      questionId,
      dateKey,
      userId: user.id,
      answer: trimmed,
    });
    return of(saved);
  }

  getHistory(limit = 18): Observable<DailyQuestionHistoryItem[]> {
    const items = this.toHistoryItems(this.storage.getDailyQuestionAnswers())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
    return of(items);
  }

  getQuestionById(id: string): DailyQuestion {
    return QUESTION_BANK.find(question => question.id === id) ?? QUESTION_BANK[0];
  }

  getUserName(userId: string): string {
    return this.storage.getUsers().find(user => user.id === userId)?.displayName ?? 'Partner';
  }

  private toHistoryItems(answers: DailyQuestionAnswer[]): DailyQuestionHistoryItem[] {
    return answers.map(answer => ({
      ...answer,
      question: this.getQuestionById(answer.questionId),
      userName: this.getUserName(answer.userId),
    }));
  }

  private toDateKey(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
