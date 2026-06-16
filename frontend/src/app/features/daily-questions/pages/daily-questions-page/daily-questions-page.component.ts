import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DailyQuestionHistoryItem,
  DailyQuestionService,
} from '../../../../core/services/daily-question.service';
import { DailyQuestion } from '../../../../shared/models/daily-question.model';

@Component({
  selector: 'app-daily-questions-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-questions-page.component.html',
  styleUrls: ['./daily-questions-page.component.scss'],
})
export class DailyQuestionsPageComponent implements OnInit {
  question!: DailyQuestion;
  dateKey = '';
  answerDraft = '';
  message = '';
  todayAnswers: DailyQuestionHistoryItem[] = [];
  history: DailyQuestionHistoryItem[] = [];

  categoryLabels: Record<string, string> = {
    connection: 'Connection',
    fun: 'Fun',
    deep: 'Deep',
    appreciation: 'Appreciation',
    future: 'Future',
    'conflict-safe': 'Conflict-safe',
  };

  constructor(private dailyQuestions: DailyQuestionService) {}

  ngOnInit(): void {
    this.question = this.dailyQuestions.getTodayQuestion();
    this.dateKey = this.dailyQuestions.getTodayDateKey();
    const existing = this.dailyQuestions.getCurrentUserAnswer(this.question.id, this.dateKey);
    this.answerDraft = existing?.answer ?? '';
    this.refresh();
  }

  saveAnswer(): void {
    const saved = this.dailyQuestions.saveAnswer(this.question.id, this.dateKey, this.answerDraft);
    if (!saved) return;

    this.message = 'Your answer was saved locally.';
    this.refresh();
  }

  formatDate(dateKey: string): string {
    return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  categoryLabel(category: string): string {
    return this.categoryLabels[category] ?? category;
  }

  private refresh(): void {
    this.todayAnswers = this.dailyQuestions.getAnswersForDate(this.dateKey);
    this.history = this.dailyQuestions.getHistory();
  }
}
