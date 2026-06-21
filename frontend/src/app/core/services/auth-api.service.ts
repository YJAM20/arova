import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface RegisterRequest {
  displayName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
  preferredLanguage?: 'en' | 'ar' | 'es';
  dateOfBirth?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface UserResponse {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  createdAt?: string;
  isSystemAdmin?: boolean;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface PasswordStrengthResponse {
  score?: number;
  label?: string;
  feedback?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  public readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/api/auth/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/api/auth/login`, request);
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiBaseUrl}/api/auth/me`);
  }

  checkPasswordStrength(password: string): Observable<PasswordStrengthResponse> {
    return this.http.post<PasswordStrengthResponse>(
      `${this.apiBaseUrl}/api/auth/password-strength`,
      { password }
    );
  }

  registerAndStoreToken(request: RegisterRequest): Observable<AuthResponse> {
    return this.register(request).pipe(tap(response => this.storeResponseToken(response)));
  }

  loginAndStoreToken(request: LoginRequest): Observable<AuthResponse> {
    return this.login(request).pipe(tap(response => this.storeResponseToken(response)));
  }

  private storeResponseToken(response: AuthResponse): void {
    if (response.token) {
      this.tokenStorage.setToken(response.token);
    }
  }
}
