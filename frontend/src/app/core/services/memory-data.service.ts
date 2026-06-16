import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Memory, MemoryCategory } from '../../shared/models/memory.model';
import { AppModeService } from './app-mode.service';
import {
  CreateMemoryApiRequest,
  MemoryApiResponse,
  MemoryApiService,
  UpdateMemoryApiRequest,
} from './memory-api.service';
import { MemoryInput, MemoryService } from './memory.service';
import { TokenStorageService } from './token-storage.service';

const VALID_CATEGORIES: MemoryCategory[] = [
  'firsts',
  'funny',
  'deep',
  'romantic',
  'special-day',
  'random',
];

@Injectable({ providedIn: 'root' })
export class MemoryDataService {
  constructor(
    private appMode: AppModeService,
    private localMemories: MemoryService,
    private memoryApi: MemoryApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getMemories(): Observable<Memory[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMemories.getVisibleMemoriesForCurrentUser());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.memoryApi.getMemories().pipe(
      map(memories => memories.map(memory => this.fromApi(memory))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getAllMemoriesForAdmin(): Observable<Memory[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMemories.getMemories());
    }

    return this.getMemories();
  }

  getMemoryById(id: string): Observable<Memory | null> {
    if (this.appMode.isLocalMode()) {
      const memory = this.localMemories.getMemoryById(id);
      return of(memory && this.localMemories.canViewMemory(memory) ? memory : null);
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.memoryApi.getMemoryById(id).pipe(
      map(memory => this.fromApi(memory)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  addMemory(input: MemoryInput): Observable<Memory> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMemories.addMemory(input));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.memoryApi.createMemory(this.toCreateApi(input)).pipe(
      map(memory => this.fromApi(memory)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateMemory(id: string, changes: Partial<Memory>): Observable<Memory | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMemories.updateMemory(id, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.memoryApi.updateMemory(id, this.toUpdateApi(changes)).pipe(
      map(memory => this.fromApi(memory)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteMemory(id: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMemories.deleteMemory(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.memoryApi.deleteMemory(id).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  toggleFavorite(id: string): Observable<Memory | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMemories.toggleFavorite(id));
    }

    return this.getMemoryById(id).pipe(
      switchMap(memory =>
        memory ? this.updateMemory(id, { isFavorite: !memory.isFavorite }) : of(null)
      )
    );
  }

  canEditMemory(memory: Memory): boolean {
    return this.appMode.isLocalMode() ? this.localMemories.canEditMemory(memory) : true;
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  getApiModeMissingMessage(): string | null {
    return this.apiReadinessError();
  }

  private toCreateApi(input: MemoryInput): CreateMemoryApiRequest {
    return {
      title: input.title,
      description: input.description ?? null,
      privateNote: input.privateNote ?? null,
      memoryDate: input.date ? new Date(input.date).toISOString() : null,
      location: null,
      mediaUrl: input.imageUrl ?? null,
      visibilityLevel: this.toVisibility(input.visibleToPartner),
    };
  }

  private toUpdateApi(changes: Partial<Memory>): UpdateMemoryApiRequest {
    const request: UpdateMemoryApiRequest = {};

    if ('title' in changes) request.title = changes.title;
    if ('description' in changes) request.description = changes.description ?? null;
    if ('privateNote' in changes) request.privateNote = changes.privateNote ?? null;
    if ('date' in changes) request.memoryDate = changes.date ? new Date(changes.date).toISOString() : null;
    if ('imageUrl' in changes) request.mediaUrl = changes.imageUrl ?? null;
    if ('visibleToPartner' in changes && typeof changes.visibleToPartner === 'boolean') {
      request.visibilityLevel = this.toVisibility(changes.visibleToPartner);
    }

    return request;
  }

  private fromApi(memory: MemoryApiResponse): Memory {
    const createdAt = memory.createdAt ?? new Date().toISOString();
    const category: MemoryCategory = 'random';

    return {
      id: memory.id,
      title: memory.title,
      description: memory.description ?? '',
      date: memory.memoryDate ? this.toDateOnly(memory.memoryDate) : new Date().toISOString().slice(0, 10),
      imageUrl: memory.mediaUrl ?? undefined,
      category,
      mood: undefined,
      privateNote: memory.privateNote ?? undefined,
      visibleToPartner: this.fromVisibility(memory.visibilityLevel),
      isFavorite: false,
      createdBy: memory.createdByUserId,
      createdAt,
      updatedAt: memory.updatedAt ?? createdAt,
    };
  }

  private toVisibility(visibleToPartner: boolean): number {
    return visibleToPartner ? 1 : 2;
  }

  private fromVisibility(visibility: number | string | undefined): boolean {
    if (typeof visibility === 'undefined') return true;
    if (typeof visibility === 'number') return visibility === 1 || visibility === 3;
    const normalized = visibility?.trim().toLowerCase();
    return normalized === 'shared' || normalized === 'partneronly' || normalized === 'partner-only';
  }

  private toDateOnly(value: string): string {
    return value.includes('T') ? value.slice(0, 10) : value;
  }

  private apiReadinessError(): string | null {
    if (!this.tokenStorage.hasToken()) {
      return 'API Mode needs login and a couple space first.';
    }

    return null;
  }

  private toFriendlyError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error('The memory request failed. Please try again.'));
    }

    if (error.status === 0) {
      return throwError(
        () =>
          new Error(
            `Backend is not reachable. Make sure ${environment.apiBaseUrl} is running.`
          )
      );
    }

    if (error.status === 401) {
      return throwError(() => new Error('Please login in API Mode first.'));
    }

    if (error.status === 403) {
      return throwError(() => new Error('You do not have permission for this memory.'));
    }

    if (error.status === 404) {
      return throwError(() => new Error('Memory not found.'));
    }

    if (error.status === 400) {
      return throwError(
        () =>
          new Error(
            this.extractServerMessage(error) ??
              'The backend rejected this memory. Check the required fields.'
          )
      );
    }

    return throwError(
      () =>
        new Error(
          this.extractServerMessage(error) ?? `Memory request failed with status ${error.status}.`
        )
    );
  }

  private extractServerMessage(error: HttpErrorResponse): string | null {
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (typeof error.error === 'object' && error.error) {
      if ('message' in error.error) return String(error.error.message);
      if ('title' in error.error) return String(error.error.title);
    }

    return null;
  }
}
