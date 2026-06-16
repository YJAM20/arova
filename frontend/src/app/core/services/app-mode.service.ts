import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppMode = 'local' | 'api';

const APP_MODE_KEY = 'love-universe-app-mode';

@Injectable({ providedIn: 'root' })
export class AppModeService {
  private readonly modeSubject = new BehaviorSubject<AppMode>(this.loadMode());
  mode$ = this.modeSubject.asObservable();

  getMode(): AppMode {
    return this.modeSubject.value;
  }

  setMode(mode: AppMode): void {
    localStorage.setItem(APP_MODE_KEY, mode);
    this.modeSubject.next(mode);
  }

  isLocalMode(): boolean {
    return this.getMode() === 'local';
  }

  isApiMode(): boolean {
    return this.getMode() === 'api';
  }

  private loadMode(): AppMode {
    return localStorage.getItem(APP_MODE_KEY) === 'api' ? 'api' : 'local';
  }
}
