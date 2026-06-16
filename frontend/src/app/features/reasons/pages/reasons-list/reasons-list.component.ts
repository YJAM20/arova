import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReasonDataService } from '../../../../core/services/reason-data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Reason, ReasonCategory, ReasonReactionType } from '../../../../shared/models/reason.model';
import { ArovaPageHeaderComponent } from '../../../../shared/components/arova-page-header/arova-page-header.component';
import { ArovaCardComponent } from '../../../../shared/components/arova-card/arova-card.component';
import { ArovaEmptyStateComponent } from '../../../../shared/components/arova-empty-state/arova-empty-state.component';
import { ArovaStatusPillComponent } from '../../../../shared/components/arova-status-pill/arova-status-pill.component';
import { ArovaLoadingStateComponent } from '../../../../shared/components/arova-loading-state/arova-loading-state.component';

const CATEGORY_LABELS: Record<ReasonCategory | 'all', string> = {
  all: 'All',
  love: 'Love',
  trust: 'Trust',
  'choose-you': 'I Choose You',
  'miss-you': 'I Miss You',
  future: 'Future',
};

@Component({
  selector: 'app-reasons-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    ArovaPageHeaderComponent,
    ArovaCardComponent,
    ArovaEmptyStateComponent,
    ArovaStatusPillComponent,
    ArovaLoadingStateComponent
  ],
  templateUrl: './reasons-list.component.html',
  styleUrls: ['./reasons-list.component.scss'],
})
export class ReasonsListComponent implements OnInit {
  allReasons: Reason[] = [];
  filtered: Reason[] = [];
  activeCategory: ReasonCategory | 'all' = 'all';
  isAdmin = false;
  isApiMode = false;
  isLoading = false;
  isRandomLoading = false;
  errorMessage = '';
  dailyErrorMessage = '';
  randomErrorMessage = '';
  randomReason: Reason | null = null;
  dailyReason: Reason | null = null;
  showRandom = false;
  reactionButtons: Array<{ type: ReasonReactionType; label: string }> = [
    { type: 'heart', label: 'Heart' },
    { type: 'smile', label: 'Smile' },
    { type: 'cry', label: 'Tear' },
    { type: 'saved', label: 'Saved' },
    { type: 'favorite', label: 'Favorite' },
  ];

  categories: Array<{ key: ReasonCategory | 'all'; label: string }> = Object.entries(
    CATEGORY_LABELS
  ).map(([key, label]) => ({ key: key as ReasonCategory | 'all', label }));

  constructor(private reasons: ReasonDataService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.isApiMode = this.reasons.isApiMode();
    this.loadReasons();
  }

  private loadReasons(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.dailyErrorMessage = '';

    this.reasons.getReasons().subscribe({
      next: reasons => {
        this.allReasons = [...reasons].sort((a, b) => a.order - b.order);
        this.applyFilter();
        this.isLoading = false;
        this.loadDailyReason();
      },
      error: error => {
        this.allReasons = [];
        this.filtered = [];
        this.dailyReason = null;
        this.errorMessage = this.messageFromError(error);
        this.isLoading = false;
      },
    });
  }

  private loadDailyReason(): void {
    this.dailyReason = null;
    this.dailyErrorMessage = '';

    this.reasons.getDailyReason().subscribe({
      next: reason => {
        this.dailyReason = reason;
      },
      error: error => {
        this.dailyErrorMessage = this.messageFromError(error);
      },
    });
  }

  setCategory(cat: ReasonCategory | 'all'): void {
    this.activeCategory = cat;
    this.showRandom = false;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filtered =
      this.activeCategory === 'all'
        ? this.allReasons
        : this.allReasons.filter(reason => reason.category === this.activeCategory);
  }

  getCategoryLabel(cat: ReasonCategory): string {
    return CATEGORY_LABELS[cat] ?? cat;
  }

  pickRandom(): void {
    this.isRandomLoading = true;
    this.randomErrorMessage = '';
    this.showRandom = false;

    this.reasons.getRandomReason().subscribe({
      next: reason => {
        this.randomReason = reason;
        this.showRandom = !!reason;
        this.randomErrorMessage = reason ? '' : 'No reasons are available yet.';
        this.isRandomLoading = false;
      },
      error: error => {
        this.randomReason = null;
        this.randomErrorMessage = this.messageFromError(error);
        this.isRandomLoading = false;
      },
    });
  }

  closeRandom(): void {
    this.showRandom = false;
    this.randomReason = null;
  }

  openReason(reason: Reason): void {
    this.router.navigate(['/reasons', reason.id]);
  }

  openReasonFromKeyboard(event: KeyboardEvent, reason: Reason): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openReason(reason);
    }
  }

  toggleReaction(reason: Reason, type: ReasonReactionType, event?: MouseEvent): void {
    event?.stopPropagation();
    this.errorMessage = '';

    this.reasons.toggleReaction(reason.id, type).subscribe({
      next: updated => {
        if (updated) this.replaceReason(updated);
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  hasReaction(reason: Reason, type: ReasonReactionType): boolean {
    return this.reasons.hasReaction(reason, type);
  }

  getReactionCount(reason: Reason, type: ReasonReactionType): number {
    return this.reasons.getReactionCount(reason, type);
  }

  private replaceReason(updated: Reason): void {
    this.allReasons = this.allReasons.map(reason =>
      reason.id === updated.id ? updated : reason
    );
    if (this.dailyReason?.id === updated.id) {
      this.dailyReason = updated;
    }
    if (this.randomReason?.id === updated.id) {
      this.randomReason = updated;
    }
    this.applyFilter();
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'The reason request failed. Please try again.';
  }
}
