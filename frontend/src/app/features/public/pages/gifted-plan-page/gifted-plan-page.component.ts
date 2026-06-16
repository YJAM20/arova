import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FeedbackApiService } from '../../../../core/services/feedback-api.service';
import { PlanApiService } from '../../../../core/services/plan-api.service';

@Component({
  selector: 'app-gifted-plan-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gifted-plan-page.component.html',
  styleUrls: ['./gifted-plan-page.component.scss'],
})
export class GiftedPlanPageComponent {
  selectedPlan = 'Pro';
  feedback = { name: '', email: '', message: '' };
  message = '';
  errorMessage = '';
  isBusy = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plans: PlanApiService,
    private feedbackApi: FeedbackApiService
  ) {
    this.selectedPlan = this.route.snapshot.queryParamMap.get('plan') || 'Pro';
  }

  continueWithPlan(): void {
    const token = localStorage.getItem('love-universe-api-token');
    if (!token) {
      this.errorMessage = 'Please sign in or register an account before applying the gifted upgrade.';
      return;
    }

    this.isBusy = true;
    this.errorMessage = '';
    this.message = '';

    let planType = 2; // Pro default
    if (this.selectedPlan.toLowerCase() === 'platinum') {
      planType = 3;
    } else if (this.selectedPlan.toLowerCase() === 'free') {
      planType = 1;
    }

    this.plans.giftedUpgrade({ planType }).subscribe({
      next: () => {
        this.isBusy = false;
        this.message = 'Gifted plan upgraded successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/universe']), 1200);
      },
      error: (err) => {
        this.isBusy = false;
        if (err && err.status === 0) {
          this.errorMessage = 'Backend is not reachable. Make sure http://localhost:5036 is running.';
        } else {
          this.errorMessage = err.error?.message || 'Could not apply gifted upgrade.';
        }
      },
    });
  }

  sendFeedback(): void {
    if (!this.feedback.message.trim()) return;
    this.isBusy = true;
    this.feedbackApi.sendFeedback({ ...this.feedback, context: `Gifted ${this.selectedPlan}` }).subscribe({
      next: () => {
        this.message = 'Thank you. Your feedback was sent.';
        this.feedback.message = '';
        this.isBusy = false;
      },
      error: () => {
        this.errorMessage = 'Feedback could not be sent right now. Please try again later.';
        this.isBusy = false;
      },
    });
  }
}
