import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AppModeService } from '../../../../core/services/app-mode.service';
import { CoupleApiService, CoupleResponse, PairingCodeResponse } from '../../../../core/services/couple-api.service';
import { StorageService } from '../../../../core/services/storage.service';

type PairingFlow = 'create' | 'join';

@Component({
  selector: 'app-pairing-choice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pairing-choice.component.html',
  styleUrls: ['./pairing-choice.component.scss'],
})
export class PairingChoiceComponent {
  readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  selectedFlow: PairingFlow = 'create';
  coupleName = 'Arova Space';
  pairingCode = '';
  generatedCode: PairingCodeResponse | null = null;
  currentCouple: CoupleResponse | null = null;
  message = '';
  errorMessage = '';
  copyFeedback = '';
  ready = false;
  isBusy = false;

  constructor(
    private appMode: AppModeService,
    private couples: CoupleApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private storage: StorageService
  ) {}

  get isLocalMode(): boolean {
    return this.appMode.isLocalMode();
  }

  get modeLabel(): string {
    return this.isLocalMode ? 'Local Mode' : 'API Mode';
  }

  get primaryActionLabel(): string {
    if (this.isBusy && this.selectedFlow === 'create') return 'Creating your shared space...';
    if (this.isBusy && this.selectedFlow === 'join') return 'Joining your shared space...';
    return this.selectedFlow === 'create' ? 'Create shared space' : 'Join space';
  }

  get statusMessage(): string {
    if (this.isBusy && this.selectedFlow === 'create') return 'Creating your shared space...';
    if (this.isBusy && this.selectedFlow === 'join') return 'Joining your shared space...';
    return this.message;
  }

  selectFlow(flow: PairingFlow): void {
    this.selectedFlow = flow;
    this.errorMessage = '';
    this.copyFeedback = '';
  }

  join(): void {
    const code = this.pairingCode.trim();
    if (!code) {
      this.errorMessage = 'Enter a pairing code first.';
      return;
    }

    this.start();
    if (this.isLocalMode) {
      this.completeLocalPairing();
      this.finish(
        {
          id: 'local-demo-couple',
          name: this.coupleName.trim() || 'Arova Space',
          isActive: true,
        },
        'Your shared space is ready.'
      );
      return;
    }

    this.couples.joinCouple({ code: this.pairingCode.trim() }).subscribe({
      next: couple => this.finish(couple, 'Your shared space is ready.'),
      error: error => this.fail(this.toFriendlyError(error, 'We couldn’t complete pairing right now. Please check the code and try again.')),
    });
  }

  createCode(): void {
    this.start();
    if (this.isLocalMode) {
      this.completeLocalPairing();
      this.currentCouple = {
        id: 'local-demo-couple',
        name: this.coupleName.trim() || 'Arova Space',
        isActive: true,
      };
      this.generatedCode = this.createLocalPairingCode();
      this.ready = true;
      this.message = 'Your shared space is ready.';
      this.isBusy = false;
      return;
    }

    this.couples.createCouple({ name: this.coupleName.trim() || 'Arova Space' }).subscribe({
      next: couple => {
        this.currentCouple = couple;
        this.generateCode();
      },
      error: () => {
        this.couples.getMyCouple().subscribe({
          next: couple => {
            this.currentCouple = couple;
            this.generateCode();
          },
          error: error => this.fail(this.toFriendlyError(error, 'We couldn’t complete couple setup right now.')),
        });
      },
    });
  }

  enterArova(): void {
    this.router.navigate(['/universe']);
  }

  goBack(): void {
    this.router.navigate(['/profile-setup']);
  }

  async copyToClipboard(): Promise<void> {
    const code = this.generatedCode?.code;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      this.copyFeedback = 'Copied';
      this.message = 'Copied';
      this.cdr.detectChanges();
    } catch {
      this.copyFeedback = 'Select and copy the code manually.';
      this.cdr.detectChanges();
    }
  }

  private generateCode(): void {
    this.couples.generatePairingCode().subscribe({
      next: code => {
        this.generatedCode = code;
        this.ready = true;
        this.message = 'Your shared space is ready.';
        this.isBusy = false;
        this.cdr.detectChanges();
      },
      error: error => this.fail(this.toFriendlyError(error, 'We could not generate a pairing code right now.')),
    });
  }

  private finish(couple: CoupleResponse, message: string): void {
    this.currentCouple = couple;
    this.ready = true;
    this.message = message;
    this.isBusy = false;
    this.cdr.detectChanges();
  }

  private start(): void {
    this.isBusy = true;
    this.message = '';
    this.errorMessage = '';
    this.copyFeedback = '';
  }

  private fail(message: string): void {
    this.errorMessage = message;
    this.isBusy = false;
    this.cdr.detectChanges();
  }

  private completeLocalPairing(): void {
    const settings = this.storage.getSettings();
    this.storage.updateSettings({
      ...settings,
      onboardingCompleted: true,
    });

    this.storage.updateCoupleProfile({
      coupleSpaceName: this.coupleName.trim() || 'Arova Space',
    });
  }

  private createLocalPairingCode(): PairingCodeResponse {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return {
      code: `AROVA-DEMO-${suffix}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  private toFriendlyError(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (error.status === 0) {
      return `We couldn’t complete couple setup right now. Make sure the backend is running at ${this.apiBaseUrl}.`;
    }

    if (error.status === 401) {
      return 'Please sign in again before pairing.';
    }

    if (error.status === 403) {
      return 'This account cannot complete that pairing action.';
    }

    if (error.status === 400 || error.status === 404 || error.status === 409) {
      return this.extractServerMessage(error) ?? fallback;
    }

    return this.extractServerMessage(error) ?? fallback;
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
