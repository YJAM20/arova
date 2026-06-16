import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { MoodService } from '../../../../core/services/mood.service';
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

  moodOptions: MoodOption[] = [
    { value: 'happy', label: 'Happy', icon: '😊', hint: 'Light and steady' },
    { value: 'silent', label: 'Calm', icon: '😌', hint: 'Quiet but present' },
    { value: 'tired', label: 'Tired', icon: '🥱', hint: 'Needs rest' },
    { value: 'missing-you', label: 'Missing you', icon: '🥺', hint: 'Close from far away' },
    { value: 'need-reassurance', label: 'Grateful', icon: '🥰', hint: 'Chosen and warm' },
    { value: 'overthinking', label: 'Anxious', icon: '😰', hint: 'Needs reassuring thoughts' },
    { value: 'excited', label: 'Excited', icon: '🤩', hint: 'Full of sparks' },
    { value: 'sad', label: 'Low energy', icon: '😴', hint: 'Quietly recharging' },
    { value: 'need-attention', label: 'Loved', icon: '❤️', hint: 'Tender and close' },
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

  constructor(
    private moodService: MoodService,
    private auth: AuthService,
    private storage: StorageService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.users = this.storage.getUsers();
    this.refresh();
  }

  selectMood(mood: MoodType): void {
    this.selectedMood = mood;
    this.savedMessage = '';
  }

  saveMood(): void {
    const entry = this.moodService.setTodayMood(this.selectedMood, this.note);
    this.savedMessage = this.moodService.getMoodMessage(entry.mood);
    this.refresh();
  }

  respond(entry: MoodEntry): void {
    const response = this.responseDrafts[entry.id] ?? '';
    this.moodService.respondToMood(entry.id, response);
    this.responseDrafts[entry.id] = '';
    this.refresh();
  }

  getMoodLabel(mood: MoodType): string {
    return this.moodOptions.find(option => option.value === mood)?.label ?? mood;
  }

  getMoodEmoji(mood: MoodType): string {
    return this.moodOptions.find(option => option.value === mood)?.icon ?? '😊';
  }

  getMoodMessage(mood: MoodType): string {
    return this.moodService.getMoodMessage(mood);
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

  private refresh(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.todayMood = this.moodService.getTodayMoodForCurrentUser();
    this.history = this.moodService.getMoodHistory();
    this.otherTodayMoods = this.history.filter(
      entry => entry.date === today && entry.userId !== this.currentUser?.id
    );

    if (this.todayMood) {
      this.selectedMood = this.todayMood.mood;
      this.note = this.todayMood.note ?? '';
      if (!this.savedMessage) {
        this.savedMessage = this.moodService.getMoodMessage(this.todayMood.mood);
      }
    }
  }
}
