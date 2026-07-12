import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toFriendlyError as friendlyErrorHelper } from './error-handler.utils';
import { MoodType } from '../../shared/models/mood.model';
import { Song } from '../../shared/models/song.model';
import { AppModeService } from './app-mode.service';
import { MusicService } from './music.service';
import { CreateSongApiRequest, SongApiResponse, SongApiService, UpdateSongApiRequest } from './song-api.service';
import { StorageService } from './storage.service';
import { TokenStorageService } from './token-storage.service';

const VALID_MOODS: MoodType[] = [
  'happy',
  'tired',
  'missing-you',
  'overthinking',
  'silent',
  'need-attention',
  'sad',
  'excited',
  'angry-but-soft',
  'need-reassurance',
];

type SongInput = Omit<Song, 'id' | 'createdAt'>;

@Injectable({ providedIn: 'root' })
export class SongDataService {
  constructor(
    private appMode: AppModeService,
    private localMusic: MusicService,
    private storage: StorageService,
    private songApi: SongApiService,
    private tokenStorage: TokenStorageService
  ) {}

  getSongs(): Observable<Song[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMusic.getSongs());
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.songApi.getSongs().pipe(
      map(songs => songs.map(song => this.fromApi(song))),
      catchError(error => this.toFriendlyError(error))
    );
  }

  getPlaylistByMood(mood: MoodType): Observable<Song[]> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMusic.getPlaylistByMood(mood));
    }

    return this.getSongs().pipe(map(songs => songs.filter(song => song.mood === mood)));
  }

  getRandomSong(): Observable<Song | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMusic.getRandomSong());
    }

    return this.getSongs().pipe(
      map(songs => (songs.length ? songs[Math.floor(Math.random() * songs.length)] : null))
    );
  }

  toggleFavorite(id: string): Observable<Song | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.localMusic.toggleFavorite(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.songApi.favoriteSong(id).pipe(
      switchMap(() => this.getSongs()),
      map(songs => songs.find(song => song.id === id) ?? null),
      catchError(error => this.toFriendlyError(error))
    );
  }

  addSong(input: SongInput): Observable<Song> {
    if (this.appMode.isLocalMode()) {
      return of(this.addLocalSong(input));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.songApi.createSong(this.toCreateApi(input)).pipe(
      map(song => this.fromApi(song)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  updateSong(id: string, changes: Partial<Song>): Observable<Song | null> {
    if (this.appMode.isLocalMode()) {
      return of(this.updateLocalSong(id, changes));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.songApi.updateSong(id, this.toUpdateApi(changes)).pipe(
      map(song => this.fromApi(song)),
      catchError(error => this.toFriendlyError(error))
    );
  }

  deleteSong(id: string): Observable<boolean> {
    if (this.appMode.isLocalMode()) {
      return of(this.deleteLocalSong(id));
    }

    const readyError = this.apiReadinessError();
    if (readyError) return throwError(() => new Error(readyError));

    return this.songApi.deleteSong(id).pipe(
      map(() => true),
      catchError(error => this.toFriendlyError(error))
    );
  }

  isApiMode(): boolean {
    return this.appMode.isApiMode();
  }

  private addLocalSong(input: SongInput): Song {
    const data = this.storage.loadFullAppData();
    const song: Song = {
      ...input,
      id: `song-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.songs.unshift(song);
    this.storage.saveFullAppData(data);
    return song;
  }

  private updateLocalSong(id: string, changes: Partial<Song>): Song | null {
    const data = this.storage.loadFullAppData();
    let updated: Song | null = null;
    data.songs = data.songs.map(song => {
      if (song.id !== id) return song;
      updated = { ...song, ...changes, id: song.id, createdAt: song.createdAt };
      return updated;
    });
    if (!updated) return null;
    this.storage.saveFullAppData(data);
    return updated;
  }

  private deleteLocalSong(id: string): boolean {
    const data = this.storage.loadFullAppData();
    const before = data.songs.length;
    data.songs = data.songs.filter(song => song.id !== id);
    if (data.songs.length === before) return false;
    this.storage.saveFullAppData(data);
    return true;
  }

  private toCreateApi(input: SongInput): CreateSongApiRequest {
    return {
      title: input.title,
      artist: input.artist ?? null,
      audioUrl: input.audioUrl ?? null,
      coverUrl: input.coverUrl ?? null,
      mood: input.mood ?? null,
      memoryId: input.memoryId ?? null,
      isFavorite: input.isFavorite,
      sourceName: input.sourceName ?? null,
      sourceUrl: input.sourceUrl ?? null,
      license: input.license ?? null,
      attribution: input.attribution ?? null,
    };
  }

  private toUpdateApi(changes: Partial<Song>): UpdateSongApiRequest {
    return {
      title: changes.title,
      artist: changes.artist ?? null,
      audioUrl: changes.audioUrl ?? null,
      coverUrl: changes.coverUrl ?? null,
      mood: changes.mood ?? null,
      memoryId: changes.memoryId ?? null,
      isFavorite: changes.isFavorite,
      sourceName: changes.sourceName ?? null,
      sourceUrl: changes.sourceUrl ?? null,
      license: changes.license ?? null,
      attribution: changes.attribution ?? null,
    };
  }

  private fromApi(song: SongApiResponse): Song {
    const mood = song.mood && VALID_MOODS.includes(song.mood as MoodType)
      ? (song.mood as MoodType)
      : undefined;

    return {
      id: song.id,
      title: song.title,
      artist: song.artist ?? undefined,
      audioUrl: song.audioUrl ?? undefined,
      coverUrl: song.coverUrl ?? undefined,
      mood,
      memoryId: song.memoryId ?? undefined,
      isFavorite: !!song.isFavorite,
      sourceName: song.sourceName ?? undefined,
      sourceUrl: song.sourceUrl ?? undefined,
      license: song.license ?? undefined,
      attribution: song.attribution ?? undefined,
      createdAt: song.createdAt ?? new Date().toISOString(),
    };
  }

  private apiReadinessError(): string | null {
    return this.tokenStorage.hasToken() ? null : 'Please login in API Mode first.';
  }

  private toFriendlyError(error: unknown): Observable<never> {
    return friendlyErrorHelper(
      error,
      'The song request failed. Please try again.',
      'Item not found.'
    );
  }
}
