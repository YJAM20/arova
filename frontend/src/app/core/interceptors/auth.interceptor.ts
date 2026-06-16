import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();
  const isPublicAuthEndpoint =
    request.url.includes('/api/auth/login') || request.url.includes('/api/auth/register');

  if (!token || request.headers.has('Authorization') || isPublicAuthEndpoint) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};
