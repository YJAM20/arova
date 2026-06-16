import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanetService, Planet, DailyPlanetState } from '../../../../core/services/planet.service';
import { RelationshipPointsService } from '../../../../core/services/relationship-points.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-planets-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planets-home.component.html',
  styleUrls: ['./planets-home.component.scss'],
})
export class PlanetsHomeComponent implements OnInit {
  todayPlanet!: Planet;
  state!: DailyPlanetState;
  allPlanets: Planet[] = [];
  
  // Daily question answers mock
  answerText = '';
  answerSaved = false;
  
  constructor(
    private planetService: PlanetService,
    private pointsService: RelationshipPointsService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.todayPlanet = this.planetService.getTodayPlanet();
    this.state = this.planetService.getTodayState();
    this.allPlanets = this.planetService.getPlanets();
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
    if (!this.answerText.trim()) return;
    this.answerSaved = true;
    this.pointsService.rewardDailyQuestion();
    setTimeout(() => {
      this.answerText = '';
      this.answerSaved = false;
    }, 3000);
  }

  t(key: string): string {
    return this.translation.t(key);
  }
}
