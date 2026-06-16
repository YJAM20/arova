import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MemoryService } from '../../../../core/services/memory.service';
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
  selector: 'app-memory-replay',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './memory-replay.component.html',
  styleUrls: ['./memory-replay.component.scss'],
})
export class MemoryReplayComponent implements OnInit {
  memory: Memory | null = null;
  replaySections: string[] = [];
  isAdmin = false;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private memoryService: MemoryService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      return;
    }

    const memory = this.memoryService.getMemoryById(id);
    if (!memory || !this.memoryService.canViewMemory(memory)) {
      this.notFound = true;
      return;
    }

    this.memory = memory;
    this.replaySections = this.buildReplaySections(memory.description);
  }

  goBack(): void {
    if (this.memory) {
      this.router.navigate(['/memories', this.memory.id]);
      return;
    }

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

  private buildReplaySections(description: string): string[] {
    const clean = description.trim();
    if (!clean) return ['This memory is still waiting for its words.'];

    const sections = clean
      .replace(/([.!?])\s+/g, '$1|')
      .split(/\||\n{2,}/)
      .map(part => part.trim())
      .filter(Boolean);

    return sections.length > 0 ? sections : [clean];
  }
}
