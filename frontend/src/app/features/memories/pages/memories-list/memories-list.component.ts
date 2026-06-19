import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MemoryDataService } from '../../../../core/services/memory-data.service';
import { Memory, MemoryCategory } from '../../../../shared/models/memory.model';
import { ArovaPageHeaderComponent } from '../../../../shared/components/arova-page-header/arova-page-header.component';
import { ArovaCardComponent } from '../../../../shared/components/arova-card/arova-card.component';
import { ArovaEmptyStateComponent } from '../../../../shared/components/arova-empty-state/arova-empty-state.component';
import { ArovaStatusPillComponent } from '../../../../shared/components/arova-status-pill/arova-status-pill.component';
import { ArovaLoadingStateComponent } from '../../../../shared/components/arova-loading-state/arova-loading-state.component';

const CATEGORY_LABELS: Record<MemoryCategory | 'all', string> = {
  all: 'All',
  firsts: 'Firsts',
  funny: 'Funny',
  deep: 'Deep',
  romantic: 'Romantic',
  'special-day': 'Special Day',
  random: 'Random',
};

@Component({
  selector: 'app-memories-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    ArovaPageHeaderComponent,
    ArovaCardComponent,
    ArovaEmptyStateComponent,
    ArovaStatusPillComponent,
    ArovaLoadingStateComponent
  ],
  templateUrl: './memories-list.component.html',
  styleUrls: ['./memories-list.component.scss'],
})
export class MemoriesListComponent implements OnInit {

  allMemories: Memory[] = [];
  filtered: Memory[] = [];
  activeCategory: MemoryCategory | 'all' = 'all';
  isAdmin = false;
  isApiMode = false;
  isLoading = false;
  errorMessage = '';
  currentUser: any = null;

  categories: Array<{ key: MemoryCategory | 'all'; label: string }> = Object.entries(
    CATEGORY_LABELS
  ).map(([key, label]) => ({ key: key as MemoryCategory | 'all', label }));

  constructor(private memories: MemoryDataService, private auth: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.isApiMode = this.memories.isApiMode();
    this.currentUser = this.auth.getCurrentUser();
    this.loadMemories();
  }

  setCategory(cat: MemoryCategory | 'all'): void {
    this.activeCategory = cat;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filtered =
      this.activeCategory === 'all'
        ? this.allMemories
        : this.allMemories.filter(memory => memory.category === this.activeCategory);
  }

  loadMemories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.memories.getMemories().subscribe({
      next: memories => {
        this.allMemories = memories;
        this.isLoading = false;
        this.applyFilter();
      },
      error: error => {
        this.allMemories = [];
        this.filtered = [];
        this.isLoading = false;
        this.errorMessage = error instanceof Error ? error.message : 'Memories could not be loaded.';
      },
    });
  }

  getCategoryLabel(cat: MemoryCategory): string {
    return CATEGORY_LABELS[cat] ?? cat;
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
}
