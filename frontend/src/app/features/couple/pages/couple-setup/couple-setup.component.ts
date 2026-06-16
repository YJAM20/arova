import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AppModeService } from '../../../../core/services/app-mode.service';
import {
  CoupleApiService,
  CoupleMemberResponse,
  CoupleResponse,
  PairingCodeResponse,
} from '../../../../core/services/couple-api.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';

@Component({
  selector: 'app-couple-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './couple-setup.component.html',
  styleUrls: ['./couple-setup.component.scss'],
})
export class CoupleSetupComponent implements OnInit {
  apiBaseUrl = environment.apiBaseUrl;
  coupleName = 'Arova Space';
  pairingCodeInput = '';
  currentCouple: CoupleResponse | null = null;
  members: CoupleMemberResponse[] = [];
  pairingCode: PairingCodeResponse | null = null;
  message = '';
  errorMessage = '';
  busyAction = '';

  constructor(
    private appMode: AppModeService,
    private couples: CoupleApiService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    if (this.canUseCoupleApi) {
      this.loadMyCouple(false);
    }
  }

  get isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  get hasToken(): boolean {
    return this.tokenStorage.hasToken();
  }

  get canUseCoupleApi(): boolean {
    return this.isApiMode && this.hasToken;
  }

  switchToApiMode(): void {
    this.appMode.setMode('api');
    this.message = 'App Mode is now API Mode.';
    this.errorMessage = '';
  }

  loadMyCouple(showMessage = true): void {
    if (!this.ensureReady()) return;

    this.start('load-couple');
    this.couples.getMyCouple().subscribe({
      next: couple => {
        this.currentCouple = couple;
        this.busyAction = '';
        this.errorMessage = '';
        this.message = showMessage ? 'Loaded current couple space.' : '';
        this.loadMembers(false);
      },
      error: error => this.handleError(error, 'No active couple space found yet.'),
    });
  }

  createCouple(): void {
    if (!this.ensureReady()) return;
    const name = this.coupleName.trim();
    if (!name) {
      this.errorMessage = 'Enter a couple space name first.';
      return;
    }

    this.start('create-couple');
    this.couples.createCouple({ name }).subscribe({
      next: couple => {
        this.currentCouple = couple;
        this.busyAction = '';
        this.errorMessage = '';
        this.message = 'Couple space created.';
        this.loadMembers(false);
      },
      error: error => this.handleError(error),
    });
  }

  generatePairingCode(): void {
    if (!this.ensureReady()) return;

    this.start('pairing-code');
    this.couples.generatePairingCode().subscribe({
      next: response => {
        this.pairingCode = response;
        this.busyAction = '';
        this.errorMessage = '';
        this.message = 'Pairing code generated. Share it privately.';
      },
      error: error => this.handleError(error),
    });
  }

  joinCouple(): void {
    if (!this.ensureReady()) return;
    const code = this.pairingCodeInput.trim();
    if (!code) {
      this.errorMessage = 'Enter a pairing code first.';
      return;
    }

    this.start('join-couple');
    this.couples.joinCouple({ code }).subscribe({
      next: couple => {
        this.currentCouple = couple;
        this.pairingCodeInput = '';
        this.busyAction = '';
        this.errorMessage = '';
        this.message = 'Joined couple space.';
        this.loadMembers(false);
      },
      error: error => this.handleError(error),
    });
  }

  loadMembers(showMessage = true): void {
    if (!this.ensureReady()) return;

    this.start('members');
    this.couples.getMembers().subscribe({
      next: members => {
        this.members = members;
        this.busyAction = '';
        this.errorMessage = '';
        this.message = showMessage ? 'Loaded members.' : this.message;
      },
      error: error => this.handleError(error),
    });
  }

  formatDate(value?: string): string {
    if (!value) return 'Not provided';
    return new Date(value).toLocaleString();
  }

  private ensureReady(): boolean {
    if (!this.isApiMode) {
      this.errorMessage = 'Switch to API Mode before using Couple Setup.';
      return false;
    }

    if (!this.hasToken) {
      this.errorMessage = 'Login or register through API Account Access first.';
      return false;
    }

    return true;
  }

  private start(action: string): void {
    this.busyAction = action;
    this.errorMessage = '';
    this.message = '';
  }

  private handleError(error: unknown, notFoundMessage?: string): void {
    this.busyAction = '';
    this.message = '';
    this.errorMessage = this.toFriendlyError(error, notFoundMessage);
  }

  private toFriendlyError(error: unknown, notFoundMessage?: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The API request failed. Please try again.';
    }

    if (error.status === 0) {
      return `Backend appears offline. Make sure it is running at ${this.apiBaseUrl}.`;
    }

    if (error.status === 401) {
      return 'Unauthorized. Login again in API Account Access.';
    }

    if (error.status === 403) {
      return 'This action is not allowed for the current API user.';
    }

    if (error.status === 404) {
      return notFoundMessage ?? 'The requested couple space was not found.';
    }

    if (error.status === 409) {
      return this.extractServerMessage(error) ?? 'This user already has an active couple space.';
    }

    if (error.status === 400) {
      return (
        this.extractServerMessage(error) ??
        'The backend rejected the request. The pairing code may be invalid or expired.'
      );
    }

    return this.extractServerMessage(error) ?? `API request failed with status ${error.status}.`;
  }

  private extractServerMessage(error: HttpErrorResponse): string | null {
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (typeof error.error === 'object' && error.error) {
      if ('message' in error.error) return String(error.error.message);
      if ('title' in error.error) return String(error.error.title);
    }

    return null;
  }
}
