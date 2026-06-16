import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppModeService } from '../services/app-mode.service';
import { TokenStorageService } from '../services/token-storage.service';
import { SetupStatusApiService } from '../services/setup-status-api.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> | boolean | UrlTree => {
  const auth = inject(AuthService);
  const appMode = inject(AppModeService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  const setupStatus = inject(SetupStatusApiService);

  if (appMode.isApiMode()) {
    if (!tokenStorage.hasToken()) {
      return router.createUrlTree(['/auth']);
    }

    const path = state.url.split('?')[0];
    const isSetupPage = [
      '/verify-account',
      '/onboarding/questions',
      '/profile-setup',
      '/pairing-choice'
    ].includes(path);

    if (isSetupPage) {
      return true;
    }

    return setupStatus.getStatus().pipe(
      map(status => {
        const nextRoute = setupStatus.getNextRoute(status);
        if (nextRoute !== '/universe') {
          return router.createUrlTree([nextRoute]);
        }
        return true;
      }),
      catchError(() => {
        return of(true);
      })
    );
  } else {
    if (auth.isLoggedIn()) {
      return true;
    }
    return router.createUrlTree(['/auth']);
  }
};
