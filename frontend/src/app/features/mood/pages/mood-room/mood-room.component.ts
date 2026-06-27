import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { MoodDataService } from '../../../../core/services/mood-data.service';
import { StorageService } from '../../../../core/services/storage.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MoodEntry, MoodType } from '../../../../shared/models/mood.model';
import { AppUser } from '../../../../shared/models/user.model';

interface MoodOption {
  value: MoodType;
  label: string;
  hint: string;
  icon: string;
}

@Component({
  selector: 'app-mood-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-room.component.html',
  styleUrls: ['./mood-room.component.scss'],
})
export class MoodRoomComponent implements OnInit {
  currentUser: AppUser | null = null;
  users: AppUser[] = [];
  selectedMood: MoodType = 'happy';
  note = '';
  savedMessage = '';
  todayMood: MoodEntry | null = null;
  history: MoodEntry[] = [];
  otherTodayMoods: MoodEntry[] = [];
  responseDrafts: Record<string, string> = {};

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  saveErrorMessage = '';

  moodOptions: MoodOption[] = [
    { value: 'happy', label: 'Happy', icon: '😊', hint: 'Light and steady' },
    { value: 'silent', label: 'Calm', icon: '😌', hint: 'Quiet but present' },
    { value: 'missing-you', label: 'Missing you', icon: '🥺', hint: 'Close from far away' },
    { value: 'need-reassurance', label: 'Need reassurance', icon: '🩹', hint: 'You are not a burden' },
    { value: 'tired', label: 'Tired', icon: '🥱', hint: 'Needs rest' },
    { value: 'excited', label: 'Excited', icon: '🤩', hint: 'Full of sparks' },
    { value: 'overthinking', label: 'Overthinking', icon: '😰', hint: 'Needs reassuring thoughts' },
    { value: 'need-attention', label: 'Grateful', icon: '🥰', hint: 'Chosen and warm' },
    { value: 'sad', label: 'Low energy', icon: '😴', hint: 'Quietly recharging' },
    { value: 'angry-but-soft', label: 'Distant', icon: '🌫️', hint: 'Processing soft feelings' },
  ];

  dailyPrompts: string[] = [
    'What color is your energy today?',
    'What is one small thing that shaped your mood today?',
    'How has your day been affecting your heart?',
    'What is a feeling you would like your partner to hold space for today?',
    'Are you feeling like sharing, or do you just need a quiet check-in?',
    'What is the temperature of your emotional space right now?',
    'If your mood today was a weather pattern, what would it be?',
  ];

  get dailyPrompt(): string {
    const day = new Date().getDate();
    return this.dailyPrompts[day % this.dailyPrompts.length];
  }

  get isLocalMode(): boolean {
    return !this.moodDataService.isApiMode();
  }

  constructor(
    private moodDataService: MoodDataService,
    private auth: AuthService,
    private storage: StorageService,
    private translation: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.users = this.storage.getUsers();
    this.loadMoods();
  }

  selectMood(mood: MoodType): void {
    this.selectedMood = mood;
    this.savedMessage = '';
    this.saveErrorMessage = '';
  }

  loadMoods(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      history: this.moodDataService.getMoodHistory(),
      todayMood: this.moodDataService.getTodayMoodForCurrentUser(),
    }).subscribe({
      next: ({ history, todayMood }) => {
        this.history = history;
        this.todayMood = todayMood;
        this.isLoading = false;

        const todayStr = new Date().toISOString().slice(0, 10);
        this.otherTodayMoods = this.history.filter(
          entry => entry.date === todayStr && entry.userId !== this.currentUser?.id
        );

        if (this.todayMood) {
          this.selectedMood = this.todayMood.mood;
          this.note = this.todayMood.note ?? '';
          if (!this.savedMessage) {
            this.savedMessage = this.moodDataService.getMoodMessage(this.todayMood.mood);
          }
        }
        this.cdr.detectChanges();
      },
      error: error => {
        this.history = [];
        this.todayMood = null;
        this.otherTodayMoods = [];
        this.errorMessage = error instanceof Error ? error.message : 'We couldn’t load the mood room right now.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  saveMood(): void {
    this.isSaving = true;
    this.saveErrorMessage = '';
    this.savedMessage = '';

    this.moodDataService.setTodayMood(this.selectedMood, this.note).subscribe({
      next: entry => {
        this.todayMood = entry;
        this.savedMessage = this.moodDataService.getMoodMessage(entry.mood);
        this.isSaving = false;
        this.loadMoods();
      },
      error: error => {
        this.saveErrorMessage = error instanceof Error ? error.message : 'We couldn’t save your mood right now.';
        this.isSaving = false;
      },
    });
  }

  respond(entry: MoodEntry): void {
    const response = this.responseDrafts[entry.id] ?? '';
    if (!response.trim()) return;

    this.moodDataService.respondToMood(entry.id, response).subscribe({
      next: () => {
        this.responseDrafts[entry.id] = '';
        this.loadMoods();
      },
      error: error => {
        this.errorMessage = error instanceof Error ? error.message : 'Could not send response.';
      },
    });
  }

  getMoodLabel(mood: MoodType): string {
    return this.moodOptions.find(option => option.value === mood)?.label ?? mood;
  }

  getMoodEmoji(mood: MoodType): string {
    return this.moodOptions.find(option => option.value === mood)?.icon ?? '😊';
  }

  getMoodMessage(mood: MoodType): string {
    return this.moodDataService.getMoodMessage(mood);
  }

  getUserName(userId: string): string {
    return this.users.find(user => user.id === userId)?.displayName ?? 'Partner';
  }

  formatDate(value: string): string {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  /* Summary helpers */
  getMyTotalCheckIns(): number {
    return this.history.filter(e => e.userId === this.currentUser?.id).length;
  }

  getMyLatestNote(): string {
    const latest = this.history.find(e => e.userId === this.currentUser?.id && e.note);
    return latest?.note ?? '';
  }

  getPartnerLatestMood(): MoodEntry | null {
    const todayStr = new Date().toISOString().slice(0, 10);
    // Prefer today's, otherwise most recent in history
    const partnerId = this.users.find(u => u.id !== this.currentUser?.id)?.id;
    if (!partnerId) return null;
    return this.history.find(e => e.userId === partnerId) ?? null;
  }
}
