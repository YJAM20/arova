import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoupleGoalDataService } from '../../core/services/couple-goal-data.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { CoupleGoal, CoupleGoalMilestone, GoalCategory, GoalStatus } from '../../shared/models/couple-goal.model';

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  relationship: 'Relationship',
  travel: 'Travel',
  health: 'Health',
  finance: 'Finance',
  creative: 'Creative',
  home: 'Home',
  learning: 'Learning',
  custom: 'Custom'
};

const CATEGORY_ICONS: Record<GoalCategory, string> = {
  relationship: '💖',
  travel: '✈️',
  health: '🥗',
  finance: '💰',
  creative: '🎨',
  home: '🏡',
  learning: '📚',
  custom: '🌟'
};

const STATUS_LABELS: Record<GoalStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'paused': 'Paused',
  completed: 'Completed'
};

@Component({
  selector: 'app-couple-goals-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './couple-goals-page.component.html',
  styleUrls: ['./couple-goals-page.component.scss']
})
export class CoupleGoalsPageComponent implements OnInit {
  goals: CoupleGoal[] = [];
  currentUserId = '';
  isLocalMode = true;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  saveError = '';
  saveSuccess = false;

  // Filters
  categoryFilter: GoalCategory | 'all' = 'all';
  statusFilter: GoalStatus | 'all' = 'all';

  // Toggle/Form States
  showAddForm = false;
  editingGoal: CoupleGoal | null = null;
  expandedGoalId: string | null = null;

  // New Goal Draft
  draft = {
    title: '',
    description: '',
    category: 'relationship' as GoalCategory,
    status: 'not-started' as GoalStatus,
    targetDate: '',
    isPrivate: false,
    progressPercent: 0
  };

  // Milestone input draft (keyed by goalId)
  milestoneDrafts: Record<string, string> = {};

  categories: GoalCategory[] = ['relationship', 'travel', 'health', 'finance', 'creative', 'home', 'learning', 'custom'];
  statuses: GoalStatus[] = ['not-started', 'in-progress', 'paused', 'completed'];

  milestoneIsCompleted = (m: CoupleGoalMilestone) => m.isCompleted;

  constructor(
    private goalsData: CoupleGoalDataService,
    private auth: AuthService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.auth.getCurrentUser()?.id ?? 'user-owner';
    this.isLocalMode = !this.goalsData.isApiMode();
    this.loadGoals();
  }

  loadGoals(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.goalsData.getGoals().subscribe({
      next: goals => {
        this.goals = goals;
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = err instanceof Error ? err.message : 'Could not load couple goals.';
        this.goals = [];
        this.isLoading = false;
      }
    });
  }

  getFilteredGoals(): CoupleGoal[] {
    return this.goals.filter(goal => {
      const matchCat = this.categoryFilter === 'all' || goal.category === this.categoryFilter;
      const matchStatus = this.statusFilter === 'all' || goal.status === this.statusFilter;
      return matchCat && matchStatus;
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.editingGoal = null;
    if (!this.showAddForm) {
      this.resetDraft();
    }
  }

  toggleExpand(goalId: string): void {
    if (this.expandedGoalId === goalId) {
      this.expandedGoalId = null;
    } else {
      this.expandedGoalId = goalId;
    }
  }

  startEdit(goal: CoupleGoal, event: Event): void {
    event.stopPropagation();
    this.editingGoal = goal;
    this.showAddForm = true;
    this.draft = {
      title: goal.title,
      description: goal.description ?? '',
      category: goal.category,
      status: goal.status,
      targetDate: goal.targetDate ?? '',
      isPrivate: goal.isPrivate,
      progressPercent: goal.progressPercent
    };

    // Scroll form into view
    setTimeout(() => {
      const el = document.getElementById('goals-form-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  saveGoal(): void {
    if (!this.draft.title.trim()) return;
    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = false;

    const input = {
      title: this.draft.title.trim(),
      description: this.draft.description.trim() || undefined,
      category: this.draft.category,
      status: this.draft.status,
      targetDate: this.draft.targetDate || undefined,
      isPrivate: this.draft.isPrivate,
      progressPercent: this.draft.progressPercent
    };

    if (this.editingGoal) {
      this.goalsData.updateGoal(this.editingGoal.id, input).subscribe({
        next: () => {
          this.finishSave();
        },
        error: err => {
          this.saveError = err instanceof Error ? err.message : 'Failed to update goal.';
          this.isSaving = false;
        }
      });
    } else {
      this.goalsData.addGoal(input).subscribe({
        next: () => {
          this.finishSave();
        },
        error: err => {
          this.saveError = err instanceof Error ? err.message : 'Failed to create goal.';
          this.isSaving = false;
        }
      });
    }
  }

  private finishSave(): void {
    this.isSaving = false;
    this.saveSuccess = true;
    this.showAddForm = false;
    this.editingGoal = null;
    this.resetDraft();
    this.loadGoals();
    setTimeout(() => (this.saveSuccess = false), 3500);
  }

  deleteGoal(goal: CoupleGoal, event: Event): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this goal?')) return;

    this.goalsData.deleteGoal(goal.id).subscribe({
      next: () => {
        if (this.expandedGoalId === goal.id) {
          this.expandedGoalId = null;
        }
        this.loadGoals();
      },
      error: err => {
        alert(err instanceof Error ? err.message : 'Failed to delete goal.');
      }
    });
  }

  completeGoal(goal: CoupleGoal, event: Event): void {
    event.stopPropagation();
    this.goalsData.completeGoal(goal.id).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: err => {
        alert(err instanceof Error ? err.message : 'Failed to complete goal.');
      }
    });
  }

  // ─── Milestones ─────────────────────────────────────────────────────────

  addMilestone(goalId: string): void {
    const title = this.milestoneDrafts[goalId]?.trim();
    if (!title) return;

    this.goalsData.createMilestone(goalId, title).subscribe({
      next: () => {
        this.milestoneDrafts[goalId] = '';
        this.loadGoals();
      },
      error: err => {
        alert(err instanceof Error ? err.message : 'Failed to add milestone.');
      }
    });
  }

  toggleMilestone(goal: CoupleGoal, milestone: CoupleGoalMilestone): void {
    const updatedStatus = !milestone.isCompleted;
    this.goalsData.updateMilestone(goal.id, milestone.id, {
      title: milestone.title,
      isCompleted: updatedStatus
    }).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: err => {
        alert(err instanceof Error ? err.message : 'Failed to update milestone.');
      }
    });
  }

  deleteMilestone(goalId: string, milestoneId: string): void {
    this.goalsData.deleteMilestone(goalId, milestoneId).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: err => {
        alert(err instanceof Error ? err.message : 'Failed to delete milestone.');
      }
    });
  }

  // ─── Helper accessors ───────────────────────────────────────────────────

  canEdit(goal: CoupleGoal): boolean {
    return this.goalsData.canEditGoal(goal);
  }

  getCategoryLabel(category: GoalCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  getCategoryIcon(category: GoalCategory): string {
    return CATEGORY_ICONS[category] ?? '🌟';
  }

  getStatusLabel(status: GoalStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  formatDate(value?: string): string {
    if (!value) return '';
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  // Summary counts
  getTotalGoals(): number {
    return this.goals.length;
  }

  getActiveGoals(): number {
    return this.goals.filter(g => g.status !== 'completed').length;
  }

  getCompletedGoals(): number {
    return this.goals.filter(g => g.status === 'completed').length;
  }

  private resetDraft(): void {
    this.draft = {
      title: '',
      description: '',
      category: 'relationship',
      status: 'not-started',
      targetDate: '',
      isPrivate: false,
      progressPercent: 0
    };
    this.saveError = '';
  }
}
