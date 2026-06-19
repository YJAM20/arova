import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LetterDataService } from '../../../../core/services/letter-data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Letter, LetterCategory } from '../../../../shared/models/letter.model';
import { ArovaPageHeaderComponent } from '../../../../shared/components/arova-page-header/arova-page-header.component';
import { ArovaCardComponent } from '../../../../shared/components/arova-card/arova-card.component';
import { ArovaEmptyStateComponent } from '../../../../shared/components/arova-empty-state/arova-empty-state.component';
import { ArovaStatusPillComponent } from '../../../../shared/components/arova-status-pill/arova-status-pill.component';
import { ArovaLoadingStateComponent } from '../../../../shared/components/arova-loading-state/arova-loading-state.component';

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
  selector: 'app-letters-vault',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    ArovaPageHeaderComponent,
    ArovaCardComponent,
    ArovaEmptyStateComponent,
    ArovaStatusPillComponent,
    ArovaLoadingStateComponent
  ],
  templateUrl: './letters-vault.component.html',
  styleUrls: ['./letters-vault.component.scss'],
})
export class LettersVaultComponent implements OnInit {
  letters: Letter[] = [];
  filteredLetters: Letter[] = [];
  activeCategory: LetterCategory | 'all' = 'all';
  isAdmin = false;
  isApiMode = false;
  isLoading = false;
  errorMessage = '';

  categories: Array<{ key: LetterCategory | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'miss-me', label: 'Miss Me' },
    { key: 'sad', label: 'Sad' },
    { key: 'argument', label: 'After an Argument' },
    { key: 'overthinking', label: 'Overthinking' },
    { key: 'birthday', label: 'Birthday' },
    { key: 'reassurance', label: 'Reassurance' },
    { key: 'future', label: 'Future' },
  ];

  constructor(
    private letterService: LetterDataService, 
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.isApiMode = this.letterService.isApiMode();
    this.loadLetters();
  }

  private loadLetters(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.letterService.getLetters().subscribe({
      next: letters => {
        this.letters = letters;
        this.applyFilter();
        this.isLoading = false;
      },
      error: error => {
        this.letters = [];
        this.filteredLetters = [];
        this.errorMessage = this.messageFromError(error);
        this.isLoading = false;
      },
    });
  }

  setCategory(cat: LetterCategory | 'all'): void {
    this.activeCategory = cat;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredLetters = 
      this.activeCategory === 'all'
        ? this.letters
        : this.letters.filter(letter => letter.category === this.activeCategory);
  }

  getCategoryLabel(cat: LetterCategory): string {
    return CATEGORY_LABELS[cat] ?? cat;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  openLetterFromKeyboard(event: KeyboardEvent, letterId: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.router.navigate(['/letters', letterId]);
    }
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'The letter request failed. Please try again.';
  }
}
