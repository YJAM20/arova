import { Injectable } from '@angular/core';
import { RelationshipCheckIn } from '../../shared/models/check-in.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

export interface CheckInInput {
  connectionLevel: number;
  energyLevel: number;
  communicationFeeling: number;
  note?: string;
}

export interface CheckInView extends RelationshipCheckIn {
  userName: string;
}

@Injectable({ providedIn: 'root' })
export class CheckInService {
  constructor(private storage: StorageService, private auth: AuthService) {}

  getTodayDateKey(date = new Date()): string {
    return this.toDateKey(date);
  }

  getTodayCheckIns(): CheckInView[] {
    const dateKey = this.getTodayDateKey();
    return this.toViews(this.storage.getCheckIns().filter(checkIn => checkIn.dateKey === dateKey));
  }

  getCurrentUserTodayCheckIn(): RelationshipCheckIn | null {
    const user = this.auth.getCurrentUser();
    if (!user) return null;
    const dateKey = this.getTodayDateKey();

    return (
      this.storage
        .getCheckIns()
        .find(checkIn => checkIn.userId === user.id && checkIn.dateKey === dateKey) ?? null
    );
  }

  saveTodayCheckIn(input: CheckInInput): RelationshipCheckIn | null {
    const user = this.auth.getCurrentUser();
    if (!user) return null;

    return this.storage.upsertCheckIn({
      userId: user.id,
      dateKey: this.getTodayDateKey(),
      connectionLevel: input.connectionLevel,
      energyLevel: input.energyLevel,
      communicationFeeling: input.communicationFeeling,
      note: input.note,
    });
  }

  getRecentHistory(limit = 12): CheckInView[] {
    return this.toViews(this.storage.getCheckIns())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
  }

  getUserName(userId: string): string {
    return this.storage.getUsers().find(user => user.id === userId)?.displayName ?? 'Partner';
  }

  private toViews(checkIns: RelationshipCheckIn[]): CheckInView[] {
    return checkIns.map(checkIn => ({
      ...checkIn,
      userName: this.getUserName(checkIn.userId),
    }));
  }

  private toDateKey(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
