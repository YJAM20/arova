import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MemoryDataService } from '../../../../core/services/memory-data.service';
import { Memory, MemoryCategory } from '../../../../shared/models/memory.model';

const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  firsts: 'Firsts',
  funny: 'Funny',
  deep: 'Deep',
  romantic: 'Romantic',
  'special-day': 'Special Day',
  random: 'Random',
};

@Component({
  selector: 'app-admin-memories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-memories.component.html',
  styleUrls: ['./admin-memories.component.scss'],
})
export class AdminMemoriesComponent implements OnInit {
  memories: Memory[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private memoryService: MemoryDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  deleteMemory(memory: Memory): void {
    if (!confirm(`Delete "${memory.title}"? This cannot be undone.`)) return;
    this.memoryService.deleteMemory(memory.id).subscribe({
      next: () => this.refresh(),
      error: error => {
        this.errorMessage = error instanceof Error ? error.message : 'Memory could not be deleted.';
      },
    });
  }

  toggleFavorite(memory: Memory): void {
    this.memoryService.toggleFavorite(memory.id).subscribe({
      next: () => this.refresh(),
      error: error => {
        this.errorMessage = error instanceof Error ? error.message : 'Favorite could not be updated.';
      },
    });
  }

  getCategoryLabel(category: MemoryCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private refresh(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.memoryService.getAllMemoriesForAdmin().subscribe({
      next: memories => {
        this.memories = memories;
        this.isLoading = false;
      },
      error: error => {
        this.memories = [];
        this.isLoading = false;
        this.errorMessage = error instanceof Error ? error.message : 'Memories could not be loaded.';
      },
    });
  }
}
