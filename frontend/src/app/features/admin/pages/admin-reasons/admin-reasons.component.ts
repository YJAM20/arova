import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReasonDataService } from '../../../../core/services/reason-data.service';
import { Reason, ReasonCategory } from '../../../../shared/models/reason.model';

const CATEGORY_LABELS: Record<ReasonCategory, string> = {
  love: 'Love',
  trust: 'Trust',
  'choose-you': 'I Choose You',
  'miss-you': 'I Miss You',
  future: 'Future',
};

@Component({
  selector: 'app-admin-reasons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-reasons.component.html',
  styleUrls: ['./admin-reasons.component.scss'],
})
export class AdminReasonsComponent implements OnInit {
  reasons: Reason[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private reasonService: ReasonDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  deleteReason(reason: Reason): void {
    if (!confirm(`Delete "${reason.title}"? This cannot be undone.`)) return;
    this.errorMessage = '';

    this.reasonService.deleteReason(reason.id).subscribe({
      next: deleted => {
        if (deleted) {
          this.refresh();
          return;
        }

        this.errorMessage = 'This reason could not be deleted.';
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  toggleFavorite(reason: Reason): void {
    this.errorMessage = '';

    this.reasonService.toggleFavorite(reason.id).subscribe({
      next: () => {
        this.refresh();
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  getCategoryLabel(category: ReasonCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  private refresh(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reasonService.getAllReasonsForAdmin().subscribe({
      next: reasons => {
        this.reasons = [...reasons].sort((a, b) => a.order - b.order);
        this.isLoading = false;
      },
      error: error => {
        this.reasons = [];
        this.errorMessage = this.messageFromError(error);
        this.isLoading = false;
      },
    });
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'The reason request failed. Please try again.';
  }
}
