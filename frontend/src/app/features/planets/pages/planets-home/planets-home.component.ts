import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanetService, Planet, DailyPlanetState } from '../../../../core/services/planet.service';
import { GamificationService } from '../../../../core/services/gamification.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { DailyQuestionService } from '../../../../core/services/daily-question.service';
import { DailyQuestion } from '../../../../shared/models/daily-question.model';
import { FirstWeekChecklistService } from '../../../../core/services/first-week-checklist.service';

import { ArovaStreakHeatmapComponent } from '../../../../shared/components/arova-streak-heatmap/arova-streak-heatmap.component';

@Component({
  selector: 'app-planets-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ArovaStreakHeatmapComponent],
  templateUrl: './planets-home.component.html',
  styleUrls: ['./planets-home.component.scss'],
})
export class PlanetsHomeComponent implements OnInit {
  todayPlanet!: Planet;
  state!: DailyPlanetState;
  allPlanets: Planet[] = [];
  
  // Daily question integration
  dailyQuestion: DailyQuestion | null = null;
  answerText = '';
  dailyQuestionAnswered = false;
  dailyQuestionError = '';
  isApiMode = false;
  
  constructor(
    private planetService: PlanetService,
    private gamification: GamificationService,
    private translation: TranslationService,
    private dailyQuestionService: DailyQuestionService,
    private checklistService: FirstWeekChecklistService
  ) {}

  ngOnInit(): void {
    this.isApiMode = this.dailyQuestionService.isApiMode();
    this.refresh();
    this.loadDailyQuestion();
    this.checklistService.markPlanetVisited();
  }

  refresh(): void {
    this.todayPlanet = this.planetService.getTodayPlanet();
    this.state = this.planetService.getTodayState();
    this.allPlanets = this.planetService.getPlanets();
  }

  loadDailyQuestion(): void {
    this.dailyQuestionError = '';
    this.dailyQuestionService.getTodayQuestion().subscribe({
      next: (q) => {
        this.dailyQuestion = q;
        if (q) {
          const dateKey = this.dailyQuestionService.getTodayDateKey();
          this.dailyQuestionService.getCurrentUserAnswer(q.id, dateKey).subscribe({
            next: (existing) => {
              if (existing) {
                this.dailyQuestionAnswered = true;
                this.answerText = existing.answer;
              }
            },
            error: (err) => {
              // Silently handle error or log
            }
          });
        }
      },
      error: (err) => {
        this.dailyQuestionError = err.message || 'Failed to load daily question.';
      }
    });
  }

  toggleTask(index: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.planetService.toggleTask(index, checkbox.checked);
    this.refresh();
  }

  getProgressPercent(): number {
    if (!this.state || this.state.completedTasks.length === 0) return 0;
    const completed = this.state.completedTasks.filter(Boolean).length;
    return Math.round((completed / this.state.completedTasks.length) * 100);
  }

  saveQuestionAnswer(): void {
    if (!this.answerText.trim() || !this.dailyQuestion) return;
    this.dailyQuestionError = '';
    const dateKey = this.dailyQuestionService.getTodayDateKey();

    this.dailyQuestionService.saveAnswer(this.dailyQuestion.id, dateKey, this.answerText).subscribe({
      next: (saved) => {
        if (saved) {
          this.dailyQuestionAnswered = true;
          this.gamification.rewardDailyQuestion();
        }
      },
      error: (err) => {
        this.dailyQuestionError = err.message || 'Failed to save question response.';
      }
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }
}
