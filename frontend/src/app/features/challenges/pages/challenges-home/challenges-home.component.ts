import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../../../core/services/challenge.service';
import {
  Challenge,
  ChallengeCategory,
  ChallengeCompletion,
} from '../../../../shared/models/challenge.model';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { AppUser } from '../../../../shared/models/user.model';

const CATEGORY_LABELS: Record<ChallengeCategory | 'all', string> = {
  all: 'All',
  romantic: 'Romantic',
  funny: 'Funny',
  deep: 'Deep',
  reassurance: 'Reassurance',
  memory: 'Memory',
  future: 'Future',
  random: 'Random',
};

@Component({
  selector: 'app-challenges-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenges-home.component.html',
  styleUrls: ['./challenges-home.component.scss'],
})
export class ChallengesHomeComponent implements OnInit {
  currentUser: AppUser | null = null;
  dailyChallenge: Challenge | null = null;
  challenges: Challenge[] = [];
  filteredChallenges: Challenge[] = [];
  completedChallenges: Challenge[] = [];
  activeCategory: ChallengeCategory | 'all' = 'all';
  answerDrafts: Record<string, string> = {};

  categories = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key: key as ChallengeCategory | 'all',
    label,
  }));

  constructor(
    private challengesService: ChallengeService,
    private auth: AuthService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.refresh();
  }

  setCategory(category: ChallengeCategory | 'all'): void {
    this.activeCategory = category;
    this.applyFilter();
  }

  complete(challenge: Challenge): void {
    this.challengesService.completeChallenge(challenge.id, this.answerDrafts[challenge.id]);
    this.answerDrafts[challenge.id] = '';
    this.refresh();
  }

  isCompleted(challenge: Challenge): boolean {
    return !!this.getCompletion(challenge);
  }

  getCompletion(challenge: Challenge): ChallengeCompletion | null {
    if (!this.currentUser) return null;
    return challenge.completedBy.find(item => item.userId === this.currentUser?.id) ?? null;
  }

  getCategoryLabel(category: ChallengeCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  private refresh(): void {
    this.challenges = this.challengesService.getChallenges();
    this.dailyChallenge = this.challengesService.getDailyChallenge();
    this.completedChallenges = this.challengesService.getCompletedChallenges();
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredChallenges =
      this.activeCategory === 'all'
        ? this.challenges
        : this.challenges.filter(challenge => challenge.category === this.activeCategory);
  }
}
