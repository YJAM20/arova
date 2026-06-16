import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { TranslationService } from '../../core/services/translation.service';
import { AppModeService } from '../../core/services/app-mode.service';
import { AppUser } from '../../shared/models/user.model';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  currentUser: AppUser | null = null;
  mobileNavOpen = false;

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
        { path: '/future', labelKey: 'future', icon: 'future' },
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
    private appMode: AppModeService
  ) {}

  get isLocalMode(): boolean {
    return this.appMode.isLocalMode();
  }

  ngOnInit(): void {

    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.redirectToOnboardingIfNeeded();
    });
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
}
