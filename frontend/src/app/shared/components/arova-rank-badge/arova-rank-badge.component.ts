import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GamificationService, GamificationScore } from '../../../core/services/gamification.service';

@Component({
  selector: 'arova-rank-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading shimmer -->
    <div class="arova-rank-badge glass-badge shimmer-badge" *ngIf="isLoading" id="arova-rank-badge-loading" aria-label="Loading rank...">
      <div class="badge-icon shimmer-block" aria-hidden="true"></div>
      <div class="shimmer-block shimmer-text"></div>
    </div>

    <!-- Active badge -->
    <div class="arova-rank-badge glass-badge" *ngIf="!isLoading && hasPoints; else fallbackState" id="arova-rank-badge-active">
      <div class="badge-icon" aria-hidden="true">✦</div>
      <div class="badge-content">
        <span class="badge-rank">{{ score!.currentRankTitle }}</span>
        <span class="badge-divider">•</span>
        <span class="badge-points">{{ score!.totalPoints }} pts</span>
        <span class="badge-streak" *ngIf="score!.streak > 0">
          <span class="badge-divider">•</span>
          <span class="streak-icon">🔥</span> {{ score!.streak }}-day streak
        </span>
      </div>
    </div>

    <!-- Fallback / offline -->
    <ng-template #fallbackState>
      <div class="arova-rank-badge glass-badge fallback-badge" id="arova-rank-badge-fallback" *ngIf="!isLoading">
        <div class="badge-icon" aria-hidden="true">✦</div>
        <span class="badge-rank">{{ offlineMessage || 'Start your orbit' }}</span>
      </div>
    </ng-template>
  `,
  styles: [`
    .glass-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      color: var(--theme-text, #dfcfae);
      font-size: 0.8rem;
      font-family: var(--font-body, system-ui, sans-serif);
      font-weight: 500;
      letter-spacing: 0.02em;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .glass-badge:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(214, 183, 106, 0.35);
      box-shadow: 0 4px 20px rgba(214, 183, 106, 0.1);
    }

    .badge-icon {
      color: var(--theme-accent, #d6b76a);
      font-size: 0.85rem;
      text-shadow: 0 0 8px var(--theme-accent, #d6b76a);
    }

    .badge-content {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .badge-rank {
      color: var(--theme-text-primary, #ffffff);
      font-weight: 600;
    }

    .badge-divider {
      color: rgba(255, 255, 255, 0.2);
    }

    .badge-points {
      color: var(--theme-accent, #d6b76a);
    }

    .badge-streak {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #f1a7c2;
    }

    .streak-icon {
      filter: drop-shadow(0 0 4px rgba(241, 167, 194, 0.6));
    }

    .fallback-badge {
      color: rgba(255, 255, 255, 0.5);
    }

    .fallback-badge .badge-rank {
      color: rgba(255, 255, 255, 0.6);
      font-style: italic;
      font-weight: 500;
    }

    /* Shimmer loading state */
    .shimmer-badge {
      cursor: default;
      pointer-events: none;
    }

    .shimmer-block {
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0.04) 25%,
        rgba(255,255,255,0.1) 50%,
        rgba(255,255,255,0.04) 75%
      );
      background-size: 200% 100%;
      animation: shimmer-sweep 1.4s infinite;
    }

    .shimmer-block.badge-icon {
      width: 14px;
      height: 14px;
      border-radius: 50%;
    }

    .shimmer-text {
      width: 90px;
      height: 12px;
    }

    @keyframes shimmer-sweep {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* On mobile viewports under 576px, collapse points and streak to avoid horizontal overflow */
    @media (max-width: 576px) {
      .badge-points,
      .badge-streak,
      .badge-divider {
        display: none !important;
      }
    }
  `]
})
export class ArovaRankBadgeComponent implements OnInit, OnDestroy {
  score: GamificationScore | null = null;
  isLoading = false;
  offlineMessage: string | null = null;

  private sub?: Subscription;

  constructor(private gamification: GamificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadScore();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get hasPoints(): boolean {
    return (this.score?.totalPoints ?? 0) > 0;
  }

  private loadScore(): void {
    // Local Mode is synchronous — no loading state needed
    if (this.gamification.isLocalMode()) {
      this.score = this.gamification.getLocalScore();
      return;
    }

    // API Mode — show shimmer while fetching
    this.isLoading = true;
    this.offlineMessage = null;

    this.sub = this.gamification.getScore().subscribe({
      next: score => {
        this.score = score;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('BADGE SCORE ERROR:', err);
        this.isLoading = false;
        // If offline/unauthorized, show a subtle message instead of crashing
        const msg = err?.message || '';
        if (msg.includes('not reachable') || msg.includes('offline')) {
          this.offlineMessage = 'Score offline';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
