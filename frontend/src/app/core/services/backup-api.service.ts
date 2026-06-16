import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BackupApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  exportBackup(): Observable<unknown> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/api/backup/export`);
  }

  importBackup(data: unknown): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/backup/import`, data);
  }
}
