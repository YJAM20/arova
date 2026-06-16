import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LetterApiResponse {
  id: string;
  title: string;
  body?: string | null;
  isBodyHidden?: boolean;
  visibilityLevel?: number;
  openOnUtc?: string | null;
  readAt?: string | null;
  isLocked: boolean;
  hasPasscode?: boolean;
  createdByUserId: string;
  createdByDisplayName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLetterApiRequest {
  title: string;
  body: string;
  visibilityLevel: number;
  openOnUtc?: string | null;
  isLocked: boolean;
  passcode?: string | null;
}

export interface UpdateLetterApiRequest {
  title?: string;
  body?: string;
  visibilityLevel?: number;
  openOnUtc?: string | null;
  isLocked?: boolean;
  passcode?: string | null;
}

@Injectable({ providedIn: 'root' })
export class LetterApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getLetters(): Observable<LetterApiResponse[]> {
    return this.http.get<LetterApiResponse[]>(`${this.apiBaseUrl}/api/letters`);
  }

  getLetterById(id: string): Observable<LetterApiResponse> {
    return this.http.get<LetterApiResponse>(`${this.apiBaseUrl}/api/letters/${id}`);
  }

  createLetter(request: CreateLetterApiRequest): Observable<LetterApiResponse> {
    return this.http.post<LetterApiResponse>(`${this.apiBaseUrl}/api/letters`, request);
  }

  updateLetter(id: string, request: UpdateLetterApiRequest): Observable<LetterApiResponse> {
    return this.http.put<LetterApiResponse>(`${this.apiBaseUrl}/api/letters/${id}`, request);
  }

  deleteLetter(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/letters/${id}`);
  }
}
