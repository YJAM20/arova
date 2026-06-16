import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SongApiResponse {
  id: string;
  title: string;
  artist?: string | null;
  audioUrl?: string | null;
  coverUrl?: string | null;
  mood?: string | null;
  memoryId?: string | null;
  isFavorite?: boolean;
  sourceName?: string | null;
  sourceUrl?: string | null;
  license?: string | null;
  attribution?: string | null;
  createdAt?: string;
}

export interface CreateSongApiRequest {
  title: string;
  artist?: string | null;
  audioUrl?: string | null;
  coverUrl?: string | null;
  mood?: string | null;
  memoryId?: string | null;
  isFavorite?: boolean;
  sourceName?: string | null;
  sourceUrl?: string | null;
  license?: string | null;
  attribution?: string | null;
}

export type UpdateSongApiRequest = Partial<CreateSongApiRequest>;

@Injectable({ providedIn: 'root' })
export class SongApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getSongs(): Observable<SongApiResponse[]> {
    return this.http.get<SongApiResponse[]>(`${this.apiBaseUrl}/api/songs`);
  }

  createSong(request: CreateSongApiRequest): Observable<SongApiResponse> {
    return this.http.post<SongApiResponse>(`${this.apiBaseUrl}/api/songs`, request);
  }

  updateSong(id: string, request: UpdateSongApiRequest): Observable<SongApiResponse> {
    return this.http.put<SongApiResponse>(`${this.apiBaseUrl}/api/songs/${id}`, request);
  }

  deleteSong(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/songs/${id}`);
  }

  favoriteSong(id: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/api/songs/${id}/favorite`, {});
  }
}
