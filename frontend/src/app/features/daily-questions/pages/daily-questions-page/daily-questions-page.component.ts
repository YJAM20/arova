import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  question: DailyQuestion | null = null;
  dateKey = '';
  answerDraft = '';
  message = '';
  errorMessage = '';
  isLoading = false;
  todayAnswers: DailyQuestionHistoryItem[] = [];
  history: DailyQuestionHistoryItem[] = [];
  isApiMode = false;

  categoryLabels: Record<string, string> = {
    connection: 'Connection',
    fun: 'Fun',
    deep: 'Deep',
    appreciation: 'Appreciation',
    future: 'Future',
    'conflict-safe': 'Conflict-safe',
  };

  constructor(private dailyQuestions: DailyQuestionService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isApiMode = this.dailyQuestions.isApiMode();
    this.dateKey = this.dailyQuestions.getTodayDateKey();
    this.loadQuestion();
  }

  loadQuestion(): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('loadQuestion: subscribing to getTodayQuestion');
    this.dailyQuestions.getTodayQuestion().subscribe({
      next: (q) => {
        console.log('loadQuestion: next called with q:', q);
        this.question = q;
        if (q) {
          this.dailyQuestions.getCurrentUserAnswer(q.id, this.dateKey).subscribe({
            next: (existing) => {
              console.log('loadQuestion: getCurrentUserAnswer next:', existing);
              this.answerDraft = existing?.answer ?? '';
              this.isLoading = false;
              this.refresh();
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.log('loadQuestion: getCurrentUserAnswer error:', err);
              this.errorMessage = err.message || 'Failed to check existing answer.';
              this.isLoading = false;
              this.refresh();
              this.cdr.detectChanges();
            }
          });
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.log('loadQuestion: getTodayQuestion error:', err);
        this.errorMessage = err.message || 'Failed to load daily question.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveAnswer(): void {
    if (!this.question) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.message = '';

    this.dailyQuestions.saveAnswer(this.question.id, this.dateKey, this.answerDraft).subscribe({
      next: (saved) => {
        if (saved) {
          this.message = this.isApiMode 
            ? 'Your answer has been saved and shared in your universe space!' 
            : "Your answer was saved locally.";
        }
        this.isLoading = false;
        this.refresh();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to save answer.';
        this.isLoading = false;
      }
    });
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
    this.dailyQuestions.getAnswersForDate(this.dateKey).subscribe({
      next: (answers) => {
        this.todayAnswers = answers;
      },
      error: (err) => {
        // silently handle or log background updates
      }
    });

    this.dailyQuestions.getHistory().subscribe({
      next: (historyItems) => {
        this.history = historyItems;
      },
      error: (err) => {
        // silently handle background history errors
      }
    });
  }
}
