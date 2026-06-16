import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackupDataService } from '../../../../core/services/backup-data.service';
import { StorageService } from '../../../../core/services/storage.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { ArovaPageHeaderComponent } from '../../../../shared/components/arova-page-header/arova-page-header.component';
import { ArovaCardComponent } from '../../../../shared/components/arova-card/arova-card.component';
import { ArovaStatusPillComponent } from '../../../../shared/components/arova-status-pill/arova-status-pill.component';
import { ArovaSectionHeaderComponent } from '../../../../shared/components/arova-section-header/arova-section-header.component';

interface DataSummary {
  label: string;
  count: number;
}

@Component({
  selector: 'app-backup-center',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ArovaPageHeaderComponent,
    ArovaCardComponent,
    ArovaStatusPillComponent,
    ArovaSectionHeaderComponent
  ],
  templateUrl: './backup-center.component.html',
  styleUrls: ['./backup-center.component.scss'],
})
export class BackupCenterComponent implements OnInit {
  summary: DataSummary[] = [];
  lastBackupDate = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';
  resetConfirmation = '';
  importing = false;
  exporting = false;
  isApiMode = false;

  constructor(
    private backup: BackupDataService,
    private storage: StorageService,
    private translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.isApiMode = this.backup.isApiMode();
    this.refreshSummary();
  }

  exportBackup(): void {
    this.exporting = true;
    this.message = '';
    this.messageType = '';
    this.backup.downloadBackupFile().subscribe({
      next: (result) => {
        this.setMessage(result.message, result.success ? 'success' : 'error');
        this.refreshSummary();
        this.exporting = false;
      },
      error: (err: Error) => {
        this.setMessage(err.message || 'The backup could not be downloaded.', 'error');
        this.exporting = false;
      }
    });
  }

  async importBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing = true;
    this.message = '';
    this.messageType = '';
    this.backup.importDataFromFile(file).subscribe({
      next: (result) => {
        this.setMessage(result.message, result.success ? 'success' : 'error');
        if (result.success) {
          this.refreshSummary();
        }
        this.importing = false;
        input.value = '';
      },
      error: (err: Error) => {
        this.setMessage(err.message || 'Import failed.', 'error');
        this.importing = false;
        input.value = '';
      }
    });
  }

  resetData(): void {
    if (this.isApiMode) {
      this.setMessage('Resetting data is only available in Local Mode.', 'error');
      return;
    }
    const result = this.backup.resetData(this.resetConfirmation);
    this.setMessage(result.message, result.success ? 'success' : 'error');

    if (result.success) {
      this.resetConfirmation = '';
      this.refreshSummary();
    }
  }

  get canReset(): boolean {
    return !this.isApiMode && this.resetConfirmation === 'RESET OUR UNIVERSE';
  }

  get actionsDisabled(): boolean {
    return this.importing || this.exporting;
  }

  private refreshSummary(): void {
    if (this.isApiMode) {
      this.summary = [];
      this.lastBackupDate = this.formatDate(this.backup.getLastBackupDate());
      return;
    }
    const data = this.storage.loadFullAppData();
    this.lastBackupDate = this.formatDate(this.backup.getLastBackupDate());
    this.summary = [
      { label: 'Memories', count: data.memories.length },
      { label: 'Reasons', count: data.reasons.length },
      { label: 'Letters', count: data.letters.length },
      { label: 'Moods', count: data.moods.length },
      { label: 'Songs', count: data.songs.length },
      { label: 'Challenges', count: data.challenges.length },
      { label: 'Future plans', count: data.futurePlans.length },
    ];
  }

  private setMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
  }

  private formatDate(date?: string): string {
    if (!date) return 'No backup downloaded yet';

    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  t(key: string): string {
    return this.translation.t(key);
  }
}
