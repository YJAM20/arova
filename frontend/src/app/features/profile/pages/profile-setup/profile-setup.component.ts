import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppModeService } from '../../../../core/services/app-mode.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileApiService, ProfileResponse } from '../../../../core/services/profile-api.service';
import { AppUser } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.scss'],
})
export class ProfileSetupComponent implements OnInit, OnDestroy {
  profile: ProfileResponse = this.emptyProfile();
  currentUser: AppUser | null = null;
  message = '';
  errorMessage = '';
  displayNameError = '';
  isLoading = true;
  isBusy = false;
  isComplete = false;
  hasLoadError = false;

  readonly languageOptions: Array<{ value: NonNullable<ProfileResponse['preferredLanguage']>; label: string }> = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic' },
    { value: 'es', label: 'Spanish' },
  ];

  readonly themeOptions = [
    { value: 'dark-romantic', label: 'Dark Romantic' },
    { value: 'soft-pink', label: 'Soft Pink' },
    { value: 'midnight-stars', label: 'Midnight Stars' },
  ];

  readonly loveLanguageOptions = [
    'Words of Affirmation',
    'Quality Time',
    'Receiving Gifts',
    'Acts of Service',
    'Physical Touch',
  ];

  private userSubscription?: Subscription;
  private loadTimeoutId?: number;
  private loadAttempt = 0;

  constructor(
    private profileApi: ProfileApiService,
    private auth: AuthService,
    private appMode: AppModeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.clearLoadTimeout();
  }

  loadProfile(): void {
    const attempt = ++this.loadAttempt;
    this.isLoading = true;
    this.hasLoadError = false;
    this.errorMessage = '';
    this.message = '';
    this.clearLoadTimeout();
    this.loadTimeoutId = window.setTimeout(() => {
      if (this.loadAttempt !== attempt || !this.isLoading) return;
      this.hasLoadError = true;
      this.errorMessage = 'We could not load your profile right now.';
      this.isLoading = false;
    }, 5000);

    this.profileApi.getProfile().subscribe({
      next: profile => {
        if (this.loadAttempt !== attempt || this.hasLoadError) return;
        this.clearLoadTimeout();
        this.profile = {
          ...this.emptyProfile(),
          displayName: this.currentUser?.displayName || '',
          avatarUrl: this.currentUser?.avatarUrl || '',
          ...profile,
        };
        this.isLoading = false;
      },
      error: err => {
        if (this.loadAttempt !== attempt) return;
        this.clearLoadTimeout();
        this.hasLoadError = true;
        this.errorMessage = err?.status === 0
          ? 'We could not load your profile because the backend is offline at http://localhost:5036.'
          : 'We could not load your profile right now.';
        this.isLoading = false;
      },
    });
  }

  get isAdult(): boolean {
    if (!this.profile.dateOfBirth) return false;
    const birth = new Date(this.profile.dateOfBirth);
    const age = Math.floor((Date.now() - birth.getTime()) / 31557600000);
    return age >= 18;
  }

  get profileInitials(): string {
    const name = this.profile.displayName?.trim() || this.currentUser?.displayName || this.currentUser?.username || 'A';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  get previewName(): string {
    return this.profile.displayName?.trim() || this.currentUser?.displayName || 'Arova Member';
  }

  get previewUsername(): string {
    return this.currentUser?.username ? `@${this.currentUser.username}` : 'Private profile';
  }

  get roleLabel(): string {
    if (!this.currentUser?.role) return 'Member';
    if (this.currentUser.role === 'admin') return 'Owner';
    if (this.currentUser.role === 'partner') return 'Partner';
    return this.currentUser.role;
  }

  get modeLabel(): string {
    return this.appMode.isLocalMode() ? 'Local Mode' : 'API Mode';
  }

  get canSave(): boolean {
    return !this.isBusy && !this.isLoading && !this.hasLoadError;
  }

  save(): void {
    if (!this.validateProfile()) return;

    this.isBusy = true;
    this.errorMessage = '';
    this.message = 'Saving your profile...';

    const request = this.toRequest();

    this.profileApi.updateProfile(request).subscribe({
      next: updated => {
        this.profile = { ...this.profile, ...request, ...updated };
        this.saveMatureContentIfNeeded(!!request.matureContentEnabled);
      },
      error: err => {
        this.handleSaveError(err);
      },
    });
  }

  private saveMatureContentIfNeeded(enabled: boolean): void {
    if (!this.isAdult) {
      this.completeSetup();
      return;
    }

    this.profileApi.updateMatureContent(enabled).subscribe({
      next: () => this.completeSetup(),
      error: err => this.handleSaveError(err),
    });
  }

  private completeSetup(): void {
    this.isBusy = false;
    this.isComplete = true;
    this.message = 'Profile saved. Your space is ready for the next step.';
    setTimeout(() => this.router.navigate(['/pairing-choice']), 650);
  }

  private handleSaveError(err: { status?: number; error?: { message?: string } }): void {
    this.errorMessage = err?.status === 0
      ? 'We could not save your profile because the backend is offline at http://localhost:5036.'
      : err?.error?.message || "We couldn't save your profile right now. Please try again.";
    this.message = '';
    this.isBusy = false;
  }

  private validateProfile(): boolean {
    const displayName = this.profile.displayName?.trim() ?? '';
    this.displayNameError = displayName ? '' : 'Add the name Arova should show across the app.';
    return !this.displayNameError;
  }

  private toRequest(): ProfileResponse {
    return {
      ...this.profile,
      displayName: this.profile.displayName?.trim(),
      avatarUrl: this.profile.avatarUrl?.trim() || '',
      bio: this.profile.bio?.trim() || '',
      relationshipStatus: this.profile.relationshipStatus?.trim() || '',
      relationshipType: this.profile.relationshipType?.trim() || '',
      loveLanguage: this.profile.loveLanguage?.trim() || '',
      personalityStyle: this.profile.personalityStyle?.trim() || '',
      matureContentEnabled: this.isAdult ? !!this.profile.matureContentEnabled : false,
    };
  }

  private emptyProfile(): ProfileResponse {
    return {
      displayName: '',
      avatarUrl: '',
      bio: '',
      dateOfBirth: '',
      relationshipStatus: '',
      relationshipType: '',
      preferredLanguage: 'en',
      preferredTheme: 'dark-romantic',
      loveLanguage: '',
      personalityStyle: '',
      matureContentEnabled: false,
    };
  }

  private clearLoadTimeout(): void {
    if (this.loadTimeoutId === undefined) return;
    window.clearTimeout(this.loadTimeoutId);
    this.loadTimeoutId = undefined;
  }
}
