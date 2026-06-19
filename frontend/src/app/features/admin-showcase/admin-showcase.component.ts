import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { AppModeService } from '../../core/services/app-mode.service';
import { ArovaCardComponent } from '../../shared/components/arova-card/arova-card.component';
import { ArovaStatusPillComponent } from '../../shared/components/arova-status-pill/arova-status-pill.component';

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description: string;
}

interface SystemHealth {
  system: string;
  status: string;
  type: 'success' | 'warning' | 'danger' | 'info' | 'accent';
  details: string;
}

interface ActivityLog {
  event: string;
  section: string;
  mode: string;
  status: string;
  statusType: 'success' | 'warning' | 'danger' | 'info' | 'accent';
  time: string;
}

interface MatrixRow {
  feature: string;
  state: string;
  localMode: string;
  apiMode: string;
  note: string;
  isReady: boolean;
}

@Component({
  selector: 'app-admin-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ArovaCardComponent,
    ArovaStatusPillComponent,
  ],
  templateUrl: './admin-showcase.component.html',
  styleUrls: ['./admin-showcase.component.scss'],
})
export class AdminShowcaseComponent implements OnInit {
  mobileSidebarOpen = false;
  searchQuery = '';

  metrics: Metric[] = [
    {
      label: 'Demo Couples',
      value: '128',
      change: '+12.4%',
      trend: 'up',
      description: 'Sample Local Mode spaces',
    },
    {
      label: 'Memories Saved',
      value: '2.8K',
      change: '+18.2%',
      trend: 'up',
      description: 'Mock shared entries',
    },
    {
      label: 'Mood Check-ins',
      value: '942',
      change: '+7.6%',
      trend: 'up',
      description: 'Sample emotional activity',
    },
    {
      label: 'Readiness Score',
      value: '82%',
      change: '+5.1%',
      trend: 'up',
      description: 'Portfolio maturity estimate',
    },
  ];

  healthChecks: SystemHealth[] = [
    {
      system: 'Local Demo',
      status: 'Healthy',
      type: 'success',
      details: 'owner / 1234 and partner / 1234 remain available for public review.',
    },
    {
      system: 'API Mode',
      status: 'Local only',
      type: 'info',
      details: 'Uses ASP.NET Core backend at http://localhost:5036 during development.',
    },
    {
      system: 'Verification',
      status: 'Partial',
      type: 'warning',
      details: 'Email verification flow exists. SMS remains mocked/planned.',
    },
    {
      system: 'Billing',
      status: 'Planned',
      type: 'accent',
      details: 'Plan pages are product previews. No payment provider is connected.',
    },
  ];

  activities: ActivityLog[] = [
    {
      event: 'Memory added',
      section: 'Memories',
      mode: 'Local',
      status: 'Completed',
      statusType: 'success',
      time: '2 min ago',
    },
    {
      event: 'Letter drafted',
      section: 'Letters',
      mode: 'Local',
      status: 'Completed',
      statusType: 'success',
      time: '12 min ago',
    },
    {
      event: 'Pairing code generated',
      section: 'Couple Setup',
      mode: 'API',
      status: 'Development',
      statusType: 'info',
      time: '28 min ago',
    },
    {
      event: 'Backup exported',
      section: 'Backup Center',
      mode: 'Local',
      status: 'Completed',
      statusType: 'success',
      time: '1 hour ago',
    },
    {
      event: 'Payment provider check',
      section: 'Plans',
      mode: 'Production',
      status: 'Not connected',
      statusType: 'danger',
      time: 'Roadmap',
    },
  ];

  matrix: MatrixRow[] = [
    {
      feature: 'Authentication',
      state: 'Implemented',
      localMode: 'Demo credentials',
      apiMode: 'JWT',
      note: 'Needs production hardening',
      isReady: true,
    },
    {
      feature: 'Pairing',
      state: 'Implemented',
      localMode: 'Supported',
      apiMode: 'Couple-scoped',
      note: 'Needs deployed backend',
      isReady: true,
    },
    {
      feature: 'Memories / Letters',
      state: 'Implemented',
      localMode: 'Supported',
      apiMode: 'Supported',
      note: 'Ready for portfolio demo',
      isReady: true,
    },
    {
      feature: 'Chat',
      state: 'Implemented',
      localMode: 'Basic',
      apiMode: 'SignalR',
      note: 'Needs production hosting',
      isReady: true,
    },
    {
      feature: 'Billing',
      state: 'Placeholder',
      localMode: 'Preview only',
      apiMode: 'Not connected',
      note: 'Requires real provider',
      isReady: false,
    },
    {
      feature: 'OAuth',
      state: 'Placeholder',
      localMode: 'Not active',
      apiMode: 'Not configured',
      note: 'Requires provider setup',
      isReady: false,
    },
    {
      feature: 'SMS',
      state: 'Mocked',
      localMode: 'Preview',
      apiMode: 'Mock/dev',
      note: 'Requires SMS provider',
      isReady: false,
    },
    {
      feature: 'E2EE',
      state: 'Not implemented',
      localMode: 'No',
      apiMode: 'No',
      note: 'Future security milestone',
      isReady: false,
    },
  ];

  distributionStats = [
    { label: 'Memories', percent: 34, color: 'var(--theme-accent, #dfe0ff)' },
    { label: 'Letters', percent: 22, color: 'var(--theme-accent-2, #f6be38)' },
    { label: 'Moods', percent: 18, color: 'var(--theme-soft, #dce2fb)' },
    { label: 'Music', percent: 14, color: 'rgba(255,255,255,0.4)' },
    { label: 'Plans', percent: 12, color: 'rgba(255,255,255,0.2)' },
  ];

  constructor(
    private translation: TranslationService,
    private appModeService: AppModeService
  ) {}

  ngOnInit(): void {
    // Component loaded standalone
  }

  get isLocalMode(): boolean {
    return this.appModeService.isLocalMode();
  }

  t(key: string): string {
    return this.translation.t(key);
  }

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeSidebar(): void {
    this.mobileSidebarOpen = false;
  }
}
