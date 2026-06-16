import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LetterDataService } from '../../../../core/services/letter-data.service';
import { Letter, LetterCategory } from '../../../../shared/models/letter.model';

const CATEGORY_LABELS: Record<LetterCategory, string> = {
  'miss-me': 'Miss Me',
  sad: 'Sad',
  argument: 'After an Argument',
  overthinking: 'Overthinking',
  birthday: 'Birthday',
  reassurance: 'Reassurance',
  future: 'Future',
};

@Component({
  selector: 'app-admin-letters',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-letters.component.html',
  styleUrls: ['./admin-letters.component.scss'],
})
export class AdminLettersComponent implements OnInit {
  letters: Letter[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private letterService: LetterDataService) {}

  ngOnInit(): void {
    this.refresh();
  }

  deleteLetter(letter: Letter): void {
    if (!confirm(`Delete "${letter.title}"? This cannot be undone.`)) return;
    this.errorMessage = '';

    this.letterService.deleteLetter(letter.id).subscribe({
      next: deleted => {
        if (deleted) {
          this.refresh();
          return;
        }

        this.errorMessage = 'This letter could not be deleted.';
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  toggleFavorite(letter: Letter): void {
    this.errorMessage = '';

    this.letterService.toggleFavorite(letter.id).subscribe({
      next: () => {
        this.refresh();
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  getCategoryLabel(category: LetterCategory): string {
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

    this.letterService.getAllLettersForAdmin().subscribe({
      next: letters => {
        this.letters = letters;
        this.isLoading = false;
      },
      error: error => {
        this.letters = [];
        this.errorMessage = this.messageFromError(error);
        this.isLoading = false;
      },
    });
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'The letter request failed. Please try again.';
  }
}
