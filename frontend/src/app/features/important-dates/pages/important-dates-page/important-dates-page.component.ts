import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportantDateDataService } from '../../../../core/services/important-date-data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { ImportantDate, ImportantDateType, RecurrenceType } from '../../../../shared/models/important-date.model';
import { ArovaCardComponent } from '../../../../shared/components/arova-card/arova-card.component';
import { ArovaEmptyStateComponent } from '../../../../shared/components/arova-empty-state/arova-empty-state.component';
import { ArovaLoadingStateComponent } from '../../../../shared/components/arova-loading-state/arova-loading-state.component';

const TYPE_LABELS: Record<ImportantDateType, string> = {
  anniversary: 'Anniversary',
  birthday: 'Birthday',
  'first-moment': 'First Moment',
  'future-plan': 'Future Plan',
  'letter-unlock': 'Letter Unlock',
  custom: 'Custom Event',
};

const TYPE_ICONS: Record<ImportantDateType, string> = {
  anniversary: '⚭',
  birthday: '🎈',
  'first-moment': '✨',
  'future-plan': '📅',
  'letter-unlock': '🔒',
  custom: '✦',
};

const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'One-time',
  yearly: 'Yearly',
  monthly: 'Monthly',
};

@Component({
  selector: 'app-important-dates-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ArovaCardComponent,
    ArovaEmptyStateComponent,
    ArovaLoadingStateComponent,
  ],
  templateUrl: './important-dates-page.component.html',
  styleUrls: ['./important-dates-page.component.scss'],
})
export class ImportantDatesPageComponent implements OnInit {
  dates: ImportantDate[] = [];
  isAdmin = false;
  currentUserId = '';

  // State flags
  isLoading = false;
  isSaving = false;
  isDeleting: string | null = null;
  isSendingTest = false;
  errorMessage = '';
  saveError = '';
  saveSuccess = false;
  adminSuccessMessage = '';

  // Form Drawer
  showAddForm = false;
  editingDate: ImportantDate | null = null;

  draft = {
    title: '',
    description: '',
    date: '',
    type: 'custom' as ImportantDateType,
    recurrence: 'none' as RecurrenceType,
    reminderEnabled: true,
    reminderDaysBefore: 3,
    isPrivate: false,
  };

  // Filters
  activeFilter: ImportantDateType | 'all' = 'all';

  validTypes: ImportantDateType[] = ['anniversary', 'birthday', 'first-moment', 'future-plan', 'letter-unlock', 'custom'];
  validRecurrences: RecurrenceType[] = ['none', 'yearly', 'monthly'];

  constructor(
    private dateData: ImportantDateDataService,
    private auth: AuthService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.currentUserId = this.auth.getCurrentUser()?.id ?? '';
    this.loadDates();
  }

  loadDates(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dateData.getVisibleImportantDatesForCurrentUser().subscribe({
      next: dates => {
        this.dates = dates;
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = err instanceof Error ? err.message : "Couldn't load important dates.";
        this.dates = [];
        this.isLoading = false;
      },
    });
  }

  getHeroDate(): ImportantDate | null {
    const upcoming = this.getUpcomingDates();
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  getUpcomingDates(): ImportantDate[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    return this.dates
      .filter(d => d.daysRemaining !== undefined && d.daysRemaining >= 0 && (d.recurrence !== 'none' || d.date >= todayStr))
      .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));
  }

  getFilteredDates(): ImportantDate[] {
    const upcoming = this.getUpcomingDates();
    if (this.activeFilter === 'all') return upcoming;
    return upcoming.filter(d => d.type === this.activeFilter);
  }

  setFilter(type: ImportantDateType | 'all'): void {
    this.activeFilter = type;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.editingDate = null;
    if (!this.showAddForm) {
      this.resetDraft();
    }
  }

  startEdit(date: ImportantDate, event: Event): void {
    event.stopPropagation();
    this.editingDate = date;
    this.showAddForm = true;
    this.draft = {
      title: date.title,
      description: date.description ?? '',
      date: date.date,
      type: date.type,
      recurrence: date.recurrence,
      reminderEnabled: date.reminderEnabled,
      reminderDaysBefore: date.reminderDaysBefore,
      isPrivate: date.isPrivate,
    };
    
    // Smooth scroll to the form
    setTimeout(() => {
      const el = document.getElementById('important-date-form');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  saveDate(): void {
    if (!this.draft.title.trim() || !this.draft.date) return;
    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = false;

    const input = {
      title: this.draft.title.trim(),
      description: this.draft.description.trim() || undefined,
      date: this.draft.date,
      type: this.draft.type,
      recurrence: this.draft.recurrence,
      reminderEnabled: this.draft.reminderEnabled,
      reminderDaysBefore: this.draft.reminderDaysBefore,
      isPrivate: this.draft.isPrivate,
    };

    if (this.editingDate) {
      this.dateData.updateImportantDate(this.editingDate.id, input).subscribe({
        next: () => {
          this.isSaving = false;
          this.saveSuccess = true;
          this.showAddForm = false;
          this.editingDate = null;
          this.resetDraft();
          this.loadDates();
          setTimeout(() => (this.saveSuccess = false), 3500);
        },
        error: err => {
          this.saveError = err instanceof Error ? err.message : "Couldn't save important date.";
          this.isSaving = false;
        },
      });
    } else {
      this.dateData.addImportantDate(input).subscribe({
        next: () => {
          this.isSaving = false;
          this.saveSuccess = true;
          this.showAddForm = false;
          this.resetDraft();
          this.loadDates();
          setTimeout(() => (this.saveSuccess = false), 3500);
        },
        error: err => {
          this.saveError = err instanceof Error ? err.message : "Couldn't save important date.";
          this.isSaving = false;
        },
      });
    }
  }

  deleteDate(date: ImportantDate, event: Event): void {
    event.stopPropagation();
    if (!this.canEdit(date)) return;
    if (!confirm(`Are you sure you want to delete "${date.title}"?`)) return;

    this.isDeleting = date.id;
    this.dateData.deleteImportantDate(date.id).subscribe({
      next: () => {
        this.isDeleting = null;
        this.loadDates();
      },
      error: () => {
        this.isDeleting = null;
      },
    });
  }

  sendTestReminders(): void {
    this.isSendingTest = true;
    this.adminSuccessMessage = '';
    this.errorMessage = '';

    this.dateData.sendTestReminders().subscribe({
      next: res => {
        this.adminSuccessMessage = res.message || 'Triggered email reminders check successfully.';
        this.isSendingTest = false;
        setTimeout(() => (this.adminSuccessMessage = ''), 5000);
      },
      error: err => {
        this.errorMessage = err instanceof Error ? err.message : 'Failed to trigger email reminders check.';
        this.isSendingTest = false;
      },
    });
  }

  canEdit(date: ImportantDate): boolean {
    return this.dateData.canEditImportantDate(date);
  }

  isApiMode(): boolean {
    return this.dateData.isApiMode();
  }

  getTypeLabel(type: ImportantDateType): string {
    return TYPE_LABELS[type] ?? type;
  }

  getTypeIcon(type: ImportantDateType): string {
    return TYPE_ICONS[type] ?? '✦';
  }

  getRecurrenceLabel(recurrence: RecurrenceType): string {
    return RECURRENCE_LABELS[recurrence] ?? recurrence;
  }

  formatDate(value?: string): string {
    if (!value) return '';
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
      date: '',
      type: 'custom',
      recurrence: 'none',
      reminderEnabled: true,
      reminderDaysBefore: 3,
      isPrivate: false,
    };
    this.saveError = '';
  }
}
