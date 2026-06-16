import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MemoryDataService } from '../../../../core/services/memory-data.service';
import { ReasonDataService } from '../../../../core/services/reason-data.service';
import { LetterDataService } from '../../../../core/services/letter-data.service';
import { FuturePlanDataService } from '../../../../core/services/future-plan-data.service';
import { CoupleProfileService } from '../../../../core/services/couple-profile.service';
import { AppUser } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-universe-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './universe-home.component.html',
  styleUrls: ['./universe-home.component.scss'],
})
export class UniverseHomeComponent implements OnInit {
  currentUser: AppUser | null = null;
  greeting = '';
  coupleSpaceName = 'Arova Space';
  
  memoriesCount = 0;
  reasonsCount = 0;
  lettersCount = 0;
  plansCount = 0;

  quietMoments = [
    { text: 'Write one thing you appreciated today.', link: '/reasons', buttonText: 'Appreciate' },
    { text: 'Save a moment before it becomes ordinary.', link: '/memories', buttonText: 'Preserve' },
    { text: 'Ask one question you usually forget to ask.', link: '/chat', buttonText: 'Connect' }
  ];

  constructor(
    private auth: AuthService,
    private translation: TranslationService,
    private memoryData: MemoryDataService,
    private reasonData: ReasonDataService,
    private letterData: LetterDataService,
    private planData: FuturePlanDataService,
    private coupleProfile: CoupleProfileService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.setGreeting();
    
    // Fetch profile info
    try {
      const profile = this.coupleProfile.getProfile();
      if (profile && profile.coupleSpaceName) {
        this.coupleSpaceName = profile.coupleSpaceName;
      }
    } catch {
      this.coupleSpaceName = 'Arova Space';
    }

    // Fetch counts from services safely
    this.memoryData.getMemories().subscribe({
      next: memories => this.memoriesCount = memories.length,
      error: () => this.memoriesCount = 0
    });

    this.reasonData.getReasons().subscribe({
      next: reasons => this.reasonsCount = reasons.length,
      error: () => this.reasonsCount = 0
    });

    this.letterData.getLetters().subscribe({
      next: letters => this.lettersCount = letters.length,
      error: () => this.lettersCount = 0
    });

    this.planData.getVisibleFuturePlansForCurrentUser().subscribe({
      next: plans => this.plansCount = plans.length,
      error: () => this.plansCount = 0
    });
  }

  private setGreeting(): void {
    if (this.currentUser) {
      this.greeting = `Welcome back, ${this.currentUser.displayName}.`;
    } else {
      this.greeting = 'Welcome back to your shared space.';
    }
  }

  t(key: string): string {
    return this.translation.t(key);
  }
}
