import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { ImportantDate, ImportantDateType, RecurrenceType } from '../../shared/models/important-date.model';
import { GamificationService } from './gamification.service';

export type ImportantDateInput = Omit<ImportantDate, 'id' | 'coupleId' | 'createdByUserId' | 'createdAt' | 'updatedAt' | 'daysRemaining' | 'nextOccurrenceDate'>;

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowIso(): string {
  return new Date().toISOString();
}

export function calculateNextOccurrence(originalDateStr: string, recurrence: 'none' | 'yearly' | 'monthly'): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [yr, mo, dy] = originalDateStr.split('-').map(Number);
  const date = new Date(yr, mo - 1, dy);
  date.setHours(0, 0, 0, 0);

  if (recurrence === 'yearly') {
    let year = today.getFullYear();
    const getYearlyDate = (y: number) => {
      const maxDays = new Date(y, mo, 0).getDate();
      const targetDay = Math.min(dy, maxDays);
      return new Date(y, mo - 1, targetDay);
    };

    let next = getYearlyDate(year);
    if (next.getTime() < today.getTime()) {
      year++;
      next = getYearlyDate(year);
    }
    return next;
  }

  if (recurrence === 'monthly') {
    let year = today.getFullYear();
    let month = today.getMonth();

    const getMonthlyDate = (y: number, m: number) => {
      const maxDays = new Date(y, m + 1, 0).getDate();
      const targetDay = Math.min(dy, maxDays);
      return new Date(y, m, targetDay);
    };

    let next = getMonthlyDate(year, month);
    if (next.getTime() < today.getTime()) {
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
      next = getMonthlyDate(year, month);
    }
    return next;
  }

  return date;
}

export function calculateDaysRemaining(nextOccurrence: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = nextOccurrence.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? 0 : diffDays;
}

@Injectable({ providedIn: 'root' })
export class ImportantDateService {
  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private gamification: GamificationService
  ) {}

  getImportantDates(): ImportantDate[] {
    return this.storage.getImportantDates().map(d => this.populateCalculatedFields(d));
  }

  getImportantDateById(id: string): ImportantDate | null {
    const date = this.storage.getImportantDates().find(d => d.id === id);
    return date ? this.populateCalculatedFields(date) : null;
  }

  getVisibleImportantDatesForCurrentUser(): ImportantDate[] {
    const dates = this.getImportantDates();
    return this.auth.isAdmin()
      ? dates
      : dates.filter(d => !d.isPrivate || this.isOwner(d));
  }

  getUpcomingImportantDatesForCurrentUser(): ImportantDate[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    return this.getVisibleImportantDatesForCurrentUser()
      .filter(d => d.daysRemaining !== undefined && d.daysRemaining >= 0 && (d.recurrence !== 'none' || d.date >= todayStr))
      .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));
  }

  addImportantDate(input: ImportantDateInput): ImportantDate {
    const data = this.storage.loadFullAppData();
    const timestamp = nowIso();
    const date: ImportantDate = {
      ...input,
      id: `imp-${uid()}`,
      coupleId: 'couple-default',
      createdByUserId: this.currentUserId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    data.importantDates.unshift(date);
    this.storage.saveFullAppData(data);
    this.gamification.rewardImportantDateCreated();
    return this.populateCalculatedFields(date);
  }

  updateImportantDate(id: string, changes: Partial<ImportantDate>): ImportantDate | null {
    const data = this.storage.loadFullAppData();
    let updated: ImportantDate | null = null;
    const existing = data.importantDates.find(d => d.id === id);
    if (!existing || !this.canEditImportantDate(existing)) return null;

    data.importantDates = data.importantDates.map(d => {
      if (d.id !== id) return d;
      updated = {
        ...d,
        ...changes,
        id: d.id,
        coupleId: d.coupleId,
        createdByUserId: d.createdByUserId,
        createdAt: d.createdAt,
        updatedAt: nowIso(),
      };
      return updated;
    });

    if (!updated) return null;
    this.storage.saveFullAppData(data);
    return this.populateCalculatedFields(updated);
  }

  deleteImportantDate(id: string): boolean {
    const data = this.storage.loadFullAppData();
    const existing = data.importantDates.find(d => d.id === id);
    if (!existing || !this.canEditImportantDate(existing)) return false;
    const before = data.importantDates.length;
    data.importantDates = data.importantDates.filter(d => d.id !== id);
    if (data.importantDates.length === before) return false;

    this.storage.saveFullAppData(data);
    return true;
  }

  canEditImportantDate(date: ImportantDate): boolean {
    return this.auth.isAdmin() || this.isOwner(date);
  }

  private isOwner(date: ImportantDate): boolean {
    return date.createdByUserId === this.currentUserId();
  }

  private currentUserId(): string {
    return this.auth.getCurrentUser()?.id ?? 'user-owner';
  }

  private populateCalculatedFields(date: ImportantDate): ImportantDate {
    const nextOccur = calculateNextOccurrence(date.date, date.recurrence);
    const nextOccurStr = nextOccur.getFullYear() + '-' + String(nextOccur.getMonth() + 1).padStart(2, '0') + '-' + String(nextOccur.getDate()).padStart(2, '0');
    const daysRemaining = calculateDaysRemaining(nextOccur);
    return {
      ...date,
      nextOccurrenceDate: nextOccurStr,
      daysRemaining
    };
  }
}
