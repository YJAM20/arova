import { Injectable } from '@angular/core';
import { LoveUniverseData } from '../../shared/models/love-universe-data.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

export type BackupData = LoveUniverseData & { exportedAt: string };

export interface BackupResult {
  success: boolean;
  message: string;
}

export interface ImportValidationResult {
  valid: boolean;
  message: string;
  data?: LoveUniverseData;
}

type StoredRecord = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly resetConfirmation = 'RESET OUR UNIVERSE';

  constructor(private storage: StorageService, private auth: AuthService) {}

  exportData(): BackupData {
    const exportedAt = new Date().toISOString();

    try {
      const data = this.storage.loadFullAppData();
      return {
        ...data,
        version: data.version || 'unknown',
        exportedAt,
      };
    } catch {
      return {
        ...this.storage.normalizeFullAppData({}),
        exportedAt,
      };
    }
  }

  downloadBackupFile(): BackupResult {
    try {
      const backup = this.exportData();
      const date = backup.exportedAt.slice(0, 10);
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `arova-backup-${date}.json`;
      link.click();
      URL.revokeObjectURL(url);
      this.updateLastBackupDate();

      return { success: true, message: 'Backup downloaded safely.' };
    } catch {
      return {
        success: false,
        message: 'The backup could not be downloaded. Please try again.',
      };
    }
  }

  async importDataFromFile(file: File): Promise<BackupResult> {
    if (!file.name.toLowerCase().endsWith('.json')) {
      return { success: false, message: 'Please choose a JSON backup file.' };
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const validation = this.validateImportedData(parsed);

      if (!validation.valid || !validation.data) {
        return { success: false, message: validation.message };
      }

      const importedAt = new Date().toISOString();
      this.storage.saveFullAppData({
        ...validation.data,
        settings: {
          ...validation.data.settings,
          lastBackupAt: importedAt,
        },
      });
      return { success: true, message: 'Backup imported successfully.' };
    } catch {
      return {
        success: false,
        message: 'That file is not valid JSON. Nothing was changed.',
      };
    }
  }

  validateImportedData(data: unknown): ImportValidationResult {
    const candidate = this.unwrapBackupData(data);
    if (!this.isRecord(candidate)) {
      return { valid: false, message: 'The backup file is not a valid data object.' };
    }

    if (typeof candidate['version'] !== 'string') {
      return { valid: false, message: 'The backup is missing an app version.' };
    }

    const requiredArrays = [
      'users',
      'memories',
      'reasons',
      'letters',
      'moods',
      'songs',
      'challenges',
      'futurePlans',
    ];
    const missingArray = requiredArrays.find(key => !Array.isArray(candidate[key]));
    if (missingArray) {
      return {
        valid: false,
        message: `The backup is missing required ${missingArray} data.`,
      };
    }

    if (!this.isRecord(candidate['settings'])) {
      return { valid: false, message: 'The backup is missing app settings.' };
    }

    try {
      return {
        valid: true,
        message: 'Backup data is valid.',
        data: this.storage.normalizeFullAppData(candidate),
      };
    } catch {
      return {
        valid: false,
        message: 'The backup could not be normalized safely.',
      };
    }
  }

  resetData(confirmation: string): BackupResult {
    if (!this.auth.isAdmin()) {
      return { success: false, message: 'Only the admin can reset this universe.' };
    }

    if (confirmation !== this.resetConfirmation) {
      return {
        success: false,
        message: 'Type RESET OUR UNIVERSE exactly before resetting.',
      };
    }

    this.storage.resetToDefaults();
    return { success: true, message: 'The universe was reset to safe seed data.' };
  }

  getLastBackupDate(): string | undefined {
    return this.storage.getSettings().lastBackupAt;
  }

  updateLastBackupDate(): void {
    this.storage.updateSettings({
      ...this.storage.getSettings(),
      lastBackupAt: new Date().toISOString(),
    });
  }

  private unwrapBackupData(data: unknown): unknown {
    if (this.isRecord(data) && this.isRecord(data['data'])) {
      return data['data'];
    }

    return data;
  }

  private isRecord(value: unknown): value is StoredRecord {
    return typeof value === 'object' && value !== null;
  }
}
