import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { TranslationService } from './core/services/translation.service';
import { AppModeService } from './core/services/app-mode.service';
import { TokenStorageService } from './core/services/token-storage.service';
import { AuthApiService } from './core/services/auth-api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('dd');

  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);
  private appMode = inject(AppModeService);
  private tokenStorage = inject(TokenStorageService);
  private authApi = inject(AuthApiService);
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
        }
      },
      error: () => {
        this.tokenStorage.clearToken();
        this.router.navigate(['/auth']);
      }
    });
  }
}
