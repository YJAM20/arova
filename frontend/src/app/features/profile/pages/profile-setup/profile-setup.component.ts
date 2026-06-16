import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProfileApiService, ProfileResponse } from '../../../../core/services/profile-api.service';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.scss'],
})
export class ProfileSetupComponent implements OnInit {
  profile: ProfileResponse = {
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
  message = '';
  errorMessage = '';
  isBusy = false;

  constructor(private profileApi: ProfileApiService, private router: Router) {}

  ngOnInit(): void {
    this.profileApi.getProfile().subscribe({
      next: profile => {
        this.profile = { ...this.profile, ...profile };
      },
      error: () => {
        this.message = 'Profile can be completed once the backend is available.';
      },
    });
  }

  get isAdult(): boolean {
    if (!this.profile.dateOfBirth) return false;
    const birth = new Date(this.profile.dateOfBirth);
    const age = Math.floor((Date.now() - birth.getTime()) / 31557600000);
    return age >= 18;
  }

  save(): void {
    this.isBusy = true;
    this.errorMessage = '';

    const request: ProfileResponse = {
      ...this.profile,
      matureContentEnabled: this.isAdult ? !!this.profile.matureContentEnabled : false,
    };

    this.profileApi.updateProfile(request).subscribe({
      next: () => {
        if (this.isAdult) {
          this.profileApi.updateMatureContent(!!request.matureContentEnabled).subscribe({
            next: () => {
              this.router.navigate(['/pairing-choice']);
            },
            error: (err) => {
              if (err && err.status === 0) {
                this.errorMessage = 'Backend is not reachable. Make sure http://localhost:5036 is running.';
              } else {
                this.errorMessage = err.error?.message || 'Mature content update rejected by backend.';
              }
              this.isBusy = false;
            }
          });
        } else {
          this.router.navigate(['/pairing-choice']);
        }
      },
      error: (err) => {
        if (err && err.status === 0) {
          this.errorMessage = 'Backend is not reachable. Make sure http://localhost:5036 is running.';
        } else {
          this.errorMessage = err.error?.message || 'Profile could not be saved.';
        }
        this.isBusy = false;
      },
    });
  }
}
