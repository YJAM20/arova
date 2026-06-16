import { Injectable } from '@angular/core';

const API_TOKEN_KEY = 'love-universe-api-token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  setToken(token: string): void {
    localStorage.setItem(API_TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(API_TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(API_TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
