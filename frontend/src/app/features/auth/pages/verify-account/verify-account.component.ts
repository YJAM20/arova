import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VerificationApiService } from '../../../../core/services/verification-api.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { HttpErrorResponse } from '@angular/common/http';

type VerificationTab = 'email' | 'phone';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.scss'],
})
export class VerifyAccountComponent implements OnInit {
  activeTab: VerificationTab = 'email';
  email = '';
  code = '';
  message = '';
  errorMessage = '';
  isBusy = false;

  constructor(
    private verification: VerificationApiService,
    private authApi: AuthApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Attempt to prefill email from currently authenticated user profile
    this.authApi.me().subscribe({
      next: (user) => {
        if (user && user.email) {
          this.email = user.email;
        }
      },
      error: () => {
        // Ignore or allow manual entry
      }
    });
  }

  setTab(tab: VerificationTab): void {
    this.activeTab = tab;
    this.message = tab === 'phone'
      ? 'Phone verification is not available yet. Please use email verification for now.'
      : '';
    this.errorMessage = '';
  }

  requestCode(): void {
    if (this.activeTab === 'phone') {
      this.setTab('phone');
      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.isBusy = true;
    this.message = '';
    this.errorMessage = '';

    this.verification.requestCode({
      channel: 'email',
      destination: this.email.trim(),
      purpose: 'AccountSignup'
    }).subscribe({
      next: () => {
        this.message = 'Verification code requested. In local development, the verification code appears in the backend console.';
        this.isBusy = false;
      },
      error: (err: unknown) => {
        this.errorMessage = this.getFriendlyError(err, 'Could not request a code right now.');
        this.isBusy = false;
      },
    });
  }

  verify(): void {
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    if (!/^\d{6}$/.test(this.code.trim())) {
      this.errorMessage = 'Enter the 6-digit code.';
      return;
    }

    this.isBusy = true;
    this.message = '';
    this.errorMessage = '';

    this.verification.verifyCode({
      channel: 'email',
      destination: this.email.trim(),
      code: this.code.trim(),
      purpose: 'AccountSignup'
    }).subscribe({
      next: () => this.router.navigate(['/onboarding/questions']),
      error: (err: unknown) => {
        this.errorMessage = this.getFriendlyError(err, 'That code could not be verified.');
        this.isBusy = false;
      },
    });
  }

  private getFriendlyError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Backend is not reachable. Make sure http://localhost:5036 is running.';
      }
      if (error.error && error.error.message) {
        return error.error.message;
      }
    }
    return fallback;
  }
}
