import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckInService, CheckInView } from '../../../../core/services/check-in.service';

@Component({
  selector: 'app-check-in-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './check-in-page.component.html',
  styleUrls: ['./check-in-page.component.scss'],
})
export class CheckInPageComponent implements OnInit {
  levels = [1, 2, 3, 4, 5];
  draft = {
    connectionLevel: 3,
    energyLevel: 3,
    communicationFeeling: 3,
    note: '',
  };
  today: CheckInView[] = [];
  history: CheckInView[] = [];
  message = '';

  constructor(private checkIns: CheckInService) {}

  ngOnInit(): void {
    const existing = this.checkIns.getCurrentUserTodayCheckIn();
    if (existing) {
      this.draft = {
        connectionLevel: existing.connectionLevel,
        energyLevel: existing.energyLevel,
        communicationFeeling: existing.communicationFeeling,
        note: existing.note ?? '',
      };
    }
    this.refresh();
  }

  save(): void {
    const saved = this.checkIns.saveTodayCheckIn(this.draft);
    if (!saved) return;

    this.message = 'Today\'s check-in was saved locally.';
    this.refresh();
  }

  levelLabel(level: number): string {
    return ['Very low', 'Low', 'Steady', 'Good', 'Strong'][level - 1] ?? 'Steady';
  }

  formatDate(dateKey: string): string {
    return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private refresh(): void {
    this.today = this.checkIns.getTodayCheckIns();
    this.history = this.checkIns.getRecentHistory();
  }
}
