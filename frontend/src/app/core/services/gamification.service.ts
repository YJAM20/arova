import { Injectable, signal } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppModeService } from './app-mode.service';
import { RelationshipPointsService, RankInfo } from './relationship-points.service';
import { RelationshipScoreApiService, DailyTaskApiResponse } from './relationship-score-api.service';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';

export interface GamificationScore {
  totalPoints: number;
  streak: number;
  currentRankTitle: string;
  nextRankTitle: string | null;
  nextRankThreshold: number;
  progressPercent: number;
}

export interface GamificationDailyTask {
  id: string;
  taskKey: string;
  title: string;
  description: string;
  pointsReward: number;
  isCompleted: boolean;
}

/**
 * Dual-mode facade for all gamification operations.
 *
 * - Local Mode: delegates synchronously to RelationshipPointsService (localStorage).
 * - API Mode:   uses RelationshipScoreApiService (HTTP). Awards are fire-and-forget
 *               with silent error handling so they never break the primary feature.
 */
@Injectable({ providedIn: 'root' })
export class GamificationService {
  /** Reactive signal for the latest score — updated after every award in API Mode. */
  readonly scoreSignal = signal<GamificationScore | null>(null);

  constructor(
    private appMode: AppModeService,
    private local: RelationshipPointsService,
    private api: RelationshipScoreApiService,
    private tokenStorage: TokenStorageService
  ) {}

  // ─── Score ────────────────────────────────────────────────────────────────

  /**
   * Returns an Observable of the current gamification score.
   * Local Mode: synchronous from localStorage.
   * API Mode:   HTTP GET with friendly error fallback.
   */
  getScore(): Observable<GamificationScore> {
    if (this.appMode.isLocalMode()) {
      return of(this.localScore());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.api.getScore().pipe(
      map(r => ({
        totalPoints: r.totalPoints,
        streak: r.streak,
        currentRankTitle: r.currentRank,
        nextRankTitle: r.nextRank ?? null,
        nextRankThreshold: r.nextRankThreshold,
        progressPercent: r.progressPercent,
      })),
      catchError(err => this.toFriendlyError(err))
    );
  }

  /** Synchronous local score (for non-reactive consumers in Local Mode). */
  getLocalScore(): GamificationScore {
    return this.localScore();
  }

  // ─── Ledger ────────────────────────────────────────────────────────────────

  getLedger(): Observable<{ id: string; action: string; points: number; timestamp: string }[]> {
    if (this.appMode.isLocalMode()) {
      const entries = this.local.getLedger().map(e => ({
        id: e.id,
        action: e.action,
        points: e.points,
        timestamp: e.timestamp,
      }));
      return of(entries);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.api.getLedger().pipe(
      map(entries => entries.map(e => ({
        id: e.id,
        action: e.reason || e.actionType,
        points: e.points,
        timestamp: e.createdAt,
      }))),
      catchError(err => this.toFriendlyError(err))
    );
  }

  // ─── Daily Tasks ───────────────────────────────────────────────────────────

  getDailyTasks(): Observable<GamificationDailyTask[]> {
    if (this.appMode.isLocalMode()) {
      return of([]); // local mode uses PlanetService for planet tasks
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.api.getDailyTasks().pipe(
      map(tasks => tasks.map(this.mapDailyTask)),
      catchError(err => this.toFriendlyError(err))
    );
  }

  completeDailyTask(id: string): Observable<GamificationDailyTask> {
    if (this.appMode.isLocalMode()) {
      return throwError(() => new Error('Daily task completion not available in Local Mode.'));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.api.completeDailyTask(id).pipe(
      map(this.mapDailyTask),
      catchError(err => this.toFriendlyError(err))
    );
  }

  // ─── Award Points ──────────────────────────────────────────────────────────

  /**
   * Awards points for a named action.
   * - Local Mode: synchronous via RelationshipPointsService.
   * - API Mode:   fire-and-forget POST; errors are swallowed so the primary
   *               feature interaction is never blocked.
   */
  awardPoints(action: string, amount: number, sourceType?: string): void {
    if (this.appMode.isLocalMode()) {
      this.local.awardPoints(action, amount);
      return;
    }

    if (this.apiReadinessError()) return;

    this.api.awardPoints({
      actionType: action,
      points: amount,
      reason: action,
      sourceType: sourceType ?? null,
    }).pipe(
      catchError(() => of(null)) // never throw — reward failures are silent
    ).subscribe(response => {
      if (response) {
        // Update the score signal optimistically after a successful award
        this.getScore().pipe(catchError(() => of(null))).subscribe(score => {
          if (score) this.scoreSignal.set(score);
        });
      }
    });
  }

  // ─── Named Reward Helpers ──────────────────────────────────────────────────

  rewardPlanetComplete(): void {
    this.awardPoints('Completed daily planet ritual', 50, 'Planet');
  }

  rewardDailyQuestion(): void {
    this.awardPoints('Answered daily question', 15, 'DailyQuestion');
  }

  rewardMemoryCreated(): void {
    this.awardPoints('Preserved a new memory', 20, 'Memory');
  }

  rewardLetterWritten(): void {
    this.awardPoints('Deposited letter in vault', 25, 'Letter');
  }

  rewardChatMessage(): void {
    this.awardPoints('Sent chat message', 2, 'Chat');
  }

  rewardReasonReaction(): void {
    this.awardPoints('Reacted to reason listing', 5, 'Reason');
  }

  rewardMoodCheck(): void {
    this.awardPoints('Shared mood check-in', 10, 'Mood');
  }

  rewardChallengeComplete(): void {
    this.awardPoints('Finished relationship challenge', 30, 'Challenge');
  }

  rewardFuturePlanCreated(): void {
    this.awardPoints('Added future board listing', 15, 'FuturePlan');
  }

  rewardImportantDateCreated(): void {
    this.awardPoints('Saved important date milestone', 15, 'ImportantDate');
  }

  rewardGoalCreated(): void {
    this.awardPoints('Created couple goal', 15, 'CoupleGoal');
  }

  rewardMilestoneCompleted(): void {
    this.awardPoints('Completed goal milestone', 5, 'CoupleGoalMilestone');
  }

  rewardGoalCompleted(): void {
    this.awardPoints('Completed couple goal', 30, 'CoupleGoal');
  }

  // ─── Mode helpers ──────────────────────────────────────────────────────────

  isLocalMode(): boolean {
    return this.appMode.isLocalMode();
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private localScore(): GamificationScore {
    const rank: RankInfo = this.local.getCurrentRank();
    const next: RankInfo | null = this.local.getNextRank();
    return {
      totalPoints: this.local.getTotalPoints(),
      streak: this.local.getStreak(),
      currentRankTitle: rank.title,
      nextRankTitle: next?.title ?? null,
      nextRankThreshold: next?.minPoints ?? rank.maxPoints,
      progressPercent: this.local.getProgressPercent(),
    };
  }

  private readonly mapDailyTask = (t: DailyTaskApiResponse): GamificationDailyTask => ({
    id: t.id,
    taskKey: t.taskKey,
    title: t.title,
    description: t.description,
    pointsReward: t.pointsReward,
    isCompleted: t.isCompleted,
  });

  private apiReadinessError(): string | null {
    return this.tokenStorage.hasToken() ? null : 'Please login in API Mode first.';
  }

  private toFriendlyError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error('Gamification request failed. Please try again.'));
    }
    if (error.status === 0) {
      return throwError(() => new Error(`Backend is not reachable. Make sure ${environment.apiBaseUrl} is running.`));
    }
    if (error.status === 401) {
      return throwError(() => new Error('Please login in API Mode first.'));
    }
    return throwError(() => new Error(`Gamification request failed (${error.status}).`));
  }
}
