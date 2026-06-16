import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AuthApiService,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '../../../../core/services/auth-api.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';

@Component({
  selector: 'app-api-auth-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-auth-test.component.html',
  styleUrls: ['./api-auth-test.component.scss'],
})
export class ApiAuthTestComponent {
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

  lastResponse: AuthResponse | UserResponse | null = null;
  errorMessage = '';
  busyAction = '';

  constructor(private authApi: AuthApiService, private tokenStorage: TokenStorageService) {}

  get hasToken(): boolean {
    return this.tokenStorage.hasToken();
  }

  register(): void {
    this.run('register', () => {
      this.authApi.registerAndStoreToken(this.registerRequest).subscribe({
        next: response => this.handleSuccess(response),
        error: error => this.handleError(error),
      });
    });
  }

  login(): void {
    this.run('login', () => {
      this.authApi.loginAndStoreToken(this.loginRequest).subscribe({
        next: response => this.handleSuccess(response),
        error: error => this.handleError(error),
      });
    });
  }

  loadMe(): void {
    this.run('me', () => {
      this.authApi.me().subscribe({
        next: response => this.handleSuccess(response),
        error: error => this.handleError(error),
      });
    });
  }

  clearToken(): void {
    this.tokenStorage.clearToken();
    this.lastResponse = null;
    this.errorMessage = 'API token cleared.';
  }

  private run(action: string, callback: () => void): void {
    this.busyAction = action;
    this.errorMessage = '';
    callback();
  }

  private handleSuccess(response: AuthResponse | UserResponse): void {
    this.lastResponse = response;
    this.errorMessage = '';
    this.busyAction = '';
  }

  private handleError(error: unknown): void {
    this.lastResponse = null;
    this.busyAction = '';

    if (error instanceof HttpErrorResponse) {
      const message =
        typeof error.error === 'object' && error.error && 'message' in error.error
          ? String(error.error.message)
          : error.message;
      this.errorMessage = `API request failed (${error.status || 'network'}): ${message}`;
      return;
    }

    this.errorMessage = 'API request failed.';
  }
}
