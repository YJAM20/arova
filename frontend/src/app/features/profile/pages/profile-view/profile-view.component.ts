import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileApiService, ProfileResponse } from '../../../../core/services/profile-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MemoryService } from '../../../../core/services/memory.service';
import { LetterService } from '../../../../core/services/letter.service';
import { ReasonService } from '../../../../core/services/reason.service';
import { RelationshipPointsService, RankInfo, PointsLedgerEntry } from '../../../../core/services/relationship-points.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Memory } from '../../../../shared/models/memory.model';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
})
export class ProfileViewComponent implements OnInit {
  profile: ProfileResponse = {};
  memories: Memory[] = [];
  
  // Count stats
  totalMemories = 0;
  totalLetters = 0;
  totalReasons = 0;
  
  // Relationship duration
  relationshipDurationText = '';
  
  // Relationship points status
  totalPoints = 0;
  streak = 0;
  currentRank!: RankInfo;
  nextRank: RankInfo | null = null;
  progressPercent = 0;
  pointsLedger: PointsLedgerEntry[] = [];
  
  // Editing state
  isEditing = false;
  isSaving = false;
  editedProfile: ProfileResponse = {};
  errorMessage = '';
  successMessage = '';

  // Avatar choices
  avatarPresets = [
    { name: 'Cosmos', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=150&q=80' },
    { name: 'Aurora', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80' },
    { name: 'Nebula', url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=150&q=80' },
    { name: 'Orbit', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=150&q=80' },
    { name: 'Eclipse', url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=150&q=80' },
    { name: 'Warm Soul', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  ];

  // Active memory preview modal
  selectedMemory: Memory | null = null;

  constructor(
    private profileApi: ProfileApiService,
    private auth: AuthService,
    private memoryService: MemoryService,
    private letterService: LetterService,
    private reasonService: ReasonService,
    private pointsService: RelationshipPointsService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadStatsAndMemories();
  }

  loadProfile(): void {
    this.profileApi.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.editedProfile = { ...profile };
      },
      error: () => {
        this.errorMessage = 'Could not load profile settings.';
      }
    });
  }

  loadStatsAndMemories(): void {
    // Get visible memories
    this.memories = this.memoryService.getVisibleMemoriesForCurrentUser();
    this.totalMemories = this.memories.length;

    // Get letter and reason counts
    this.totalLetters = this.letterService.getVisibleLettersForCurrentUser().length;
    this.totalReasons = this.reasonService.getVisibleReasonsForCurrentUser().length;

    // Load points details
    this.totalPoints = this.pointsService.getTotalPoints();
    this.streak = this.pointsService.getStreak();
    this.currentRank = this.pointsService.getCurrentRank();
    this.nextRank = this.pointsService.getNextRank();
    this.progressPercent = this.pointsService.getProgressPercent();
    this.pointsLedger = this.pointsService.getLedger();

    // Calculate relationship length since anniversary date
    const couple = this.storageService.getCoupleProfile();
    if (couple && couple.importantDate) {
      const anniversary = new Date(couple.importantDate);
      const diff = Date.now() - anniversary.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      this.relationshipDurationText = days > 0 ? `${days} Days Together` : 'Joined Arova Space Today';
    } else {
      this.relationshipDurationText = 'Sanctuary Citizens';
    }
  }

  enableEdit(): void {
    this.editedProfile = { ...this.profile };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  selectPresetAvatar(url: string): void {
    this.editedProfile.avatarUrl = url;
  }

  saveProfile(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.profileApi.updateProfile(this.editedProfile).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.isEditing = false;
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        // Sync with local stats again in case display name/avatar changed
        this.loadStatsAndMemories();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save profile details.';
        this.isSaving = false;
      }
    });
  }

  openMemoryPreview(memory: Memory): void {
    this.selectedMemory = memory;
  }

  closeMemoryPreview(): void {
    this.selectedMemory = null;
  }

  getMemoryPlaceholderGradient(memory: Memory): string {
    const idHash = Array.from(memory.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const gradients = [
      'linear-gradient(135deg, #1f1a3a 0%, #3d2b56 100%)',
      'linear-gradient(135deg, #2b1f3d 0%, #562b45 100%)',
      'linear-gradient(135deg, #1a293a 0%, #2b4956 100%)',
      'linear-gradient(135deg, #1f3a2b 0%, #2b563d 100%)',
      'linear-gradient(135deg, #3a2f1f 0%, #56402b 100%)',
    ];
    return gradients[idHash % gradients.length];
  }

  getMemoryCategoryIcon(category: string): string {
    switch (category) {
      case 'firsts': return '🌱';
      case 'funny': return '😂';
      case 'deep': return '💭';
      case 'romantic': return '💖';
      case 'special-day': return '📅';
      default: return '✨';
    }
  }
}
