import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AppMode, AppModeService } from '../../../../core/services/app-mode.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OnboardingService } from '../../../../core/services/onboarding.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { AppSettings } from '../../../../shared/models/app-settings.model';
import { AppUser } from '../../../../shared/models/user.model';
import { ArovaStatusPillComponent } from '../../../../shared/components/arova-status-pill/arova-status-pill.component';
import { SettingsDataService } from '../../../../core/services/settings-data.service';

import { toast } from 'ngx-sonner';

import { ArovaTooltipDirective } from '../../../../shared/components/arova-tooltip/arova-tooltip.directive';
import { CustomSectionsService } from '../../../../core/services/custom-sections.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    ArovaStatusPillComponent,
    ArovaTooltipDirective
  ],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit {
  currentUser: AppUser | null = null;
  settings: AppSettings = {
    activeTheme: 'dark-romantic',
    languageMode: 'en',
    animationsEnabled: true,
    musicEnabled: false,
    onboardingCompleted: false,
    emailNotificationsEnabled: true,
    dailyDigestEnabled: true,
    partnerActivityEmailsEnabled: true,
  };
  activeTab: 'general' | 'appearance' | 'account' = 'general';
  message = '';
  appMode: AppMode = 'local';
  apiBaseUrl = environment.apiBaseUrl;

  themeOptions = [
    { label: 'Dark Romantic', value: 'dark-romantic' },
    { label: 'Soft Pink', value: 'soft-pink' },
    { label: 'Midnight Stars', value: 'midnight-stars' },
    { label: 'Vintage Letters', value: 'vintage-letters' },
    { label: 'Minimal Cream', value: 'minimal-cream' },
    { label: 'Aurora Glass', value: 'aurora-glass' },
    { label: 'Cosmic Blue', value: 'cosmic-blue' },
    { label: 'Rose Noir', value: 'rose-noir' },
    { label: 'Lavender Fog', value: 'lavender-fog' },
    { label: 'Golden Hour', value: 'golden-hour' },
    { label: 'Moonlit Sage', value: 'moonlit-sage' },
    { label: 'Ocean Quiet', value: 'ocean-quiet' },
    { label: 'Velvet Plum', value: 'velvet-plum' },
    { label: 'Warm Sand', value: 'warm-sand' },
    { label: 'Arctic Glow', value: 'arctic-glow' },
    { label: 'Ember Night', value: 'ember-night' },
    { label: 'Pearl Blush', value: 'pearl-blush' },
    { label: 'Forest Whisper', value: 'forest-whisper' },
    { label: 'Solar Dusk', value: 'solar-dusk' },
    { label: 'Monochrome Luxe', value: 'monochrome-luxe' },
    { label: 'UI/UX Pro Max (Cinematic)', value: 'uiux-pro-max' },
  ];

  languageOptions: Array<{ label: string; value: AppSettings['languageMode'] }> = [
    { label: 'English', value: 'en' },
    { label: 'Arabic', value: 'ar' },
    { label: 'Spanish', value: 'es' },
  ];

  modeOptions: Array<{ label: string; value: AppMode; description: string }> = [
    {
      label: 'Local Mode',
      value: 'local',
      description: 'Stores data in this browser only. No backend is required.',
    },
    {
      label: 'API Mode',
      value: 'api',
      description: 'Connects account and couple setup to the ASP.NET Core backend.',
    },
  ];

  constructor(
    private appModeService: AppModeService,
    private themeService: ThemeService,
    private translation: TranslationService,
    private auth: AuthService,
    private onboarding: OnboardingService,
    private router: Router,
    private customSectionsService: CustomSectionsService,
    private settingsDataService: SettingsDataService
  ) {}

  get activePlan(): string {
    return this.customSectionsService.getTier();
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.appMode = this.appModeService.getMode();
    this.settingsDataService.getSettings().subscribe({
      next: (data) => {
        this.settings = { ...this.settings, ...data };
      },
      error: (err) => {
        console.error('Failed to load settings', err);
      }
    });
  }

  saveSettings(): void {
    this.appModeService.setMode(this.appMode);
    this.settingsDataService.saveSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = { ...this.settings, ...data };
        this.translation.applyLanguageMode(this.settings.languageMode);
        this.message = 'Settings saved for this browser.';
        toast.success('Changes saved successfully!', {
          description: 'Your preferences have been updated.',
          duration: 4000
        });
      },
      error: (err) => {
        console.error('Failed to save settings', err);
        toast.error('Could not save settings', {
          description: err.message || 'An error occurred.'
        });
      }
    });
  }

  resetOnboarding(): void {
    this.onboarding.reset();
    this.message = 'Onboarding was reset. You can update setup details again.';
    setTimeout(() => this.router.navigate(['/onboarding']));
  }

  t(key: string): string {
    return this.translation.t(key);
  }
}
