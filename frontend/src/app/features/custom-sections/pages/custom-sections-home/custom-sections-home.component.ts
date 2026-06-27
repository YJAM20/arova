import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomSectionsService, CustomSection, PricingTier } from '../../../../core/services/custom-sections.service';
import { GamificationService } from '../../../../core/services/gamification.service';

@Component({
  selector: 'app-custom-sections-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './custom-sections-home.component.html',
  styleUrls: ['./custom-sections-home.component.scss'],
})
export class CustomSectionsHomeComponent implements OnInit {
  sections: CustomSection[] = [];
  currentTier: PricingTier = 'free';
  tierLimit = 1;
  activeSection: CustomSection | null = null;

  // New Section Form
  showAddModal = false;
  newTitle = '';
  newIcon = '📁';
  newDescription = '';
  
  // Edit Section Form
  showEditModal = false;
  editId = '';
  editTitle = '';
  editIcon = '📁';
  editDescription = '';

  // New Item Input
  newItemContent = '';

  errorMessage = '';
  successMessage = '';

  // Emoji options for presets
  emojiPresets = ['✈️', '🎭', '🎯', '🗺️', '🍽️', '🍿', '📝', '🔒', '💖', '🎵', '🎒', '💬', '💭', '🌟', '🍷', '🎨'];

  constructor(
    private sectionsService: CustomSectionsService,
    private gamification: GamificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.sections = this.sectionsService.getSections();
    this.currentTier = this.sectionsService.getTier();
    this.tierLimit = this.sectionsService.getTierLimit(this.currentTier);

    // Auto select first section if active is null or no longer exists
    if (this.sections.length > 0) {
      if (!this.activeSection || !this.sections.some(s => s.id === this.activeSection!.id)) {
        this.activeSection = this.sections[0];
      } else {
        // Refresh active section data
        this.activeSection = this.sections.find(s => s.id === this.activeSection!.id) || null;
      }
    } else {
      this.activeSection = null;
    }
  }

  changeTier(tier: PricingTier): void {
    this.sectionsService.setTier(tier);
    this.loadData();
    this.successMessage = `Simulated upgrade to ${tier.toUpperCase()} tier successfully!`;
    this.errorMessage = '';
  }

  selectSection(section: CustomSection): void {
    this.activeSection = section;
  }

  openAddModal(): void {
    if (!this.sectionsService.canAddSection()) {
      this.errorMessage = `Limit reached. Your '${this.currentTier.toUpperCase()}' plan allows up to ${this.tierLimit} section(s). Upgrade your tier above to add more.`;
      return;
    }
    this.errorMessage = '';
    this.newTitle = '';
    this.newIcon = '📁';
    this.newDescription = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  selectEmoji(emoji: string, isEdit = false): void {
    if (isEdit) {
      this.editIcon = emoji;
    } else {
      this.newIcon = emoji;
    }
  }

  createSection(): void {
    this.errorMessage = '';
    if (!this.newTitle.trim()) {
      this.errorMessage = 'Please enter a title for the section.';
      return;
    }

    const result = this.sectionsService.addSection(this.newTitle.trim(), this.newIcon, this.newDescription.trim());
    if (result.success) {
      this.showAddModal = false;
      this.loadData();
      if (result.section) {
        this.activeSection = result.section;
      }
      this.successMessage = 'Created new custom space listing!';
    } else {
      this.errorMessage = result.error || 'Failed to create section.';
    }
  }

  openEditModal(section: CustomSection): void {
    this.editId = section.id;
    this.editTitle = section.title;
    this.editIcon = section.icon;
    this.editDescription = section.description;
    this.showEditModal = true;
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveSection(): void {
    this.errorMessage = '';
    if (!this.editTitle.trim()) {
      this.errorMessage = 'Please enter a title.';
      return;
    }

    const ok = this.sectionsService.updateSection(this.editId, this.editTitle.trim(), this.editIcon, this.editDescription.trim());
    if (ok) {
      this.showEditModal = false;
      this.loadData();
      this.successMessage = 'Updated custom section details.';
    } else {
      this.errorMessage = 'Could not update section details.';
    }
  }

  deleteSection(id: string): void {
    if (confirm('Are you sure you want to delete this custom section? All its list items will be lost.')) {
      const ok = this.sectionsService.deleteSection(id);
      if (ok) {
        this.loadData();
        this.successMessage = 'Removed custom section.';
      }
    }
  }

  // Items CRUD inside selected section
  addItem(): void {
    if (!this.activeSection || !this.newItemContent.trim()) return;

    const ok = this.sectionsService.addItem(this.activeSection.id, this.newItemContent.trim());
    if (ok) {
      this.newItemContent = '';
      this.loadData();
      this.gamification.awardPoints('Added custom list item', 5);
    }
  }

  toggleItem(itemId: string, event: Event): void {
    if (!this.activeSection) return;
    const checkbox = event.target as HTMLInputElement;
    const completed = checkbox.checked;

    const ok = this.sectionsService.toggleItem(this.activeSection.id, itemId, completed);
    if (ok) {
      this.loadData();
      if (completed) {
        this.gamification.awardPoints('Completed custom list item', 10);
      }
    }
  }

  deleteItem(itemId: string): void {
    if (!this.activeSection) return;
    const ok = this.sectionsService.deleteItem(this.activeSection.id, itemId);
    if (ok) {
      this.loadData();
    }
  }
}
