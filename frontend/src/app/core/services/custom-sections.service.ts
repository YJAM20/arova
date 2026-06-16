import { Injectable } from '@angular/core';
import { AppModeService } from './app-mode.service';

export type PricingTier = 'free' | 'pro' | 'platinum';

export interface CustomSectionItem {
  id: string;
  content: string;
  completed: boolean;
  createdAt: string;
}

export interface CustomSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: CustomSectionItem[];
  createdAt: string;
  updatedAt: string;
}

const SECTIONS_KEY = 'arova-custom-sections-v1';
const TIER_KEY = 'arova-user-tier-v1';

@Injectable({ providedIn: 'root' })
export class CustomSectionsService {
  private sections: CustomSection[] = [];
  private currentTier: PricingTier = 'free';

  constructor(private appMode: AppModeService) {
    this.loadData();
  }

  private loadData(): void {
    const sectionsRaw = localStorage.getItem(SECTIONS_KEY);
    if (sectionsRaw) {
      try {
        this.sections = JSON.parse(sectionsRaw);
      } catch {
        this.sections = [];
      }
    } else {
      this.sections = this.getDefaultSections();
      this.saveSections();
    }

    const tierRaw = localStorage.getItem(TIER_KEY);
    if (tierRaw) {
      this.currentTier = tierRaw as PricingTier;
    } else {
      this.currentTier = 'free';
      localStorage.setItem(TIER_KEY, 'free');
    }
  }

  private getDefaultSections(): CustomSection[] {
    return [
      {
        id: 'sec-travel',
        title: 'Travel List',
        icon: '✈️',
        description: 'Places we plan to explore together around the globe.',
        items: [
          { id: 'item-1', content: 'Explore the cherry blossoms in Kyoto', completed: false, createdAt: new Date().toISOString() },
          { id: 'item-2', content: 'Walk along the Seine in Paris', completed: true, createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private saveSections(): void {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(this.sections));
  }

  getSections(): CustomSection[] {
    this.loadData();
    return this.sections;
  }

  getTier(): PricingTier {
    this.loadData();
    return this.currentTier;
  }

  setTier(tier: PricingTier): void {
    this.currentTier = tier;
    localStorage.setItem(TIER_KEY, tier);
  }

  getTierLimit(tier: PricingTier): number {
    switch (tier) {
      case 'free': return 1;
      case 'pro': return 5;
      case 'platinum': return 20;
    }
  }

  canAddSection(): boolean {
    const limit = this.getTierLimit(this.currentTier);
    return this.sections.length < limit;
  }

  addSection(title: string, icon: string, description: string): { success: boolean; section?: CustomSection; error?: string } {
    if (!this.canAddSection()) {
      return {
        success: false,
        error: `Limit reached. Your '${this.currentTier.toUpperCase()}' plan allows up to ${this.getTierLimit(this.currentTier)} section(s). Upgrade to add more.`
      };
    }

    const newSection: CustomSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      icon: icon || '📂',
      description,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.sections.push(newSection);
    this.saveSections();
    return { success: true, section: newSection };
  }

  updateSection(id: string, title: string, icon: string, description: string): boolean {
    const section = this.sections.find(s => s.id === id);
    if (!section) return false;
    section.title = title;
    section.icon = icon || '📂';
    section.description = description;
    section.updatedAt = new Date().toISOString();
    this.saveSections();
    return true;
  }

  deleteSection(id: string): boolean {
    const index = this.sections.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.sections.splice(index, 1);
    this.saveSections();
    return true;
  }

  addItem(sectionId: string, content: string): boolean {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return false;
    
    const newItem: CustomSectionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      content,
      completed: false,
      createdAt: new Date().toISOString()
    };

    section.items.push(newItem);
    section.updatedAt = new Date().toISOString();
    this.saveSections();
    return true;
  }

  toggleItem(sectionId: string, itemId: string, completed: boolean): boolean {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return false;
    
    const item = section.items.find(i => i.id === itemId);
    if (!item) return false;
    
    item.completed = completed;
    section.updatedAt = new Date().toISOString();
    this.saveSections();
    return true;
  }

  deleteItem(sectionId: string, itemId: string): boolean {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return false;
    
    const index = section.items.findIndex(i => i.id === itemId);
    if (index === -1) return false;
    
    section.items.splice(index, 1);
    section.updatedAt = new Date().toISOString();
    this.saveSections();
    return true;
  }
}
