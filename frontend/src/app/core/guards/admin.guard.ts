import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppModeService } from '../services/app-mode.service';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthApiService } from '../services/auth-api.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> | boolean | UrlTree => {
  const auth = inject(AuthService);
  const appMode = inject(AppModeService);
  const tokenStorage = inject(TokenStorageService);
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  if (appMode.isApiMode()) {
    if (!tokenStorage.hasToken()) {
      return router.createUrlTree(['/auth']);
    }

    return authApi.me().pipe(
      map(user => {
        if (user && user.isSystemAdmin === true) {
          return true;
        }
        return router.createUrlTree(['/universe']);
      }),
      catchError(() => {
        // Safe fallback if backend is offline or request fails
        return of(router.createUrlTree(['/universe']));
      })
    );
  } else {
    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (auth.isAdmin()) {
      return true;
    }

    return router.createUrlTree(['/universe']);
  }
};
