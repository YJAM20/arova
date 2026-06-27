import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RelationshipCheckIn } from '../../shared/models/check-in.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { CheckInInput, CheckInView } from './check-in.service';

@Injectable({ providedIn: 'root' })
export class CheckInDataService {
  constructor(private storage: StorageService, private auth: AuthService) {}

  getTodayDateKey(date = new Date()): string {
    return this.toDateKey(date);
  }

  getTodayCheckIns(): Observable<CheckInView[]> {
    const dateKey = this.getTodayDateKey();
    const list = this.storage.getCheckIns().filter(checkIn => checkIn.dateKey === dateKey);
    return of(this.toViews(list));
  }

  getCurrentUserTodayCheckIn(): Observable<RelationshipCheckIn | null> {
    const user = this.auth.getCurrentUser();
    if (!user) return of(null);
    const dateKey = this.getTodayDateKey();

    const checkIn = this.storage
      .getCheckIns()
      .find(c => c.userId === user.id && c.dateKey === dateKey) ?? null;

    return of(checkIn);
  }

  saveTodayCheckIn(input: CheckInInput): Observable<RelationshipCheckIn | null> {
    const user = this.auth.getCurrentUser();
    if (!user) return of(null);

    const saved = this.storage.upsertCheckIn({
      userId: user.id,
      dateKey: this.getTodayDateKey(),
      connectionLevel: input.connectionLevel,
      energyLevel: input.energyLevel,
      communicationFeeling: input.communicationFeeling,
      note: input.note,
    });
    return of(saved);
  }

  getRecentHistory(limit = 12): Observable<CheckInView[]> {
    const list = this.toViews(this.storage.getCheckIns())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
    return of(list);
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
