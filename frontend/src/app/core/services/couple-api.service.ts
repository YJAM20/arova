import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CoupleResponse {
  id: string;
  name: string;
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface CoupleMemberResponse {
  id: string;
  coupleId: string;
  userId: string;
  displayName?: string;
  username?: string;
  role: string;
  joinedAt?: string;
}

export interface PairingCodeResponse {
  code: string;
  expiresAt?: string;
}

export interface CreateCoupleRequest {
  name: string;
}

export interface JoinCoupleRequest {
  code: string;
}

@Injectable({ providedIn: 'root' })
export class CoupleApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  createCouple(request: CreateCoupleRequest): Observable<CoupleResponse> {
    return this.http.post<CoupleResponse>(`${this.apiBaseUrl}/api/couples`, request);
  }

  getMyCouple(): Observable<CoupleResponse> {
    return this.http.get<CoupleResponse>(`${this.apiBaseUrl}/api/couples/my`);
  }

  generatePairingCode(): Observable<PairingCodeResponse> {
    return this.http.post<PairingCodeResponse>(
      `${this.apiBaseUrl}/api/couples/pairing-code`,
      {}
    );
  }

  joinCouple(request: JoinCoupleRequest): Observable<CoupleResponse> {
    return this.http.post<CoupleResponse>(`${this.apiBaseUrl}/api/couples/join`, request);
  }

  getMembers(): Observable<CoupleMemberResponse[]> {
    return this.http.get<CoupleMemberResponse[]>(`${this.apiBaseUrl}/api/couples/members`);
  }
}
