import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  username = '';
  passcode = '';
  errorMessage = '';
  isLoading = false;
  showPasscode = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/universe']);
    }
  }

  onSubmit(): void {
    if (!this.username.trim() || !this.passcode.trim()) {
      this.errorMessage = 'Please enter both your name and passcode.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    setTimeout(() => {
      const result = this.auth.login(this.username.trim(), this.passcode.trim());
      if (!result.success) {
        this.errorMessage = result.error || 'Unable to enter the universe.';
        this.isLoading = false;
      }
    }, 600);
  }
}
