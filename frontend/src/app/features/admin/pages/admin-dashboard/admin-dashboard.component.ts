import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../../core/services/storage.service';
import { AdminService, AdminEngagementOverview } from '../../../../core/services/admin.service';

interface DashboardStat {
  label: string;
  value: number;
  accent: 'green' | 'pink' | 'gold' | 'blue' | 'purple';
}

interface ModerationLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'SAFETY' | 'SUCCESS';
  message: string;
}

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

const FLAGS_KEY = 'arova-admin-flags-v1';
const LOGS_KEY = 'arova-admin-logs-v1';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStat[] = [];
  lastUpdated = '';
  logs: ModerationLog[] = [];
  
  // Feature Flags
  featureFlags: FeatureFlag[] = [
    { key: 'devModeLogs', name: 'Developer Mode Logs', description: 'Prints verbose database transactions in developer console', enabled: false },
    { key: 'slowNetwork', name: 'Simulate Slow Connection', description: 'Simulates a 1.5s latency delay for remote API requests', enabled: false },
    { key: 'bypassFilters', name: 'Bypass Content Filters', description: 'Disables strict keyword checking on profile bios and letters', enabled: false },
    { key: 'maintenanceMode', name: 'Simulated Maintenance Mode', description: 'Shows offline status page to standard users on route change', enabled: false }
  ];

  // Limit structures
  limits = [
    { feature: 'Custom Space Sections', free: '1 section', pro: '5 sections', platinum: '20 sections (Unlimited)' },
    { feature: 'Memories Photo Uploads', free: '100 MB', pro: '2 GB', platinum: '20 GB (High Resolution)' },
    { feature: 'Interactive Letter Vaults', free: '5 items', pro: '50 items', platinum: 'Unlimited' },
    { feature: 'Streaks & Points Boosts', free: 'Standard', pro: '1.5x Multiplier', platinum: '3x Multiplier' },
    { feature: 'Automated Encryption Keys', free: 'AES-128', pro: 'AES-256', platinum: 'Custom Keys' }
  ];

  activeTab: 'overview' | 'engagement' = 'overview';
  engagementOverview: AdminEngagementOverview | null = null;
  engagementError = '';
  engagementLoading = false;
  coupleIdInput = '';

  constructor(
    private storage: StorageService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadFlags();
    this.loadLogs();
    this.loadEngagement();
  }

  loadEngagement(): void {
    this.engagementLoading = true;
    this.engagementError = '';
    this.adminService.getEngagementOverview(this.coupleIdInput || undefined).subscribe({
      next: (data) => {
        this.engagementOverview = data;
        this.engagementLoading = false;
      },
      error: (err) => {
        this.engagementError = err.message || 'Failed to load engagement analytics.';
        this.engagementLoading = false;
      }
    });
  }

  get isApiMode(): boolean {
    return this.adminService.isApiMode();
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  loadStats(): void {
    const data = this.storage.getAll();
    const visibleMemories = data.memories.filter(memory => memory.visibleToPartner).length;
    const privateMemories = data.memories.length - visibleMemories;

    // Retrieve custom section counts from localStorage
    let customSectionsCount = 0;
    try {
      const customRaw = localStorage.getItem('arova-custom-sections-v1');
      if (customRaw) {
        customSectionsCount = JSON.parse(customRaw).length;
      }
    } catch {
      // ignore
    }

    this.stats = [
      { label: 'Total memories', value: data.memories.length, accent: 'green' },
      { label: 'Total reasons', value: data.reasons.length, accent: 'pink' },
      { label: 'Total letters', value: data.letters.length, accent: 'gold' },
      { label: 'Custom Spaces', value: customSectionsCount, accent: 'blue' },
      { label: 'Visible memories', value: visibleMemories, accent: 'green' },
      { label: 'Private memories', value: privateMemories, accent: 'pink' },
      { label: 'Secret reasons', value: data.reasons.filter(reason => reason.isSecret).length, accent: 'purple' },
      { label: 'Locked letters', value: data.letters.filter(letter => letter.isLocked).length, accent: 'gold' },
    ];

    this.lastUpdated = this.formatDateTime(data.updatedAt);
  }

  loadFlags(): void {
    const raw = localStorage.getItem(FLAGS_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        this.featureFlags.forEach(f => {
          if (saved[f.key] !== undefined) {
            f.enabled = saved[f.key];
          }
        });
      } catch {
        // ignore
      }
    }
  }

  saveFlags(): void {
    const state: Record<string, boolean> = {};
    this.featureFlags.forEach(f => {
      state[f.key] = f.enabled;
    });
    localStorage.setItem(FLAGS_KEY, JSON.stringify(state));
    this.addLog('INFO', `Updated developer feature flags configuration`);
  }

  toggleFlag(flag: FeatureFlag): void {
    flag.enabled = !flag.enabled;
    this.saveFlags();
  }

  loadLogs(): void {
    const raw = localStorage.getItem(LOGS_KEY);
    if (raw) {
      try {
        this.logs = JSON.parse(raw);
        return;
      } catch {
        // ignore
      }
    }
    // Default initial mock logs
    this.logs = [
      { id: '1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), type: 'SUCCESS', message: 'SQLite database backup center initialized' },
      { id: '2', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'INFO', message: 'Auth token created for user: Owner' },
      { id: '3', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'SAFETY', message: 'Content safety scans completed: 0 flags raised' },
      { id: '4', timestamp: new Date().toISOString(), type: 'INFO', message: 'Opened Creator Panel / Admin Dashboard' }
    ];
    this.saveLogs();
  }

  saveLogs(): void {
    localStorage.setItem(LOGS_KEY, JSON.stringify(this.logs));
  }

  addLog(type: 'INFO' | 'WARNING' | 'SAFETY' | 'SUCCESS', message: string): void {
    const log: ModerationLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.logs.unshift(log);
    if (this.logs.length > 50) {
      this.logs.pop();
    }
    this.saveLogs();
  }

  simulateActivity(): void {
    const events: {type: 'INFO' | 'WARNING' | 'SAFETY' | 'SUCCESS'; msg: string}[] = [
      { type: 'SUCCESS', msg: 'Theme configuration synchronized across pairing nodes' },
      { type: 'INFO', msg: 'Synchronized local storage points ledger to backup nodes' },
      { type: 'WARNING', msg: 'Partner session heartbeat timed out, awaiting reconnection' },
      { type: 'SAFETY', msg: 'Sensitive keyword check bypassed via admin override rules' },
      { type: 'SUCCESS', msg: 'Memory photo dimensions optimized (Saved 14% storage budget)' },
      { type: 'INFO', msg: 'Simulated daily planet seed reassigned: Mercury selected' }
    ];

    const pick = events[Math.floor(Math.random() * events.length)];
    this.addLog(pick.type, pick.msg);
    this.loadStats(); // refresh statistics in case
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  private formatDateTime(value: string): string {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
