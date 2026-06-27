import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MemoryDataService } from '../../../../core/services/memory-data.service';
import { ImportantDateDataService } from '../../../../core/services/important-date-data.service';
import { Memory, MemoryCategory } from '../../../../shared/models/memory.model';
import { ImportantDate } from '../../../../shared/models/important-date.model';
import { ArovaPageHeaderComponent } from '../../../../shared/components/arova-page-header/arova-page-header.component';
import { ArovaCardComponent } from '../../../../shared/components/arova-card/arova-card.component';
import { ArovaEmptyStateComponent } from '../../../../shared/components/arova-empty-state/arova-empty-state.component';
import { ArovaStatusPillComponent } from '../../../../shared/components/arova-status-pill/arova-status-pill.component';
import { ArovaLoadingStateComponent } from '../../../../shared/components/arova-loading-state/arova-loading-state.component';

export interface TimelineItem {
  type: 'memory' | 'important-date';
  id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  mood?: string;
  imageUrl?: string;
  visibleToPartner?: boolean;
  createdBy?: string;
  dateType?: string; // anniversary, birthday, first-moment, etc.
  originalItem: any;
}

export interface GroupedMonth {
  monthName: string;
  monthIndex: number;
  items: TimelineItem[];
}

export interface GroupedYear {
  year: number;
  months: GroupedMonth[];
}

const CATEGORY_LABELS: Record<MemoryCategory | 'all', string> = {
  all: 'All Moments',
  firsts: 'Firsts',
  funny: 'Funny',
  deep: 'Deep',
  romantic: 'Romantic',
  'special-day': 'Special Day',
  random: 'Random',
};

@Component({
  selector: 'app-memory-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ArovaPageHeaderComponent,
    ArovaCardComponent,
    ArovaEmptyStateComponent,
    ArovaStatusPillComponent,
    ArovaLoadingStateComponent,
  ],
  templateUrl: './memory-timeline.component.html',
  styleUrls: ['./memory-timeline.component.scss'],
})
export class MemoryTimelineComponent implements OnInit {
  allMemories: Memory[] = [];
  allImportantDates: ImportantDate[] = [];
  timelineItems: TimelineItem[] = [];
  groupedYears: GroupedYear[] = [];
  onThisDayItems: TimelineItem[] = [];

  activeCategory: MemoryCategory | 'all' = 'all';
  isAdmin = false;
  isApiMode = false;
  isLoading = false;
  errorMessage = '';
  currentUser: any = null;

  categories: Array<{ key: MemoryCategory | 'all'; label: string }> = Object.entries(
    CATEGORY_LABELS
  ).map(([key, label]) => ({ key: key as MemoryCategory | 'all', label }));

  constructor(
    private memoryService: MemoryDataService,
    private importantDateService: ImportantDateDataService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.isApiMode = this.memoryService.isApiMode();
    this.currentUser = this.auth.getCurrentUser();
    this.loadTimelineData();
  }

  loadTimelineData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Fetch both memories and important dates (if existing)
    this.memoryService.getMemories().subscribe({
      next: memories => {
        console.log('TIMELINE MEMORIES NEXT:', memories);
        this.allMemories = memories;
        
        // Also fetch important dates to build a unified timeline
        this.importantDateService.getVisibleImportantDatesForCurrentUser().subscribe({
          next: dates => {
            this.allImportantDates = dates;
            this.buildTimeline();
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            // Gracefully continue with memories only if dates fail
            this.allImportantDates = [];
            this.buildTimeline();
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: error => {
        console.error('TIMELINE MEMORIES ERROR:', error);
        this.allMemories = [];
        this.allImportantDates = [];
        this.timelineItems = [];
        this.groupedYears = [];
        this.isLoading = false;
        this.errorMessage = error instanceof Error ? error.message : 'Timeline data could not be loaded.';
        this.cdr.detectChanges();
      },
    });
  }

  buildTimeline(): void {
    const items: TimelineItem[] = [];

    // Map memories to timeline items
    this.allMemories.forEach(m => {
      items.push({
        type: 'memory',
        id: m.id,
        title: m.title,
        description: m.description,
        date: m.date || m.createdAt,
        category: m.category,
        mood: m.mood,
        imageUrl: m.imageUrl,
        visibleToPartner: m.visibleToPartner,
        createdBy: m.createdBy,
        originalItem: m,
      });
    });

    // Map important dates to timeline items
    this.allImportantDates.forEach(d => {
      items.push({
        type: 'important-date',
        id: d.id,
        title: d.title,
        description: d.description,
        date: d.date,
        dateType: d.type,
        originalItem: d,
      });
    });

    this.timelineItems = items;
    this.computeOnThisDay();
    this.applyFilterAndGroup();
  }

  computeOnThisDay(): void {
    // Filter only memory timeline items for On This Day
    const memoriesOnly = this.allMemories;
    const matched = this.memoryService.getOnThisDayMemories(memoriesOnly);

    this.onThisDayItems = matched.map(m => ({
      type: 'memory',
      id: m.id,
      title: m.title,
      description: m.description,
      date: m.date || m.createdAt,
      category: m.category,
      mood: m.mood,
      imageUrl: m.imageUrl,
      visibleToPartner: m.visibleToPartner,
      createdBy: m.createdBy,
      originalItem: m,
    }));
  }

  setCategory(cat: MemoryCategory | 'all'): void {
    this.activeCategory = cat;
    this.applyFilterAndGroup();
  }

  private applyFilterAndGroup(): void {
    // Filter by category
    const filteredItems = this.timelineItems.filter(item => {
      if (this.activeCategory === 'all') return true;
      // Important dates are shown on "all", or we can map them optionally to special-day category
      if (item.type === 'important-date') {
        return this.activeCategory === 'special-day';
      }
      return item.category === this.activeCategory;
    });

    // Group by year and month
    const groups: { [year: number]: { [month: number]: TimelineItem[] } } = {};
    for (const item of filteredItems) {
      const dateStr = item.date;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) continue;

      let year: number;
      let month: number;
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const parts = dateStr.slice(0, 10).split('-');
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
      } else {
        year = d.getFullYear();
        month = d.getMonth();
      }

      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][month]) {
        groups[year][month] = [];
      }
      groups[year][month].push(item);
    }

    const grouped: GroupedYear[] = [];
    const years = Object.keys(groups).map(Number).sort((a, b) => b - a);
    for (const year of years) {
      const months: GroupedMonth[] = [];
      const monthKeys = Object.keys(groups[year]).map(Number).sort((a, b) => b - a);
      for (const month of monthKeys) {
        const sortedItems = groups[year][month].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' });
        months.push({
          monthName,
          monthIndex: month,
          items: sortedItems,
        });
      }
      grouped.push({ year, months });
    }

    this.groupedYears = grouped;
  }

  getCategoryLabel(cat?: string): string {
    return CATEGORY_LABELS[(cat as MemoryCategory) || 'random'] ?? cat ?? '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getMoodEmoji(mood?: string): string {
    const map: Record<string, string> = {
      overwhelmed: '*',
      peaceful: 'o',
      raw: '[]',
      tender: '<>',
      warm: 'O',
    };
    return mood ? (map[mood] ?? '.') : '';
  }

  getDateTypeLabel(type?: string): string {
    const map: Record<string, string> = {
      anniversary: 'Anniversary',
      birthday: 'Birthday',
      'first-moment': 'First Moment',
      'future-plan': 'Future Plan',
      'letter-unlock': 'Letter Unlock',
      custom: 'Important Date',
    };
    return type ? (map[type] ?? 'Special Date') : 'Special Date';
  }

  getYearsAgo(dateStr: string): number {
    const dateYear = new Date(dateStr).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - dateYear;
  }
}
