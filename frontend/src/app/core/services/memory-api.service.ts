import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MemoryApiResponse {
  id: string;
  title: string;
  description?: string | null;
  privateNote?: string | null;
  isPrivateNoteHidden?: boolean;
  memoryDate?: string | null;
  location?: string | null;
  mediaUrl?: string | null;
  visibilityLevel?: number;
  createdByUserId: string;
  createdByDisplayName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMemoryApiRequest {
  title: string;
  description?: string | null;
  privateNote?: string | null;
  memoryDate?: string | null;
  location?: string | null;
  mediaUrl?: string | null;
  visibilityLevel: number;
}

export interface UpdateMemoryApiRequest {
  title?: string;
  description?: string | null;
  privateNote?: string | null;
  memoryDate?: string | null;
  location?: string | null;
  mediaUrl?: string | null;
  visibilityLevel?: number;
}

@Injectable({ providedIn: 'root' })
export class MemoryApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getMemories(): Observable<MemoryApiResponse[]> {
    return this.http.get<MemoryApiResponse[]>(`${this.apiBaseUrl}/api/memories`);
  }

  getMemoryById(id: string): Observable<MemoryApiResponse> {
    return this.http.get<MemoryApiResponse>(`${this.apiBaseUrl}/api/memories/${id}`);
  }

  createMemory(request: CreateMemoryApiRequest): Observable<MemoryApiResponse> {
    return this.http.post<MemoryApiResponse>(`${this.apiBaseUrl}/api/memories`, request);
  }

  updateMemory(id: string, request: UpdateMemoryApiRequest): Observable<MemoryApiResponse> {
    return this.http.put<MemoryApiResponse>(`${this.apiBaseUrl}/api/memories/${id}`, request);
  }

  deleteMemory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/memories/${id}`);
  }
}
