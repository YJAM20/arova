import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AppModeService } from '../../../../core/services/app-mode.service';
import {
  AuthApiService,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '../../../../core/services/auth-api.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';

type ApiAuthTab = 'register' | 'login' | 'me';

@Component({
  selector: 'app-api-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './api-auth.component.html',
  styleUrls: ['./api-auth.component.scss'],
})
export class ApiAuthComponent implements OnInit {
  activeTab: ApiAuthTab = 'login';
  apiBaseUrl = environment.apiBaseUrl;
  currentUser: UserResponse | null = null;
  message = '';
  errorMessage = '';
  busyAction = '';

  registerRequest: RegisterRequest = {
    displayName: '',
    username: '',
    email: '',
    password: '',
  };

  loginRequest: LoginRequest = {
    usernameOrEmail: '',
    password: '',
  };

  constructor(
    private appMode: AppModeService,
    private authApi: AuthApiService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    if (this.tokenStorage.hasToken()) {
      this.loadMe(false);
      this.activeTab = 'me';
    }
  }

  get hasToken(): boolean {
    return this.tokenStorage.hasToken();
  }

  register(): void {
    this.start('register');
    this.authApi.registerAndStoreToken(this.registerRequest).subscribe({
      next: response => this.handleAuthSuccess(response, 'Registered and stored API token.'),
      error: error => this.handleError(error),
    });
  }

  login(): void {
    this.start('login');
    this.authApi.loginAndStoreToken(this.loginRequest).subscribe({
      next: response => this.handleAuthSuccess(response, 'Logged in and stored API token.'),
      error: error => this.handleError(error),
    });
  }

  loadMe(showMessage = true): void {
    if (!this.hasToken) {
      this.errorMessage = 'No API token is stored. Login or register first.';
      return;
    }

    this.start('me');
    this.authApi.me().subscribe({
      next: user => {
        this.currentUser = user;
        this.busyAction = '';
        this.errorMessage = '';
        this.message = showMessage ? 'Loaded current API user.' : '';
      },
      error: error => this.handleError(error),
    });
  }

  apiLogout(): void {
    this.tokenStorage.clearToken();
    this.currentUser = null;
    this.message = 'API token cleared. Local app session was not changed.';
    this.errorMessage = '';
  }

  private start(action: string): void {
    this.busyAction = action;
    this.errorMessage = '';
    this.message = '';
  }

  private handleAuthSuccess(response: AuthResponse, message: string): void {
    this.appMode.setMode('api');
    this.currentUser = response.user;
    this.busyAction = '';
    this.errorMessage = '';
    this.message = `${message} App Mode is now API Mode.`;
    this.activeTab = 'me';
  }

  private handleError(error: unknown): void {
    this.busyAction = '';
    this.currentUser = null;
    this.message = '';
    this.errorMessage = this.toFriendlyError(error);
  }

  private toFriendlyError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The API request failed. Please try again.';
    }

    if (error.status === 0) {
      return `Backend appears offline. Make sure it is running at ${this.apiBaseUrl}.`;
    }

    if (error.status === 401) {
      return 'Unauthorized. Login again or clear the stored API token.';
    }

    if (error.status === 400) {
      return this.extractServerMessage(error) ?? 'The backend rejected the request. Check the form fields.';
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
