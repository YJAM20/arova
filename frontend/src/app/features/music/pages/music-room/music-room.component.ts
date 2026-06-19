import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SongDataService } from '../../../../core/services/song-data.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MoodType } from '../../../../shared/models/mood.model';
import { Song } from '../../../../shared/models/song.model';

const MOOD_LABELS: Record<MoodType, string> = {
  happy: 'Happy',
  tired: 'Tired',
  'missing-you': 'Missing you',
  overthinking: 'Overthinking',
  silent: 'Calm',
  'need-attention': 'Loved',
  sad: 'Low energy',
  excited: 'Excited',
  'angry-but-soft': 'Distant',
  'need-reassurance': 'Grateful',
};

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

@Component({
  selector: 'app-music-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    ...VALID_MOODS.map(key => ({ key, label: MOOD_LABELS[key] })),
  ];

  // State flags
  isLoading = false;
  isSaving = false;
  isDeleting: string | null = null;
  errorMessage = '';
  saveError = '';
  saveSuccess = false;

  // Add song form
  showAddForm = false;
  formTitle = '';
  formArtist = '';
  formMood: MoodType | '' = '';
  formSourceName = '';
  formSourceUrl = '';
  formLicense = '';
  formAttribution = '';

  validMoods = VALID_MOODS;

  constructor(
    private songDataService: SongDataService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadSongs();
  }

  loadSongs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.songDataService.getSongs().subscribe({
      next: songs => {
        this.songs = songs;
        this.applyFilter();
        this.selectedSong = this.filteredSongs[0] ?? null;
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = err instanceof Error ? err.message : 'Could not load songs right now.';
        this.songs = [];
        this.filteredSongs = [];
        this.isLoading = false;
      },
    });
  }

  selectSong(song: Song): void {
    this.selectedSong = song;
  }

  setMoodFilter(mood: MoodType | 'all'): void {
    this.activeMood = mood;
    this.applyFilter();
  }

  pickRandomSong(): void {
    this.songDataService.getRandomSong().subscribe({
      next: song => {
        this.selectedSong = song;
      },
    });
  }

  toggleFavorite(song: Song, event: Event): void {
    event.stopPropagation();
    const selectedId = this.selectedSong?.id;

    this.songDataService.toggleFavorite(song.id).subscribe({
      next: () => {
        this.loadSongsQuietly(selectedId);
      },
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addSong(): void {
    if (!this.formTitle.trim()) return;
    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = false;

    this.songDataService
      .addSong({
        title: this.formTitle.trim(),
        artist: this.formArtist.trim() || undefined,
        mood: (this.formMood as MoodType) || undefined,
        sourceName: this.formSourceName.trim() || undefined,
        sourceUrl: this.formSourceUrl.trim() || undefined,
        license: this.formLicense.trim() || undefined,
        attribution: this.formAttribution.trim() || undefined,
        isFavorite: false,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.saveSuccess = true;
          this.resetForm();
          this.showAddForm = false;
          this.loadSongs();
          setTimeout(() => (this.saveSuccess = false), 3500);
        },
        error: err => {
          this.saveError = err instanceof Error ? err.message : 'Could not add song right now.';
          this.isSaving = false;
        },
      });
  }

  deleteSong(id: string, event: Event): void {
    event.stopPropagation();
    this.isDeleting = id;

    this.songDataService.deleteSong(id).subscribe({
      next: () => {
        if (this.selectedSong?.id === id) {
          this.selectedSong = null;
        }
        this.isDeleting = null;
        this.loadSongsQuietly();
      },
      error: () => {
        this.isDeleting = null;
      },
    });
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

  isApiMode(): boolean {
    return this.songDataService.isApiMode();
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  // Summary helpers
  getTotalSongs(): number {
    return this.songs.length;
  }

  getFavoritesCount(): number {
    return this.songs.filter(s => s.isFavorite).length;
  }

  getMostUsedMoodLabel(): string {
    if (this.songs.length === 0) return '—';
    const counts: Partial<Record<MoodType, number>> = {};
    for (const song of this.songs) {
      if (song.mood) {
        counts[song.mood] = (counts[song.mood] ?? 0) + 1;
      }
    }
    const entries = Object.entries(counts) as [MoodType, number][];
    if (entries.length === 0) return '—';
    entries.sort((a, b) => b[1] - a[1]);
    return MOOD_LABELS[entries[0][0]] ?? '—';
  }

  private loadSongsQuietly(preserveSelectedId?: string): void {
    this.songDataService.getSongs().subscribe({
      next: songs => {
        this.songs = songs;
        this.applyFilter();
        if (preserveSelectedId) {
          this.selectedSong =
            this.songs.find(s => s.id === preserveSelectedId) ?? this.filteredSongs[0] ?? null;
        }
      },
    });
  }

  private applyFilter(): void {
    this.filteredSongs =
      this.activeMood === 'all'
        ? this.songs
        : this.songs.filter(song => song.mood === this.activeMood);
  }

  private resetForm(): void {
    this.formTitle = '';
    this.formArtist = '';
    this.formMood = '';
    this.formSourceName = '';
    this.formSourceUrl = '';
    this.formLicense = '';
    this.formAttribution = '';
    this.saveError = '';
  }
}
