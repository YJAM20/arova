import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BRAND_CONFIG } from '../../../../core/config/brand.config';
import { AuthService } from '../../../../core/services/auth.service';
import { StorageService } from '../../../../core/services/storage.service';
import { FeedbackApiService } from '../../../../core/services/feedback-api.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  brand = BRAND_CONFIG;

  featureGroups = [
    { title: 'Remember', items: ['Memories', 'Reasons', 'Letters'] },
    { title: 'Connect', items: ['Daily questions', 'Mood check-ins', 'Private chat'] },
    { title: 'Plan', items: ['Future board', 'Challenges', 'Shared goals'] },
    { title: 'Personalize', items: ['Themes', 'Profile', 'Language', 'Onboarding-based experience'] },
  ];

  plans = ['Free', 'Pro', 'Platinum'];

  faqs = [
    {
      q: 'How does Couple Pairing work?',
      a: 'One partner signs up and generates a unique, private pairing code. The other partner registers, enters that code, and instantly enters the same shared universe space. Pairing is strictly one-to-one.'
    },
    {
      q: 'Is my data secure and private?',
      a: 'Yes. Under Local Mode, everything stays inside this browser storage. In API Mode, your records are saved inside a dedicated, secure relational SQLite database isolated strictly to your couple context.'
    },
    {
      q: 'What is Arova’s stance on End-to-End Encryption (E2EE)?',
      a: 'We believe in transparency: true End-to-End Encryption is actively planned for future releases. Right now, all data transfers utilize standard secure couple-scoped transport layers (HTTPS/WebSockets).'
    },
    {
      q: 'Do both partners need to subscribe to premium plans?',
      a: 'No. Arova operates on a single-space billing model. Purchasing a Pro or Platinum gifted upgrade covers the entire shared space for both partners simultaneously.'
    }
  ];

  feedback = { name: '', email: '', message: '' };
  feedbackSent = false;
  isBusy = false;
  errorMessage = '';
  activeFaqIndex: number | null = null;

  toggleFaq(index: number): void {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  constructor(
    private auth: AuthService,
    private storage: StorageService,
    private router: Router,
    private feedbackApi: FeedbackApiService
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && this.storage.getSettings().onboardingCompleted) {
      this.router.navigate(['/universe']);
    }
  }

  sendFeedback(): void {
    if (!this.feedback.message.trim()) return;
    this.isBusy = true;
    this.errorMessage = '';
    this.feedbackSent = false;

    this.feedbackApi.sendFeedback({
      name: this.feedback.name.trim() || undefined,
      email: this.feedback.email.trim() || undefined,
      message: this.feedback.message.trim(),
      context: 'Landing Page'
    }).subscribe({
      next: () => {
        this.feedbackSent = true;
        this.feedback.message = '';
        this.isBusy = false;
      },
      error: () => {
        this.errorMessage = 'Could not send feedback. Please try again.';
        this.isBusy = false;
      }
    });
  }
}
