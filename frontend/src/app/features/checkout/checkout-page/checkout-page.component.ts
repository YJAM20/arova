import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PADDLE_CONFIG } from '../../../core/config/paddle.config';
import { PaddleCheckoutService } from '../../../core/services/paddle-checkout.service';
import { CustomSectionsService, PricingTier } from '../../../core/services/custom-sections.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent implements OnInit {
  planParam: string | null = null;
  periodParam: string | null = null;

  isValidSelection = false;
  planName = '';
  periodName = '';
  priceDisplay = '';
  priceId = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paddleCheckout: PaddleCheckoutService,
    private customSectionsService: CustomSectionsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planParam = params['plan'] || null;
      this.periodParam = params['period'] || null;
      this.validateAndResolve();
    });
  }

  private validateAndResolve(): void {
    const plan = this.planParam?.toLowerCase();
    const period = this.periodParam?.toLowerCase();

    if (
      (plan === 'pro' || plan === 'platinum') &&
      (period === 'monthly' || period === 'yearly')
    ) {
      this.isValidSelection = true;
      this.planName = plan === 'pro' ? 'Pro' : 'Platinum';
      this.periodName = period === 'monthly' ? 'Monthly' : 'Yearly';

      if (plan === 'pro') {
        this.priceDisplay = period === 'monthly' ? '$10 / month' : '$96 / year';
        this.priceId = period === 'monthly' ? PADDLE_CONFIG.prices.proMonthly : PADDLE_CONFIG.prices.proYearly;
      } else {
        this.priceDisplay = period === 'monthly' ? '$25 / month' : '$240 / year';
        this.priceId = period === 'monthly' ? PADDLE_CONFIG.prices.platinumMonthly : PADDLE_CONFIG.prices.platinumYearly;
      }
      this.errorMessage = '';
    } else {
      this.isValidSelection = false;
      this.errorMessage = 'Invalid checkout query parameters. Please select a valid plan and billing period from the plans page.';
    }
  }

  openPaddleCheckout(): void {
    if (!this.isValidSelection || !this.priceId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.paddleCheckout.openCheckout(this.priceId)
      .then(() => {
        this.isLoading = false;
      })
      .catch(err => {
        this.isLoading = false;
        this.errorMessage = err.message || 'An error occurred while loading the Paddle Sandbox checkout SDK.';
      });
  }

  simulateSuccessfulCheckout(): void {
    if (!this.isValidSelection) return;

    const selectedTier = this.planParam?.toLowerCase() as PricingTier;
    if (selectedTier === 'pro' || selectedTier === 'platinum') {
      this.customSectionsService.setTier(selectedTier);
      // Cache selected plan for the success display page
      localStorage.setItem('arova-checkout-success-plan', this.planName);
    }
    this.router.navigate(['/checkout/success']);
  }
}
