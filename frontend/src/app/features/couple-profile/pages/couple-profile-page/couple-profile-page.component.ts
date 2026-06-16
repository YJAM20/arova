import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { CoupleProfileService } from '../../../../core/services/couple-profile.service';
import { CoupleProfile } from '../../../../shared/models/couple-profile.model';

@Component({
  selector: 'app-couple-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './couple-profile-page.component.html',
  styleUrls: ['./couple-profile-page.component.scss'],
})
export class CoupleProfilePageComponent implements OnInit {
  profile!: CoupleProfile;
  draft!: CoupleProfile;
  editing = false;
  message = '';

  constructor(private profiles: CoupleProfileService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  startEditing(): void {
    this.draft = { ...this.profile };
    this.editing = true;
    this.message = '';
  }

  cancel(): void {
    this.editing = false;
    this.draft = { ...this.profile };
  }

  save(): void {
    this.profile = this.profiles.saveProfile(this.draft);
    this.draft = { ...this.profile };
    this.auth.refreshCurrentUser();
    this.editing = false;
    this.message = 'Couple profile saved in this browser.';
  }

  private loadProfile(): void {
    this.profile = this.profiles.getProfile();
    this.draft = { ...this.profile };
  }
}
