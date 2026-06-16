import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AppSettings } from '../../shared/models/app-settings.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeClassPrefix = 'theme-';
  private readonly allowedThemes = new Set([
    'dark-romantic',
    'soft-pink',
    'midnight-stars',
    'vintage-letters',
    'minimal-cream',
    'aurora-glass',
    'cosmic-blue',
    'rose-noir',
    'lavender-fog',
    'golden-hour',
    'moonlit-sage',
    'ocean-quiet',
    'velvet-plum',
    'warm-sand',
    'arctic-glow',
    'ember-night',
    'pearl-blush',
    'forest-whisper',
    'solar-dusk',
    'monochrome-luxe',
  ]);

  constructor(
    private storage: StorageService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  getSettings(): AppSettings {
    const settings = this.storage.getSettings();
    return {
      ...settings,
      activeTheme: this.normalizeThemeName(settings.activeTheme),
      languageMode: this.normalizeLanguageMode(settings.languageMode),
    };
  }

  updateSettings(changes: Partial<AppSettings>): AppSettings {
    const current = this.storage.getSettings();
    const updated = {
      ...current,
      ...changes,
      activeTheme: this.normalizeThemeName(changes.activeTheme ?? current.activeTheme),
      languageMode: this.normalizeLanguageMode(changes.languageMode ?? current.languageMode),
      animationsEnabled:
        typeof changes.animationsEnabled === 'boolean'
          ? changes.animationsEnabled
          : current.animationsEnabled,
      musicEnabled:
        typeof changes.musicEnabled === 'boolean' ? changes.musicEnabled : current.musicEnabled,
    };

    this.storage.updateSettings(updated);
    this.applyTheme(updated.activeTheme);
    this.applyAnimationPreference(updated.animationsEnabled);
    this.applyMusicPreference(updated.musicEnabled);
    return updated;
  }

  applyTheme(themeName: string): void {
    const root = this.document.documentElement;
    const body = this.document.body;
    const normalizedTheme = this.toThemeClass(this.normalizeThemeName(themeName));

    [root, body].forEach(element => {
      Array.from(element.classList)
        .filter(className => className.startsWith(this.themeClassPrefix))
        .forEach(className => element.classList.remove(className));

      element.classList.add(normalizedTheme);
    });
  }

  loadSavedTheme(): AppSettings {
    const settings = this.getSettings();
    this.applyTheme(settings.activeTheme);
    this.applyAnimationPreference(settings.animationsEnabled);
    this.applyMusicPreference(settings.musicEnabled);
    return settings;
  }

  toggleAnimations(enabled: boolean): AppSettings {
    return this.updateSettings({ animationsEnabled: enabled });
  }

  toggleMusic(enabled: boolean): AppSettings {
    return this.updateSettings({ musicEnabled: enabled });
  }

  private applyAnimationPreference(enabled: boolean): void {
    this.document.documentElement.classList.toggle('animations-off', !enabled);
  }

  private applyMusicPreference(enabled: boolean): void {
    this.document.documentElement.classList.toggle('music-off', !enabled);
  }

  private toThemeClass(themeName: string): string {
    const normalized = themeName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `${this.themeClassPrefix}${normalized || 'dark-romantic'}`;
  }

  private normalizeThemeName(themeName: string | undefined): string {
    const normalized = themeName === 'dark-universe' ? 'dark-romantic' : themeName;
    return normalized && this.allowedThemes.has(normalized) ? normalized : 'dark-romantic';
  }

  private normalizeLanguageMode(languageMode: AppSettings['languageMode'] | 'mixed' | undefined): AppSettings['languageMode'] {
    return languageMode === 'ar' || languageMode === 'es' ? languageMode : 'en';
  }
}
