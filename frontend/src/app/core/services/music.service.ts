import { Injectable } from '@angular/core';
import { MoodType } from '../../shared/models/mood.model';
import { Song } from '../../shared/models/song.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class MusicService {
  constructor(private storage: StorageService) {}

  getSongs(): Song[] {
    return this.storage.getSongs();
  }

  getPlaylistByMood(mood: MoodType): Song[] {
    return this.getSongs().filter(song => song.mood === mood);
  }

  toggleFavorite(id: string): Song | null {
    return this.storage.toggleSongFavorite(id);
  }

  getRandomSong(): Song | null {
    const songs = this.getSongs();
    if (songs.length === 0) return null;
    return songs[Math.floor(Math.random() * songs.length)];
  }
}
