import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ReasonDataService } from '../../../../core/services/reason-data.service';
import { Reason, ReasonCategory, ReasonReactionType } from '../../../../shared/models/reason.model';

const CATEGORY_LABELS: Record<ReasonCategory, string> = {
  love: 'Love',
  trust: 'Trust',
  'choose-you': 'I Choose You',
  'miss-you': 'I Miss You',
  future: 'Future',
};

@Component({
  selector: 'app-reason-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reason-details.component.html',
  styleUrls: ['./reason-details.component.scss'],
})
export class ReasonDetailsComponent implements OnInit {
  reason: Reason | null = null;
  isAdmin = false;
  canEdit = false;
  notFound = false;
  isLoading = false;
  errorMessage = '';
  reactionButtons: Array<{ type: ReasonReactionType; label: string }> = [
    { type: 'heart', label: 'Heart' },
    { type: 'smile', label: 'Smile' },
    { type: 'cry', label: 'Tear' },
    { type: 'saved', label: 'Saved' },
    { type: 'favorite', label: 'Favorite' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private reasonService: ReasonDataService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.reasonService.getReasonById(id).subscribe({
      next: reason => {
        this.isLoading = false;
        if (!reason) {
          this.notFound = true;
          return;
        }

        this.reason = reason;
        this.canEdit = this.reasonService.canEditReason(reason);
      },
      error: error => {
        this.isLoading = false;
        this.notFound = true;
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/reasons']);
  }

  getCategoryLabel(category: ReasonCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  toggleReaction(type: ReasonReactionType): void {
    if (!this.reason) return;

    this.errorMessage = '';
    this.reasonService.toggleReaction(this.reason.id, type).subscribe({
      next: updated => {
        if (updated) this.reason = updated;
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  hasReaction(type: ReasonReactionType): boolean {
    return !!this.reason && this.reasonService.hasReaction(this.reason, type);
  }

  getReactionCount(type: ReasonReactionType): number {
    return this.reason ? this.reasonService.getReactionCount(this.reason, type) : 0;
  }

  deleteReason(): void {
    if (!this.reason || !this.canEdit) return;
    if (!confirm('Delete this reason?')) return;
    this.reasonService.deleteReason(this.reason.id).subscribe({
      next: deleted => {
        if (deleted) {
          this.router.navigate(['/reasons']);
          return;
        }

        this.errorMessage = 'This reason could not be deleted.';
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'The reason request failed. Please try again.';
  }
}
