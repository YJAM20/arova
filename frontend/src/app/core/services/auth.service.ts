import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AppUser } from '../../shared/models/user.model';
import { StorageService } from './storage.service';

const SESSION_KEY = 'love-universe-session-v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AppUser | null>(this.loadSession());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private storage: StorageService, private router: Router) {}

  private loadSession(): AppUser | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AppUser;
    } catch {
      return null;
    }
  }

  login(username: string, passcode: string): { success: boolean; error?: string } {
    const users = this.storage.getUsers();
    const match = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.passcode === passcode
    );

    if (!match) {
      return { success: false, error: 'The stars don\'t align. Check your username or passcode.' };
    }

    this.storage.updateUserLastLogin(match.id);
    const updatedUser = { ...match, lastLoginAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
    this.router.navigate([
      this.storage.getSettings().onboardingCompleted ? '/universe' : '/onboarding',
    ]);
    return { success: true };
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUserProfile(changes: { displayName?: string; avatarUrl?: string | null }): void {
    const current = this.currentUserSubject.value;
    if (!current) return;

    const updatedUser: AppUser = { ...current };
    if (changes.displayName !== undefined) {
      updatedUser.displayName = changes.displayName;
    }

    if (changes.avatarUrl !== undefined) {
      if (changes.avatarUrl) {
        updatedUser.avatarUrl = changes.avatarUrl;
      } else {
        delete updatedUser.avatarUrl;
      }
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  refreshCurrentUser(): void {
    const current = this.currentUserSubject.value;
    if (!current) return;

    const refreshed = this.storage.getUsers().find(user => user.id === current.id);
    if (!refreshed) return;

    localStorage.setItem(SESSION_KEY, JSON.stringify(refreshed));
    this.currentUserSubject.next(refreshed);
  }

  setCurrentUser(user: AppUser | null): void {
    this.currentUserSubject.next(user);
  }
}
