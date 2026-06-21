import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from './core/services/theme.service';
import { TranslationService } from './core/services/translation.service';
import { AppModeService } from './core/services/app-mode.service';
import { TokenStorageService } from './core/services/token-storage.service';
import { AuthApiService } from './core/services/auth-api.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('Arova');

  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);
  private appMode = inject(AppModeService);
  private tokenStorage = inject(TokenStorageService);
  private authApi = inject(AuthApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.themeService.loadSavedTheme();
    this.translationService.loadSavedLanguage();
    this.validateApiTokenOnInit();
  }

  private validateApiTokenOnInit(): void {
    if (!this.appMode.isApiMode()) return;

    const token = this.tokenStorage.getToken();
    if (!token) return;

    this.authApi.me().subscribe({
      next: (user) => {
        if (user?.id) {
          this.tokenStorage.setToken(token);
          this.auth.setCurrentUser({
            id: user.id,
            username: user.username,
            passcode: '',
            displayName: user.displayName,
            role: user.role === 'admin' ? 'admin' : 'partner',
            avatarUrl: user.avatarUrl || undefined,
          });
        }
      },
      error: () => {
        this.tokenStorage.clearToken();
        this.auth.setCurrentUser(null);
        this.router.navigate(['/auth']);
      }
    });
  }
}
