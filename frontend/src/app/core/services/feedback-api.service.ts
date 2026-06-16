import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FeedbackRequest {
  name?: string;
  email?: string;
  message: string;
  context?: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  sendFeedback(request: FeedbackRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/feedback`, request);
  }
}
