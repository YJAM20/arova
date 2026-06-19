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
import { AppModeService } from '../../../../core/services/app-mode.service';
import { CoupleApiService } from '../../../../core/services/couple-api.service';
import { MoodDataService } from '../../../../core/services/mood-data.service';

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
  coupleSpaceGreeting = 'Your private universe for two';
  isLocalMode = true;

  memoriesCount = 0;
  reasonsCount = 0;
  lettersCount = 0;
  plansCount = 0;

  latestMood: any = null;
  latestFuturePlan: any = null;
  recentActivities: any[] = [];
  isLoading = true;
  isBackendOffline = false;
  backendError = '';

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
    private coupleProfile: CoupleProfileService,
    private appMode: AppModeService,
    private couples: CoupleApiService,
    private moodData: MoodDataService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.setGreeting();
    this.isLocalMode = this.appMode.isLocalMode();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.isBackendOffline = false;
    this.backendError = '';
    this.recentActivities = [];

    // 1. Fetch space name and greeting names
    if (this.isLocalMode) {
      try {
        const profile = this.coupleProfile.getProfile();
        if (profile) {
          if (profile.coupleSpaceName) {
            this.coupleSpaceName = profile.coupleSpaceName;
          }
          if (profile.partnerADisplayName && profile.partnerBDisplayName) {
            this.coupleSpaceGreeting = `${profile.partnerADisplayName} & ${profile.partnerBDisplayName}’s private universe`;
          } else {
            this.coupleSpaceGreeting = 'Your private universe for two';
          }
        }
      } catch {
        this.coupleSpaceName = 'Arova Space';
        this.coupleSpaceGreeting = 'Your private universe for two';
      }
      this.loadCountsAndFeeds();
    } else {
      // API Mode
      this.couples.getMyCouple().subscribe({
        next: couple => {
          if (couple && couple.name) {
            this.coupleSpaceName = couple.name;
          }
          // Fetch members to build greeting
          this.couples.getMembers().subscribe({
            next: members => {
              if (members && members.length >= 2) {
                const names = members.map(m => m.displayName || m.username || 'Partner');
                this.coupleSpaceGreeting = `${names[0]} & ${names[1]}’s private universe`;
              } else if (members && members.length === 1) {
                this.coupleSpaceGreeting = `${members[0].displayName || members[0].username || 'Partner'}’s private universe`;
              } else {
                this.coupleSpaceGreeting = 'Your private universe for two';
              }
            },
            error: () => {
              this.coupleSpaceGreeting = 'Your private universe for two';
            }
          });
          this.loadCountsAndFeeds();
        },
        error: error => {
          this.isBackendOffline = true;
          this.backendError = 'API Mode could not reach the local backend. You can switch to Local Mode for the browser demo.';
          this.isLoading = false;
        }
      });
    }
  }

  loadCountsAndFeeds(): void {
    let loadedCalls = 0;
    const totalCalls = 5;
    const checkFinish = () => {
      loadedCalls++;
      if (loadedCalls === totalCalls) {
        this.isLoading = false;
      }
    };

    // Fetch Memories
    this.memoryData.getMemories().subscribe({
      next: memories => {
        this.memoriesCount = memories.length;
        memories.forEach(m => {
          this.recentActivities.push({
            type: 'memory',
            title: m.title || 'Saved a Memory',
            description: m.description || '',
            date: m.createdAt,
            icon: '📸',
            link: `/memories/${m.id}`
          });
        });
        this.sortActivities();
        checkFinish();
      },
      error: error => {
        this.handleApiError(error);
        checkFinish();
      }
    });

    // Fetch Reasons
    this.reasonData.getReasons().subscribe({
      next: reasons => {
        this.reasonsCount = reasons.length;
        reasons.forEach(r => {
          this.recentActivities.push({
            type: 'reason',
            title: 'Wrote a Reason',
            description: r.body || '',
            date: r.createdAt,
            icon: '⭐',
            link: '/reasons'
          });
        });
        this.sortActivities();
        checkFinish();
      },
      error: error => {
        this.handleApiError(error);
        checkFinish();
      }
    });

    // Fetch Letters
    this.letterData.getLetters().subscribe({
      next: letters => {
        this.lettersCount = letters.length;
        letters.forEach(l => {
          this.recentActivities.push({
            type: 'letter',
            title: l.title || 'Sealed a Letter',
            description: l.body ? (l.body.length > 60 ? l.body.substring(0, 60) + '...' : l.body) : '',
            date: l.createdAt,
            icon: '✉️',
            link: `/letters/${l.id}`
          });
        });
        this.sortActivities();
        checkFinish();
      },
      error: error => {
        this.handleApiError(error);
        checkFinish();
      }
    });

    // Fetch Future Plans
    this.planData.getVisibleFuturePlansForCurrentUser().subscribe({
      next: plans => {
        this.plansCount = plans.length;
        if (plans && plans.length > 0) {
          const sortedPlans = [...plans].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          this.latestFuturePlan = sortedPlans[0];
        }
        checkFinish();
      },
      error: error => {
        this.handleApiError(error);
        checkFinish();
      }
    });

    // Fetch Moods
    this.moodData.getMoodHistory().subscribe({
      next: moods => {
        if (moods && moods.length > 0) {
          this.latestMood = moods[0];
        }
        checkFinish();
      },
      error: error => {
        this.handleApiError(error);
        checkFinish();
      }
    });
  }

  getMoodIcon(mood: string): string {
    const icons: Record<string, string> = {
      'happy': '😊',
      'tired': '🥱',
      'missing-you': '🥺',
      'overthinking': '💭',
      'silent': '🤫',
      'need-attention': '🤗',
      'sad': '😢',
      'excited': '✨',
      'angry-but-soft': '😡',
      'need-reassurance': '🫂'
    };
    return icons[mood] || '✨';
  }

  getMoodLabel(mood: string): string {
    const labels: Record<string, string> = {
      'happy': 'Happy',
      'tired': 'Tired',
      'missing-you': 'Missing You',
      'overthinking': 'Overthinking',
      'silent': 'Quiet / Silent',
      'need-attention': 'Need Attention',
      'sad': 'Sad',
      'excited': 'Excited',
      'angry-but-soft': 'Angry but Soft',
      'need-reassurance': 'Need Reassurance'
    };
    return labels[mood] || mood;
  }

  private handleApiError(error: any): void {
    if (error && (error.message?.includes('not reachable') || error.status === 0)) {
      this.isBackendOffline = true;
      this.backendError = 'API Mode could not reach the local backend. You can switch to Local Mode for the browser demo.';
    }
  }

  private sortActivities(): void {
    this.recentActivities.sort((a, b) => b.date.localeCompare(a.date));
    this.recentActivities = this.recentActivities.slice(0, 3);
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
