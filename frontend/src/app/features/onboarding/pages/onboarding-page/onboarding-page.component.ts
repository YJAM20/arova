import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { OnboardingService } from '../../../../core/services/onboarding.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { AppSettings } from '../../../../shared/models/app-settings.model';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss'],
})
export class OnboardingPageComponent implements OnInit {
  coupleSpaceName = 'Arova Space';
  partnerADisplayName = 'Partner A';
  partnerBDisplayName = 'Partner B';
  languageMode: AppSettings['languageMode'] = 'en';
  activeTheme = 'dark-romantic';

  themeOptions = [
    { label: 'Dark Romantic', value: 'dark-romantic' },
    { label: 'Soft Pink', value: 'soft-pink' },
    { label: 'Midnight Stars', value: 'midnight-stars' },
    { label: 'Vintage Letters', value: 'vintage-letters' },
    { label: 'Minimal Cream', value: 'minimal-cream' },
  ];

  languageOptions: Array<{ label: string; value: AppSettings['languageMode'] }> = [
    { label: 'English', value: 'en' },
    { label: 'Arabic', value: 'ar' },
    { label: 'Spanish', value: 'es' },
  ];

  constructor(
    private onboarding: OnboardingService,
    private theme: ThemeService,
    private translation: TranslationService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.onboarding.isCompleted()) {
      this.router.navigate(['/universe']);
      return;
    }

    const settings = this.theme.getSettings();
    this.languageMode = settings.languageMode;
    this.activeTheme = settings.activeTheme;
  }

  get canContinue(): boolean {
    return (
      this.coupleSpaceName.trim().length > 0 &&
      this.partnerADisplayName.trim().length > 0 &&
      this.partnerBDisplayName.trim().length > 0
    );
  }

  save(): void {
    if (!this.canContinue) return;

    this.onboarding.completeSetup({
      coupleSpaceName: this.coupleSpaceName,
      partnerADisplayName: this.partnerADisplayName,
      partnerBDisplayName: this.partnerBDisplayName,
      languageMode: this.languageMode,
      activeTheme: this.activeTheme,
    });
    this.theme.loadSavedTheme();
    this.translation.loadSavedLanguage();
    this.auth.refreshCurrentUser();
    this.router.navigate(['/universe']);
  }

  skip(): void {
    this.onboarding.skipForDemo();
    this.theme.loadSavedTheme();
    this.translation.loadSavedLanguage();
    this.auth.refreshCurrentUser();
    this.router.navigate(['/universe']);
  }
}
