import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuturePlanDataService } from '../../../../core/services/future-plan-data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import {
  FuturePlan,
  FuturePlanStatus,
  FuturePlanType,
  Priority,
} from '../../../../shared/models/future-plan.model';

interface StatusColumn {
  status: FuturePlanStatus;
  label: string;
  icon: string;
}

const TYPE_LABELS: Record<FuturePlanType, string> = {
  travel: 'Trip',
  movie: 'Movie',
  food: 'Food',
  date: 'Date',
  dream: 'Dream',
  promise: 'Promise',
  learning: 'Learning',
};

const TYPE_ICONS: Record<FuturePlanType, string> = {
  travel: '✈',
  movie: '🎞',
  food: '🍽',
  date: '✦',
  dream: '◌',
  promise: '♾',
  learning: '◎',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Someday',
  medium: 'When we can',
  high: 'Soon',
};

@Component({
  selector: 'app-future-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './future-board.component.html',
  styleUrls: ['./future-board.component.scss'],
})
export class FutureBoardComponent implements OnInit {
  plans: FuturePlan[] = [];
  isAdmin = false;

  // State flags
  isLoading = false;
  isSaving = false;
  isDeleting: string | null = null;
  isMarkingDone: string | null = null;
  errorMessage = '';
  saveError = '';
  saveSuccess = false;

  // Add form
  showAddForm = false;
  editingPlan: FuturePlan | null = null;

  draft = {
    title: '',
    description: '',
    type: 'dream' as FuturePlanType,
    status: 'one-day' as FuturePlanStatus,
    priority: 'medium' as Priority,
    targetDate: '',
  };

  // Active status filter ('all' or a specific FuturePlanStatus)
  activeFilter: FuturePlanStatus | 'all' = 'all';

  columns: StatusColumn[] = [
    { status: 'one-day', label: 'One day', icon: '◌' },
    { status: 'planned', label: 'Planned', icon: '◉' },
    { status: 'in-progress', label: 'In progress', icon: '◑' },
    { status: 'done', label: 'Completed', icon: '✓' },
  ];

  statusFilters: Array<{ key: FuturePlanStatus | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'one-day', label: 'One day' },
    { key: 'planned', label: 'Planned' },
    { key: 'in-progress', label: 'In progress' },
    { key: 'done', label: 'Completed' },
  ];

  validTypes: FuturePlanType[] = ['travel', 'movie', 'food', 'date', 'dream', 'promise', 'learning'];
  validStatuses: FuturePlanStatus[] = ['one-day', 'planned', 'in-progress', 'done'];
  validPriorities: Priority[] = ['low', 'medium', 'high'];

  constructor(
    private futurePlanData: FuturePlanDataService,
    private auth: AuthService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    if (this.isAdmin) {
      this.validStatuses = ['one-day', 'planned', 'in-progress', 'done', 'secret'];
      this.statusFilters.push({ key: 'secret', label: 'Secret' });
    }
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.futurePlanData.getVisibleFuturePlansForCurrentUser().subscribe({
      next: plans => {
        this.plans = plans;
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage =
          err instanceof Error ? err.message : "We couldn't load your future plans right now.";
        this.plans = [];
        this.isLoading = false;
      },
    });
  }

  getPlans(status: FuturePlanStatus): FuturePlan[] {
    return this.plans.filter(plan => plan.status === status);
  }

  getFilteredPlans(): FuturePlan[] {
    if (this.activeFilter === 'all') return this.plans.filter(p => p.status !== 'secret');
    return this.plans.filter(p => p.status === this.activeFilter);
  }

  getSecretPlans(): FuturePlan[] {
    return this.isAdmin ? this.plans.filter(plan => plan.status === 'secret') : [];
  }

  setFilter(status: FuturePlanStatus | 'all'): void {
    this.activeFilter = status;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.editingPlan = null;
    if (!this.showAddForm) {
      this.resetDraft();
    }
  }

  startEdit(plan: FuturePlan, event: Event): void {
    event.stopPropagation();
    this.editingPlan = plan;
    this.showAddForm = true;
    this.draft = {
      title: plan.title,
      description: plan.description ?? '',
      type: plan.type,
      status: plan.status === 'secret' ? 'one-day' : plan.status,
      priority: plan.priority,
      targetDate: plan.targetDate ?? '',
    };
    if (this.isAdmin && plan.status === 'secret') {
      this.draft.status = 'secret' as FuturePlanStatus;
    }
    // Scroll form into view
    setTimeout(() => {
      const el = document.getElementById('future-plan-form');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  savePlan(): void {
    if (!this.draft.title.trim()) return;
    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = false;

    const input = {
      title: this.draft.title.trim(),
      description: this.draft.description.trim() || undefined,
      type: this.draft.type,
      status: !this.isAdmin && this.draft.status === ('secret' as FuturePlanStatus)
        ? 'one-day' as FuturePlanStatus
        : this.draft.status,
      priority: this.draft.priority,
      targetDate: this.draft.targetDate || undefined,
    };

    if (this.editingPlan) {
      this.futurePlanData.updateFuturePlan(this.editingPlan.id, input).subscribe({
        next: () => {
          this.isSaving = false;
          this.saveSuccess = true;
          this.showAddForm = false;
          this.editingPlan = null;
          this.resetDraft();
          this.loadPlans();
          setTimeout(() => (this.saveSuccess = false), 3500);
        },
        error: err => {
          this.saveError =
            err instanceof Error ? err.message : "We couldn't save this plan right now.";
          this.isSaving = false;
        },
      });
    } else {
      this.futurePlanData.addFuturePlan(input).subscribe({
        next: () => {
          this.isSaving = false;
          this.saveSuccess = true;
          this.showAddForm = false;
          this.resetDraft();
          this.loadPlans();
          setTimeout(() => (this.saveSuccess = false), 3500);
        },
        error: err => {
          this.saveError =
            err instanceof Error ? err.message : "We couldn't save this plan right now.";
          this.isSaving = false;
        },
      });
    }
  }

  markDone(plan: FuturePlan, event: Event): void {
    event.stopPropagation();
    if (!this.futurePlanData.canEditFuturePlan(plan)) return;
    this.isMarkingDone = plan.id;

    this.futurePlanData.markAsDone(plan.id).subscribe({
      next: () => {
        this.isMarkingDone = null;
        this.loadPlans();
      },
      error: () => {
        this.isMarkingDone = null;
      },
    });
  }

  deletePlan(plan: FuturePlan, event: Event): void {
    event.stopPropagation();
    if (!this.futurePlanData.canEditFuturePlan(plan)) return;
    this.isDeleting = plan.id;

    this.futurePlanData.deleteFuturePlan(plan.id).subscribe({
      next: () => {
        this.isDeleting = null;
        this.loadPlans();
      },
      error: () => {
        this.isDeleting = null;
      },
    });
  }

  canEdit(plan: FuturePlan): boolean {
    return this.futurePlanData.canEditFuturePlan(plan);
  }

  isApiMode(): boolean {
    return this.futurePlanData.isApiMode();
  }

  // Summary helpers
  getTotalPlans(): number {
    return this.plans.filter(p => p.status !== 'secret').length;
  }

  getCompletedCount(): number {
    return this.plans.filter(p => p.status === 'done').length;
  }

  getInProgressCount(): number {
    return this.plans.filter(p => p.status === 'in-progress').length;
  }

  getUpcomingCount(): number {
    return this.plans.filter(p => p.status === 'planned').length;
  }

  getTypeLabel(type: FuturePlanType): string {
    return TYPE_LABELS[type] ?? type;
  }

  getTypeIcon(type: FuturePlanType): string {
    return TYPE_ICONS[type] ?? '◌';
  }

  getPriorityLabel(priority: Priority): string {
    return PRIORITY_LABELS[priority] ?? priority;
  }

  getStatusLabel(status: FuturePlanStatus): string {
    return this.columns.find(c => c.status === status)?.label ?? status;
  }

  formatDate(value?: string): string {
    if (!value) return 'No target date yet';
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  private resetDraft(): void {
    this.draft = {
      title: '',
      description: '',
      type: 'dream',
      status: 'one-day',
      priority: 'medium',
      targetDate: '',
    };
    this.saveError = '';
  }
}
