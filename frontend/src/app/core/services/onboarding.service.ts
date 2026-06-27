import { Injectable } from '@angular/core';
import { AppSettings } from '../../shared/models/app-settings.model';
import { CoupleProfile } from '../../shared/models/couple-profile.model';
import { StorageService } from './storage.service';

export interface OnboardingInput {
  coupleSpaceName: string;
  partnerADisplayName: string;
  partnerBDisplayName: string;
  languageMode: AppSettings['languageMode'];
  activeTheme: string;
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  constructor(private storage: StorageService) {}

  isCompleted(): boolean {
    return this.storage.getSettings().onboardingCompleted;
  }

  completeSetup(input: OnboardingInput): void {
    this.saveSetup(input, true);
  }

  skipForDemo(): void {
    const profile = this.storage.getCoupleProfile();
    const settings = this.storage.getSettings();

    this.saveSetup(
      {
        coupleSpaceName: profile.coupleSpaceName || 'Arova Space',
        partnerADisplayName: profile.partnerADisplayName || 'Partner A',
        partnerBDisplayName: profile.partnerBDisplayName || 'Partner B',
        languageMode: settings.languageMode,
        activeTheme: settings.activeTheme,
      },
      true
    );
  }

  reset(): void {
    this.storage.updateSettings({
      ...this.storage.getSettings(),
      onboardingCompleted: false,
    });
    localStorage.removeItem('arova-first-week-checklist-v1');
  }

  private saveSetup(input: OnboardingInput, completed: boolean): void {
    const data = this.storage.loadFullAppData();
    const now = new Date().toISOString();
    const profile: CoupleProfile = {
      ...data.coupleProfile,
      coupleSpaceName: this.clean(input.coupleSpaceName) ?? 'Arova Space',
      partnerADisplayName: this.clean(input.partnerADisplayName) ?? 'Partner A',
      partnerBDisplayName: this.clean(input.partnerBDisplayName) ?? 'Partner B',
      updatedAt: now,
    };

    data.coupleProfile = profile;
    data.settings = {
      ...data.settings,
      activeTheme: input.activeTheme,
      languageMode: input.languageMode,
      onboardingCompleted: completed,
    };
    data.users = data.users.map(user =>
      user.role === 'admin'
        ? { ...user, displayName: profile.partnerADisplayName }
        : { ...user, displayName: profile.partnerBDisplayName }
    );

    this.storage.saveFullAppData(data);
  }

  private clean(value: string | undefined): string | undefined {
    const trimmed = value?.trim() ?? '';
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
