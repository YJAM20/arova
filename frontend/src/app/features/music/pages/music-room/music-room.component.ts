import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../../../core/services/music.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MoodType } from '../../../../shared/models/mood.model';
import { Song } from '../../../../shared/models/song.model';

const MOOD_LABELS: Record<MoodType, string> = {
  happy: 'Happy',
  tired: 'Tired',
  'missing-you': 'Missing you',
  overthinking: 'Overthinking',
  silent: 'Silent',
  'need-attention': 'Need attention',
  sad: 'Sad',
  excited: 'Excited',
  'angry-but-soft': 'Angry but soft',
  'need-reassurance': 'Need reassurance',
};

@Component({
  selector: 'app-music-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-room.component.html',
  styleUrls: ['./music-room.component.scss'],
})
export class MusicRoomComponent implements OnInit {
  songs: Song[] = [];
  filteredSongs: Song[] = [];
  selectedSong: Song | null = null;
  activeMood: MoodType | 'all' = 'all';
  moodFilters: Array<{ key: MoodType | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    ...Object.entries(MOOD_LABELS).map(([key, label]) => ({
      key: key as MoodType,
      label,
    })),
  ];

  constructor(private musicService: MusicService, private translation: TranslationService) {}

  ngOnInit(): void {
    this.refresh();
    this.selectedSong = this.songs[0] ?? null;
  }

  selectSong(song: Song): void {
    this.selectedSong = song;
  }

  setMoodFilter(mood: MoodType | 'all'): void {
    this.activeMood = mood;
    this.applyFilter();
  }

  pickRandomSong(): void {
    this.selectedSong = this.musicService.getRandomSong();
  }

  toggleFavorite(song: Song, event: Event): void {
    event.stopPropagation();
    this.musicService.toggleFavorite(song.id);
    const selectedId = this.selectedSong?.id;
    this.refresh();
    this.selectedSong = this.songs.find(item => item.id === selectedId) ?? this.selectedSong;
  }

  getMoodLabel(mood?: MoodType): string {
    return mood ? MOOD_LABELS[mood] : '';
  }

  hasPlayablePreview(song: Song | null): boolean {
    return !!song?.audioUrl && !song.audioUrl.startsWith('assets/audio/');
  }

  getSourceLabel(song: Song): string {
    return song.sourceName ?? 'Local placeholder';
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  private refresh(): void {
    this.songs = this.musicService.getSongs();
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredSongs =
      this.activeMood === 'all'
        ? this.songs
        : this.songs.filter(song => song.mood === this.activeMood);
  }
}
