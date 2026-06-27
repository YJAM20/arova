import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BRAND_CONFIG } from '../../../../core/config/brand.config';
import { PlanApiService, PlanResponse } from '../../../../core/services/plan-api.service';
import { AppModeService } from '../../../../core/services/app-mode.service';
import { AuthService } from '../../../../core/services/auth.service';

interface DisplayPlan {
  name: string;
  description: string;
  features: string[];
}

interface ComparisonRow {
  name: string;
  starter: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

@Component({
  selector: 'app-plans-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './plans-page.component.html',
  styleUrls: ['./plans-page.component.scss'],
})
export class PlansPageComponent implements OnInit {
  brand = BRAND_CONFIG;
  plans: DisplayPlan[] = this.fallbackPlans();
  message = '';
  errorMessage = '';
  isLocalMode = true;
  apiOffline = false;

  comparisonRows: ComparisonRow[] = [
    { name: 'Shared memories space', starter: 'Up to 50', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Private letters vault', starter: false, pro: true, enterprise: true },
    { name: 'Interactive mood logs', starter: 'Basic', pro: 'Deeper history', enterprise: 'Custom triggers' },
    { name: 'Shared future board', starter: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
    { name: 'Dual storage (Local/API)', starter: true, pro: true, enterprise: true },
    { name: 'Space personalization', starter: 'Standard', pro: 'Custom categories', enterprise: 'Full themes' },
    { name: 'Advanced privacy controls', starter: false, pro: false, enterprise: true },
    { name: 'End-to-End Encryption', starter: 'Planned', pro: 'Planned', enterprise: 'Planned' }
  ];

  constructor(
    private planApi: PlanApiService,
    private appModeService: AppModeService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLocalMode = this.appModeService.isLocalMode();
    if (!this.isLocalMode) {
      this.loadPlans();
    }
  }

  loadPlans(): void {
    this.message = '';
    this.errorMessage = '';
    this.planApi.getPlans().subscribe({
      next: plans => {
        if (plans.length) this.plans = plans.map(plan => this.toDisplayPlan(plan));
        this.apiOffline = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Showing built-in plan preview. Start the backend to load live plan metadata.';
        this.apiOffline = true;
        this.cdr.detectChanges();
      },
    });
  }

  selectLocalMode(): void {
    this.appModeService.setMode('local');
    this.isLocalMode = true;
    this.errorMessage = '';
    this.message = 'Switched to Local Mode successfully.';
    this.cdr.detectChanges();
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/universe']);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  selectApiMode(): void {
    this.errorMessage = '';
    this.message = 'Checking backend connectivity...';
    this.cdr.detectChanges();
    this.planApi.getPlans().subscribe({
      next: (plans) => {
        this.appModeService.setMode('api');
        this.isLocalMode = false;
        this.apiOffline = false;
        this.message = 'Switched to API Mode successfully.';
        this.cdr.detectChanges();
        if (this.auth.isLoggedIn()) {
          this.router.navigate(['/universe']);
        } else {
          this.router.navigate(['/auth']);
        }
      },
      error: (err) => {
        this.message = '';
        this.errorMessage = 'Backend is offline or unreachable at http://localhost:5036. Please make sure the backend is running before switching to API Mode.';
        this.cdr.detectChanges();
      }
    });
  }

  private toDisplayPlan(plan: PlanResponse): DisplayPlan {
    return {
      name: plan.name || plan.tier || 'Plan',
      description: plan.description || 'Arova plan for two partners.',
      features: plan.features?.length ? plan.features : ['One plan covers both partners.'],
    };
  }

  private fallbackPlans(): DisplayPlan[] {
    return [
      {
        name: 'Free',
        description: 'A simple shared space for two.',
        features: [
          'Basic shared space',
          'Memories',
          'Reasons',
          'Letters',
          'Mood check-ins',
          'Daily questions basics',
          'Basic future board',
          'Basic secure chat',
          'Basic themes',
        ],
      },
      {
        name: 'Pro',
        description: 'More personalization and rituals.',
        features: [
          'Everything in Free',
          'More themes',
          'Deeper personalization',
          'More daily questions',
          'Deeper check-ins',
          'Private letters',
          'Custom categories',
          'Relationship rituals',
        ],
      },
      {
        name: 'Platinum',
        description: 'Advanced controls and premium space.',
        features: [
          'Everything in Pro',
          'Advanced privacy controls',
          'Premium themes',
          'Extended timeline',
          'Advanced future planning',
          'Advanced chat media placeholders',
          'Premium insights placeholders',
        ],
      },
    ];
  }
}
