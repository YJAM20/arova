import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BRAND_CONFIG } from '../../../../core/config/brand.config';
import { PlanApiService, PlanResponse } from '../../../../core/services/plan-api.service';

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

  constructor(private planApi: PlanApiService) {}

  ngOnInit(): void {
    this.planApi.getPlans().subscribe({
      next: plans => {
        if (plans.length) this.plans = plans.map(plan => this.toDisplayPlan(plan));
      },
      error: () => {
        this.message = 'Showing built-in plan preview. Start the backend to load live plan metadata.';
      },
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
