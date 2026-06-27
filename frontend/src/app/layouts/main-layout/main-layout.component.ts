import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, skip, distinctUntilChanged, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { TranslationService } from '../../core/services/translation.service';
import { AppModeService } from '../../core/services/app-mode.service';
import { AppUser } from '../../shared/models/user.model';
import { ArovaRankBadgeComponent } from '../../shared/components/arova-rank-badge/arova-rank-badge.component';
import { CoupleHubService, PartnerPresence } from '../../core/services/couple-hub.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { toast } from 'ngx-sonner';
import { PwaInstallPromptComponent } from '../../shared/components/pwa-install-prompt/pwa-install-prompt.component';

interface NavLink {
  path: string;
  labelKey: string;
  icon: string;
  adminOnly?: boolean;
}

interface NavGroup {
  labelKey: string;
  links: NavLink[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ArovaRankBadgeComponent, PwaInstallPromptComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser: AppUser | null = null;
  mobileNavOpen = false;
  partnerPresence: PartnerPresence | null = null;
  private hubSubscriptions = new Subscription();

  navGroups: NavGroup[] = [
    {
      labelKey: 'todayNav',
      links: [
        { path: '/universe', labelKey: 'universe', icon: 'universe' },
        { path: '/planets', labelKey: 'planets', icon: 'planets' },
        { path: '/daily-questions', labelKey: 'dailyQuestions', icon: 'daily-questions' },
        { path: '/check-in', labelKey: 'checkIn', icon: 'check-in' },
      ],
    },
    {
      labelKey: 'usNav',
      links: [
        { path: '/couple-profile', labelKey: 'coupleProfile', icon: 'couple-profile' },
        { path: '/profile', labelKey: 'profile', icon: 'profile' },
        { path: '/mood', labelKey: 'mood', icon: 'mood' },
        { path: '/chat', labelKey: 'chat', icon: 'chat' },
      ],
    },
    {
      labelKey: 'memoriesNav',
      links: [
        { path: '/memories', labelKey: 'memories', icon: 'memories' },
        { path: '/reasons', labelKey: 'reasons', icon: 'reasons' },
        { path: '/letters', labelKey: 'letters', icon: 'letters' },
      ],
    },
    {
      labelKey: 'toolsNav',
      links: [
        { path: '/music', labelKey: 'music', icon: 'music' },
        { path: '/challenges', labelKey: 'challenges', icon: 'challenges' },
        { path: '/important-dates', labelKey: 'importantDates', icon: 'important-dates' },
        { path: '/future', labelKey: 'future', icon: 'future' },
        { path: '/goals', labelKey: 'goals', icon: 'goals' },
        { path: '/custom-sections', labelKey: 'customSections', icon: 'custom-sections' },
        { path: '/settings', labelKey: 'settings', icon: 'settings' },
      ],
    },
    {
      labelKey: 'adminNav',
      links: [
        { path: '/admin', labelKey: 'admin', icon: 'admin', adminOnly: true },
      ],
    },
  ];

  constructor(
    private auth: AuthService,
    private onboarding: OnboardingService,
    private router: Router,
    private translation: TranslationService,
    private appMode: AppModeService,
    private coupleHub: CoupleHubService,
    private tokenStorage: TokenStorageService
  ) {}

  get isLocalMode(): boolean {
    return this.appMode.isLocalMode();
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.redirectToOnboardingIfNeeded();

      if (!this.isLocalMode && user) {
        const token = this.tokenStorage.getToken();
        if (token) {
          this.coupleHub.start(token).then(() => {
            this.trackActiveSpace(this.router.url);
          }).catch(err => {
            console.error('Failed to start Couple Hub connection:', err);
          });
        }
      } else {
        void this.coupleHub.stop();
      }
    });

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.trackActiveSpace(event.urlAfterRedirects || event.url);
    });

    this.hubSubscriptions.add(
      this.coupleHub.partnerPresence$.subscribe(presence => {
        this.partnerPresence = presence;
      })
    );

    this.hubSubscriptions.add(
      this.coupleHub.partnerPresence$.pipe(
        map(p => p?.isOnline ?? false),
        distinctUntilChanged(),
        skip(1)
      ).subscribe(isOnline => {
        if (isOnline) {
          const name = this.partnerPresence?.displayName ?? 'Your partner';
          toast.success(`${name} is online`, {
            description: 'Your partner is here.',
            duration: 4000
          });
        }
      })
    );

    this.hubSubscriptions.add(
      this.coupleHub.pointsAwarded$.subscribe(payload => {
        toast.info(`+${payload.points} points added to your orbit.`, {
          description: `${payload.userDisplayName} completed: ${payload.actionType}`,
          duration: 4000
        });
      })
    );

    this.hubSubscriptions.add(
      this.coupleHub.streakMilestone$.subscribe(payload => {
        toast.success(`Your streak reached ${payload.streak} days.`, {
          description: 'Keep the momentum going! ❤️',
          duration: 5000
        });
      })
    );

    this.hubSubscriptions.add(
      this.coupleHub.rankChanged$.subscribe(payload => {
        toast.success(`You reached ${payload.rank} rank.`, {
          description: 'Your couple bond is growing stronger! ✨',
          duration: 6000
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.hubSubscriptions.unsubscribe();
    void this.coupleHub.stop();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  logout(): void {
    this.auth.logout();
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
  }

  getVisibleLinks(group: NavGroup): NavLink[] {
    return group.links.filter(link => !link.adminOnly || this.isAdmin);
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  private redirectToOnboardingIfNeeded(): void {
    if (
      this.currentUser &&
      !this.onboarding.isCompleted() &&
      !this.router.url.startsWith('/onboarding')
    ) {
      this.router.navigate(['/onboarding']);
    }
  }

  trackActiveSpace(url: string): void {
    if (this.isLocalMode) return;

    let spaceName = '';
    if (url.includes('/universe')) spaceName = 'Universe';
    else if (url.includes('/memories')) spaceName = 'Memories';
    else if (url.includes('/reasons')) spaceName = 'Reasons';
    else if (url.includes('/letters')) spaceName = 'Letters';
    else if (url.includes('/mood')) spaceName = 'Mood Room';
    else if (url.includes('/music')) spaceName = 'Music Room';
    else if (url.includes('/future')) spaceName = 'Future Board';
    else if (url.includes('/goals')) spaceName = 'Couple Goals';
    else if (url.includes('/chat')) spaceName = 'Chat';
    else if (url.includes('/planets')) spaceName = 'Planets';
    else if (url.includes('/settings')) spaceName = 'Settings';

    if (spaceName) {
      this.coupleHub.sendActiveSpace(spaceName);
    }
  }

  formatLastSeen(timestamp: string): string {
    if (!timestamp) return 'a long time ago';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'a moment ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }
}
