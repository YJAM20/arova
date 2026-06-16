import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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
  selector: 'app-memory-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './memory-details.component.html',
  styleUrls: ['./memory-details.component.scss'],
})
export class MemoryDetailsComponent implements OnInit {
  memory: Memory | null = null;
  isAdmin = false;
  isApiMode = false;
  canEdit = false;
  notFound = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private memoryService: MemoryDataService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.isApiMode = this.memoryService.isApiMode();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      return;
    }

    this.isLoading = true;
    this.memoryService.getMemoryById(id).subscribe({
      next: memory => {
        this.isLoading = false;
        if (!memory) {
          this.notFound = true;
          return;
        }

        this.memory = memory;
        this.canEdit = this.memoryService.canEditMemory(memory);
      },
      error: error => {
        this.isLoading = false;
        this.notFound = true;
        this.errorMessage = error instanceof Error ? error.message : 'Memory could not be loaded.';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/memories']);
  }

  getCategoryLabel(category: MemoryCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  deleteMemory(): void {
    if (!this.memory || !this.canEdit) return;
    if (!confirm('Delete this memory?')) return;
    this.memoryService.deleteMemory(this.memory.id).subscribe({
      next: () => this.router.navigate(['/memories']),
      error: error => {
        this.errorMessage = error instanceof Error ? error.message : 'Memory could not be deleted.';
      },
    });
  }
}
