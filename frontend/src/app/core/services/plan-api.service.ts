import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlanResponse {
  id?: string;
  name: string;
  tier?: string;
  description?: string;
  features?: string[];
}

export interface GiftedUpgradeRequest {
  planType: number;
}

@Injectable({ providedIn: 'root' })
export class PlanApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getPlans(): Observable<PlanResponse[]> {
    return this.http.get<PlanResponse[]>(`${this.apiBaseUrl}/api/plans`);
  }

  giftedUpgrade(request: GiftedUpgradeRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/plans/gifted-upgrade`, request);
  }
}
