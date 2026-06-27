import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  errorMessage = '';
  isLoading = false;
  isApiMode = false;

  constructor(private checkIns: CheckInService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isApiMode = this.checkIns.isApiMode();
    this.loadTodayDraft();
  }

  loadTodayDraft(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.checkIns.getCurrentUserTodayCheckIn().subscribe({
      next: (existing) => {
        if (existing) {
          this.draft = {
            connectionLevel: existing.connectionLevel,
            energyLevel: existing.energyLevel,
            communicationFeeling: existing.communicationFeeling,
            note: existing.note ?? '',
          };
        }
        this.isLoading = false;
        this.refresh();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load existing check-in.';
        this.isLoading = false;
        this.refresh();
        this.cdr.detectChanges();
      }
    });
  }

  save(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.message = '';

    this.checkIns.saveTodayCheckIn(this.draft).subscribe({
      next: (saved) => {
        if (saved) {
          this.message = this.isApiMode
            ? "Today's check-in was saved and shared in your couple space."
            : "Today's check-in was saved locally.";
        }
        this.isLoading = false;
        this.refresh();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to save check-in.';
        this.isLoading = false;
      }
    });
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
    this.checkIns.getTodayCheckIns().subscribe({
      next: (checkIns) => {
        this.today = checkIns;
      },
      error: (err) => {
        // Handle background errors silently or log
      }
    });

    this.checkIns.getRecentHistory().subscribe({
      next: (historyItems) => {
        this.history = historyItems;
      },
      error: (err) => {
        // Handle background errors silently
      }
    });
  }
}
