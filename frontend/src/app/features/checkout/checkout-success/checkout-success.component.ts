import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss']
})
export class CheckoutSuccessComponent implements OnInit {
  planName = 'Pro';

  ngOnInit(): void {
    const cachedPlan = localStorage.getItem('arova-checkout-success-plan');
    if (cachedPlan) {
      this.planName = cachedPlan;
    }
  }
}
