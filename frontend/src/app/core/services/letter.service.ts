import { Injectable } from '@angular/core';
import { Letter } from '../../shared/models/letter.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

import { GamificationService } from './gamification.service';

export type LetterInput = Omit<Letter, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

@Injectable({ providedIn: 'root' })
export class LetterService {
  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private gamification: GamificationService
  ) {}

  getLetters(): Letter[] {
    return this.storage.getLetters();
  }

  getLetterById(id: string): Letter | null {
    return this.getLetters().find(letter => letter.id === id) ?? null;
  }

  getVisibleLettersForCurrentUser(): Letter[] {
    const letters = this.getLetters();
    return this.auth.isAdmin()
      ? letters
      : letters.filter(letter => letter.visibleToPartner || this.isOwner(letter));
  }

  addLetter(input: LetterInput): Letter {
    const letter = this.storage.addLetter({ ...input, createdBy: this.currentUserId() });
    this.gamification.rewardLetterWritten();
    return letter;
  }

  updateLetter(id: string, changes: Partial<Letter>): Letter | null {
    const letter = this.getLetterById(id);
    if (!letter || !this.canEditLetter(letter)) return null;
    return this.storage.updateLetter(id, changes);
  }

  deleteLetter(id: string): boolean {
    const letter = this.getLetterById(id);
    if (!letter || !this.canEditLetter(letter)) return false;
    return this.storage.deleteLetter(id);
  }

  toggleFavorite(id: string): Letter | null {
    const letter = this.getLetterById(id);
    if (!letter || !this.canViewLetter(letter)) return null;
    return this.storage.toggleLetterFavorite(id);
  }

  canViewLetter(letter: Letter): boolean {
    return this.auth.isAdmin() || letter.visibleToPartner || this.isOwner(letter);
  }

  canEditLetter(letter: Letter): boolean {
    return this.auth.isAdmin() || this.isOwner(letter);
  }

  private isOwner(letter: Letter): boolean {
    return letter.createdBy === this.currentUserId();
  }

  private currentUserId(): string {
    return this.auth.getCurrentUser()?.id ?? 'user-owner';
  }
}
