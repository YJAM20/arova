import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export function toFriendlyError(
  error: unknown,
  fallbackMessage = 'The request failed. Please try again.',
  notFoundMessage = 'Item not found.',
  unauthorizedMessage = 'Please login in API Mode first.',
  forbiddenMessage = 'You do not have permission for this action.'
): Observable<never> {
  if (!(error instanceof HttpErrorResponse)) {
    return throwError(() => new Error(fallbackMessage));
  }

  if (error.status === 0) {
    return throwError(
      () =>
        new Error(`Backend is not reachable. Make sure ${environment.apiBaseUrl} is running.`)
    );
  }

  if (error.status === 401) {
    return throwError(() => new Error(unauthorizedMessage));
  }

  if (error.status === 403) {
    return throwError(() => new Error(forbiddenMessage));
  }

  if (error.status === 404) {
    return throwError(() => new Error(notFoundMessage));
  }

  if (error.status === 400) {
    return throwError(
      () => new Error(extractServerMessage(error) ?? fallbackMessage)
    );
  }

  return throwError(
    () => new Error(extractServerMessage(error) ?? `Request failed with status ${error.status}.`)
  );
}

function extractServerMessage(error: HttpErrorResponse): string | null {
  if (typeof error.error === 'string' && error.error.trim()) return error.error;
  if (typeof error.error === 'object' && error.error) {
    if ('message' in error.error) {
      const msg = String(error.error.message).trim();
      if (msg) return msg;
    }
    if ('title' in error.error) {
      const title = String(error.error.title).trim();
      if (title) return title;
    }
  }
  return null;
}
