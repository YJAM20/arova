import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppSettings } from '../../shared/models/app-settings.model';

export type SettingsApiResponse = Partial<AppSettings>;
export type UpdateSettingsApiRequest = Partial<AppSettings>;

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SettingsApiResponse> {
    return this.http.get<SettingsApiResponse>(`${this.apiBaseUrl}/api/settings`);
  }

  updateSettings(request: UpdateSettingsApiRequest): Observable<SettingsApiResponse> {
    return this.http.put<SettingsApiResponse>(`${this.apiBaseUrl}/api/settings`, request);
  }
}
