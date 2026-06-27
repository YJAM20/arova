import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RelationshipActivityService, calculateStreak } from '../../../core/services/relationship-activity.service';
import { ActivityDay } from '../../models/activity-day.model';
import { AppModeService } from '../../../core/services/app-mode.service';

@Component({
  selector: 'arova-streak-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arova-streak-heatmap.component.html',
  styleUrls: ['./arova-streak-heatmap.component.scss']
})
export class ArovaStreakHeatmapComponent implements OnInit, OnDestroy {
  @Input() activityDays: ActivityDay[] | null = null;
  @Input() compact = false;
  @Input() title = 'Relationship Activity';
  @Input() subtitle = 'Every small ritual leaves a light behind.';

  streak = 0;
  totalActiveDays = 0;
  totalPoints = 0;
  
  heatmapDays: any[] = [];
  isLoading = false;
  isOffline = false;
  errorMessage = '';

  private sub?: Subscription;

  constructor(
    private activityService: RelationshipActivityService,
    private appMode: AppModeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.activityDays) {
      this.processActivities(this.activityDays);
    } else {
      this.loadActivities();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadActivities(): void {
    this.isLoading = true;
    this.isOffline = false;
    this.errorMessage = '';

    this.sub = this.activityService.getActivityDays().subscribe({
      next: (days) => {
        this.processActivities(days);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.message || '';
        if (msg.includes('not reachable') || msg.includes('offline') || msg.includes('status 0') || msg.includes('0')) {
          this.isOffline = true;
        } else {
          this.errorMessage = msg || 'Failed to load activity.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  processActivities(days: ActivityDay[]): void {
    this.totalActiveDays = days.filter(d => d.count > 0).length;
    this.totalPoints = days.reduce((sum, d) => sum + (d.points || 0), 0);
    
    const activeDates = days.filter(d => d.count > 0).map(d => d.date);
    this.streak = calculateStreak(activeDates);

    this.heatmapDays = this.generateHeatmapDays(days);
  }

  generateHeatmapDays(days: ActivityDay[]): any[] {
    const cells: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeksCount = this.compact ? 4 : 20; 
    const totalDays = (weeksCount + 1) * 7;

    const startDate = new Date(today);
    const currentDayOfWeek = today.getDay(); 
    startDate.setDate(today.getDate() - currentDayOfWeek - (weeksCount * 7));

    const activityMap = new Map<string, ActivityDay>();
    for (const d of days) {
      activityMap.set(d.date, d);
    }

    const iterDate = new Date(startDate);
    for (let i = 0; i < totalDays; i++) {
      const dateStr = this.formatDateStr(iterDate);
      const isFuture = iterDate > today;
      const activity = activityMap.get(dateStr);
      const count = activity ? activity.count : 0;
      const points = activity ? (activity.points || 0) : 0;

      let level = 0;
      if (count > 0) {
        if (count === 1) level = 1;
        else if (count <= 3) level = 2;
        else if (count <= 5) level = 3;
        else level = 4;
      }

      const formattedDateVisual = iterDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const label = count > 0
        ? `${formattedDateVisual}: ${count} ${count === 1 ? 'activity' : 'activities'}${points > 0 ? `, ${points} points` : ''}.`
        : `${formattedDateVisual}: no activity.`;

      cells.push({
        dateStr,
        count,
        points,
        level,
        label,
        isFuture,
        dayOfWeek: iterDate.getDay()
      });

      iterDate.setDate(iterDate.getDate() + 1);
    }

    return cells;
  }

  isLocalMode(): boolean {
    return this.appMode.isLocalMode();
  }

  private formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
