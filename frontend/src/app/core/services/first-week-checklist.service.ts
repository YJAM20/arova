import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FirstWeekChecklistItem, ChecklistState } from '../../shared/models/first-week-checklist.model';
import { MemoryDataService } from './memory-data.service';
import { LetterDataService } from './letter-data.service';
import { ReasonDataService } from './reason-data.service';
import { MoodDataService } from './mood-data.service';
import { SongDataService } from './song-data.service';
import { DailyQuestionService } from './daily-question.service';
import { CheckInService } from './check-in.service';
import { ImportantDateDataService } from './important-date-data.service';
import { CoupleGoalDataService } from './couple-goal-data.service';

const STORAGE_KEY = 'arova-first-week-checklist-v1';

@Injectable({ providedIn: 'root' })
export class FirstWeekChecklistService {
  constructor(
    private memoryData: MemoryDataService,
    private letterData: LetterDataService,
    private reasonData: ReasonDataService,
    private moodData: MoodDataService,
    private songData: SongDataService,
    private dailyQuestion: DailyQuestionService,
    private checkIn: CheckInService,
    private importantDate: ImportantDateDataService,
    private goalsData: CoupleGoalDataService
  ) {}

  private getState(): ChecklistState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { dismissed: false, snoozedUntil: null, planetVisited: false };
    }
    try {
      const state = JSON.parse(raw);
      return {
        dismissed: !!state.dismissed,
        snoozedUntil: state.snoozedUntil || null,
        planetVisited: !!state.planetVisited,
      };
    } catch {
      return { dismissed: false, snoozedUntil: null, planetVisited: false };
    }
  }

  private saveState(state: ChecklistState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  isDismissed(): boolean {
    const state = this.getState();
    if (state.dismissed) return true;
    if (state.snoozedUntil) {
      const snoozed = new Date(state.snoozedUntil).getTime();
      if (snoozed > Date.now()) {
        return true;
      }
    }
    return false;
  }

  snoozeChecklist(hours = 24): void {
    const state = this.getState();
    const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    state.snoozedUntil = until;
    this.saveState(state);
  }

  dismissChecklist(): void {
    const state = this.getState();
    state.dismissed = true;
    this.saveState(state);
  }

  restoreChecklist(): void {
    const state = this.getState();
    state.dismissed = false;
    state.snoozedUntil = null;
    this.saveState(state);
  }

  markPlanetVisited(): void {
    const state = this.getState();
    if (!state.planetVisited) {
      state.planetVisited = true;
      this.saveState(state);
    }
  }

  getChecklistItems(): Observable<FirstWeekChecklistItem[]> {
    const state = this.getState();

    return combineLatest([
      this.memoryData.getMemories().pipe(catchError(() => of([]))),
      this.letterData.getLetters().pipe(catchError(() => of([]))),
      this.reasonData.getReasons().pipe(catchError(() => of([]))),
      this.moodData.getMoodHistory().pipe(catchError(() => of([]))),
      this.songData.getSongs().pipe(catchError(() => of([]))),
      this.dailyQuestion.getHistory().pipe(catchError(() => of([]))),
      this.checkIn.getRecentHistory().pipe(catchError(() => of([]))),
      this.importantDate.getVisibleImportantDatesForCurrentUser().pipe(catchError(() => of([]))),
      this.goalsData.getGoals().pipe(catchError(() => of([])))
    ]).pipe(
      map(([memories, letters, reasons, moods, songs, dailyQuestions, checkIns, importantDates, goals]) => {
        return [
          {
            id: 'first-memory',
            titleKey: 'checklistMemoryTitle',
            descKey: 'checklistMemoryDesc',
            route: '/memories/new',
            ctaLabel: 'Add memory',
            completed: memories.length > 0,
          },
          {
            id: 'first-letter',
            titleKey: 'checklistLetterTitle',
            descKey: 'checklistLetterDesc',
            route: '/letters/new',
            ctaLabel: 'Write letter',
            completed: letters.length > 0,
          },
          {
            id: 'first-reason',
            titleKey: 'checklistReasonTitle',
            descKey: 'checklistReasonDesc',
            route: '/reasons/new',
            ctaLabel: 'Write reason',
            completed: reasons.length > 0,
          },
          {
            id: 'first-mood',
            titleKey: 'checklistMoodTitle',
            descKey: 'checklistMoodDesc',
            route: '/check-in',
            ctaLabel: 'Check mood',
            completed: moods.length > 0,
          },
          {
            id: 'first-song',
            titleKey: 'checklistSongTitle',
            descKey: 'checklistSongDesc',
            route: '/music',
            ctaLabel: 'Add song',
            completed: songs.length > 0,
          },
          {
            id: 'first-daily-question',
            titleKey: 'checklistQuestionTitle',
            descKey: 'checklistQuestionDesc',
            route: '/daily-questions',
            ctaLabel: 'Answer question',
            completed: dailyQuestions.length > 0,
          },
          {
            id: 'first-check-in',
            titleKey: 'checklistCheckInTitle',
            descKey: 'checklistCheckInDesc',
            route: '/check-in',
            ctaLabel: 'Check in',
            completed: checkIns.length > 0,
          },
          {
            id: 'first-important-date',
            titleKey: 'checklistImportantDateTitle',
            descKey: 'checklistImportantDateDesc',
            route: '/important-dates',
            ctaLabel: 'Add date',
            completed: importantDates.length > 0,
          },
          {
            id: 'first-goal',
            titleKey: 'checklistGoalTitle',
            descKey: 'checklistGoalDesc',
            route: '/goals',
            ctaLabel: 'Create goal',
            completed: goals.length > 0,
          },
          {
            id: 'first-planet-visit',
            titleKey: 'checklistPlanetVisitTitle',
            descKey: 'checklistPlanetVisitDesc',
            route: '/planets',
            ctaLabel: 'Visit planets',
            completed: state.planetVisited,
            optional: true,
          }
        ];
      })
    );
  }
}
