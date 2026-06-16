import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  AuthApiService,
  LoginRequest,
  PasswordStrengthResponse,
  RegisterRequest,
} from '../../../../core/services/auth-api.service';
import { SetupStatusApiService } from '../../../../core/services/setup-status-api.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-public-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './public-auth.component.html',
  styleUrls: ['./public-auth.component.scss'],
})
export class PublicAuthComponent {
  mode: AuthMode = 'login';
  message = '';
  errorMessage = '';
  providerMessage = '';
  isBusy = false;
  confirmPassword = '';
  strength: PasswordStrengthResponse = { score: 0, label: 'Weak', feedback: [] };

  loginRequest: LoginRequest = {
    usernameOrEmail: '',
    password: '',
  };

  registerRequest: RegisterRequest = {
    displayName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    preferredLanguage: 'en',
    dateOfBirth: '',
  };

  constructor(
    private authApi: AuthApiService,
    private setupStatus: SetupStatusApiService,
    private router: Router
  ) {}

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.errorMessage = '';
    this.message = '';
  }

  login(): void {
    const userOrEmail = this.loginRequest.usernameOrEmail.trim();
    const password = this.loginRequest.password;

    if (!userOrEmail) {
      this.errorMessage = 'Username or email is required.';
      return;
    }

    if (!password) {
      this.errorMessage = 'Password is required.';
      return;
    }

    this.loginRequest.usernameOrEmail = userOrEmail;

    this.start();
    this.authApi.loginAndStoreToken(this.loginRequest).subscribe({
      next: () => this.routeAfterAuth(),
      error: (err) => {
        if (err && err.status === 0) {
          this.fail('Backend appears offline. Make sure the API is running at ' + this.authApi.apiBaseUrl);
        } else {
          this.fail('We could not sign you in with those details. Please check and try again.');
        }
      },
    });
  }

  register(): void {
    const displayName = this.registerRequest.displayName.trim();
    const username = this.registerRequest.username.trim();
    const email = this.registerRequest.email.trim();
    const password = this.registerRequest.password;
    const confirm = this.confirmPassword;

    if (!displayName) {
      this.errorMessage = 'Display name is required.';
      return;
    }

    if (!username) {
      this.errorMessage = 'Username is required.';
      return;
    }

    if (!email) {
      this.errorMessage = 'Email address is required.';
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!password) {
      this.errorMessage = 'Password is required.';
      return;
    }

    if (!confirm) {
      this.errorMessage = 'Confirm password is required.';
      return;
    }

    if (password !== confirm) {
      this.errorMessage = 'Passwords must match.';
      return;
    }

    if ((this.strength.score ?? 0) < 3) {
      this.errorMessage = 'Use a stronger password before creating your account.';
      return;
    }

    this.registerRequest.displayName = displayName;
    this.registerRequest.username = username;
    this.registerRequest.email = email;

    this.start();
    this.authApi.registerAndStoreToken(this.registerRequest).subscribe({
      next: () => this.routeAfterAuth(),
      error: (err) => {
        if (err && err.status === 0) {
          this.fail('Backend appears offline. Make sure the API is running.');
        } else {
          this.fail(err.error?.message || 'We could not create this account. Check the details and try again.');
        }
      },
    });
  }

  checkPasswordStrength(): void {
    const password = this.registerRequest.password;
    if (!password) {
      this.strength = { score: 0, label: 'Weak', feedback: [] };
      return;
    }

    this.authApi.checkPasswordStrength(password).subscribe({
      next: result => {
        this.strength = {
          score: result.score ?? this.fallbackScore(password),
          label: result.label ?? this.fallbackLabel(password),
          feedback: result.feedback ?? [],
        };
      },
      error: () => {
        this.strength = {
          score: this.fallbackScore(password),
          label: this.fallbackLabel(password),
          feedback: ['Using local password strength estimate.'],
        };
      },
    });
  }

  providerPlaceholder(provider: string): void {
    this.providerMessage = `${provider} is prepared but not configured in this environment yet.`;
  }

  private routeAfterAuth(): void {
    this.setupStatus.getStatus().subscribe({
      next: status => {
        this.isBusy = false;
        this.router.navigate([this.setupStatus.getNextRoute(status)]);
      },
      error: () => {
        this.isBusy = false;
        this.message = 'Setup status is unavailable. You can continue to couple setup or enter Arova if already configured.';
      },
    });
  }

  private start(): void {
    this.isBusy = true;
    this.errorMessage = '';
    this.message = '';
  }

  private fail(message: string): void {
    this.isBusy = false;
    this.errorMessage = message;
  }

  private fallbackScore(password: string): number {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  private fallbackLabel(password: string): string {
    const score = this.fallbackScore(password);
    if (score >= 4) return 'Strong';
    if (score >= 2) return 'Okay';
    return 'Weak';
  }
}
