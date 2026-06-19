import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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
  selector: 'app-letter-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './letter-details.component.html',
  styleUrls: ['./letter-details.component.scss'],
})
export class LetterDetailsComponent implements OnInit {
  letter: Letter | null = null;
  isAdmin = false;
  canEdit = false;
  notFound = false;
  isLoading = false;
  errorMessage = '';

  enteredPasscode = '';
  passcodeError = '';
  passcodeUnlocked = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private letterService: LetterDataService
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

    this.letterService.getLetterById(id).subscribe({
      next: letter => {
        this.isLoading = false;
        if (!letter) {
          this.notFound = true;
          return;
        }

        this.letter = letter;
        this.canEdit = this.letterService.canEditLetter(letter);
      },
      error: error => {
        this.isLoading = false;
        this.notFound = true;
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  isLockedByDate(): boolean {
    if (!this.letter?.unlockDate) return false;
    const unlock = new Date(this.letter.unlockDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    unlock.setHours(0, 0, 0, 0);
    return today < unlock;
  }

  getFormattedUnlockDate(): string {
    if (!this.letter?.unlockDate) return '';
    return this.formatDate(this.letter.unlockDate);
  }

  canReadBody(): boolean {
    if (!this.letter) return false;
    if (!this.letter.body.trim()) return false;
    if (this.isAdmin) return true;

    if (this.letter.isLocked) {
      if (this.passcodeUnlocked) return true;
      if (this.letter.unlockDate && !this.isLockedByDate()) return true;
      return false;
    }

    return true;
  }

  checkPasscode(): void {
    this.passcodeError = '';
    if (!this.letter) return;
    
    if (this.enteredPasscode.trim() === this.letter.passcode) {
      this.passcodeUnlocked = true;
    } else {
      this.passcodeError = 'The key does not fit. Try again.';
    }
  }

  toggleFavorite(): void {
    if (!this.letter) return;
    this.letterService.toggleFavorite(this.letter.id).subscribe({
      next: updated => {
        if (updated) {
          this.letter = updated;
        }
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/letters']);
  }

  getCategoryLabel(category: LetterCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  deleteLetter(): void {
    if (!this.letter || !this.canEdit) return;
    if (!confirm('Delete this letter?')) return;
    this.letterService.deleteLetter(this.letter.id).subscribe({
      next: deleted => {
        if (deleted) {
          this.router.navigate(['/letters']);
          return;
        }

        this.errorMessage = 'This letter could not be deleted.';
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'The letter request failed. Please try again.';
  }
}
