import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { FuturePlanService } from '../../../../core/services/future-plan.service';
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
}

const TYPE_LABELS: Record<FuturePlanType, string> = {
  travel: 'Travel',
  movie: 'Movie',
  food: 'Food',
  date: 'Date',
  dream: 'Dream',
  promise: 'Promise',
  learning: 'Learning',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
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
  draft = {
    title: '',
    description: '',
    type: 'dream' as FuturePlanType,
    status: 'one-day' as FuturePlanStatus,
    priority: 'medium' as Priority,
    targetDate: '',
  };

  columns: StatusColumn[] = [
    { status: 'one-day', label: 'One day' },
    { status: 'planned', label: 'Planned' },
    { status: 'in-progress', label: 'In progress' },
    { status: 'done', label: 'Done' },
  ];

  constructor(
    private futurePlans: FuturePlanService,
    private auth: AuthService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.refresh();
  }

  getPlans(status: FuturePlanStatus): FuturePlan[] {
    return this.plans.filter(plan => plan.status === status);
  }

  getSecretPlans(): FuturePlan[] {
    return this.isAdmin ? this.plans.filter(plan => plan.status === 'secret') : [];
  }

  markDone(plan: FuturePlan): void {
    if (!this.futurePlans.canEditFuturePlan(plan)) return;
    this.futurePlans.markAsDone(plan.id);
    this.refresh();
  }

  addPlan(): void {
    if (!this.draft.title.trim()) return;

    this.futurePlans.addFuturePlan({
      title: this.draft.title.trim(),
      description: this.draft.description.trim() || undefined,
      type: this.draft.type,
      status: !this.isAdmin && this.draft.status === 'secret' ? 'one-day' : this.draft.status,
      priority: this.draft.priority,
      targetDate: this.draft.targetDate || undefined,
    });

    this.draft = {
      title: '',
      description: '',
      type: 'dream',
      status: 'one-day',
      priority: 'medium',
      targetDate: '',
    };
    this.refresh();
  }

  canEdit(plan: FuturePlan): boolean {
    return this.futurePlans.canEditFuturePlan(plan);
  }

  getTypeLabel(type: FuturePlanType): string {
    return TYPE_LABELS[type] ?? type;
  }

  getPriorityLabel(priority: Priority): string {
    return PRIORITY_LABELS[priority] ?? priority;
  }

  formatDate(value?: string): string {
    if (!value) return 'No date yet';
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  private refresh(): void {
    this.plans = this.futurePlans.getVisibleFuturePlansForCurrentUser();
  }
}
