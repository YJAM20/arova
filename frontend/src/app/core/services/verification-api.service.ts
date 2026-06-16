import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RequestVerificationCodeRequest {
  channel: 'email' | 'phone';
  destination: string;
  purpose: string;
}

export interface VerifyCodeRequest {
  channel: 'email' | 'phone';
  destination: string;
  code: string;
  purpose: string;
}

@Injectable({ providedIn: 'root' })
export class VerificationApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  requestCode(request: RequestVerificationCodeRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/auth/request-verification-code`, request);
  }

  verifyCode(request: VerifyCodeRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/auth/verify-code`, request);
  }
}
