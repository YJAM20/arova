import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CoupleApiService, CoupleResponse, PairingCodeResponse } from '../../../../core/services/couple-api.service';

@Component({
  selector: 'app-pairing-choice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pairing-choice.component.html',
  styleUrls: ['./pairing-choice.component.scss'],
})
export class PairingChoiceComponent {
  coupleName = 'Arova Space';
  pairingCode = '';
  generatedCode: PairingCodeResponse | null = null;
  currentCouple: CoupleResponse | null = null;
  message = '';
  errorMessage = '';
  ready = false;
  isBusy = false;

  constructor(private couples: CoupleApiService, private router: Router) {}

  join(): void {
    if (!this.pairingCode.trim()) return;
    this.start();
    this.couples.joinCouple({ code: this.pairingCode.trim() }).subscribe({
      next: couple => this.finish(couple, 'Your space is ready.'),
      error: () => this.fail('Could not join with that code. Check it and try again.'),
    });
  }

  createCode(): void {
    this.start();
    this.couples.createCouple({ name: this.coupleName.trim() || 'Arova Space' }).subscribe({
      next: couple => {
        this.currentCouple = couple;
        this.generateCode();
      },
      error: () => {
        this.couples.getMyCouple().subscribe({
          next: couple => {
            this.currentCouple = couple;
            this.generateCode();
          },
          error: () => this.fail('Could not create or load a couple space right now.'),
        });
      },
    });
  }

  enterArova(): void {
    this.router.navigate(['/universe']);
  }

  copyToClipboard(): void {
    if (this.generatedCode?.code) {
      navigator.clipboard.writeText(this.generatedCode.code);
      this.message = 'Pairing code copied to clipboard!';
    }
  }

  private generateCode(): void {
    this.couples.generatePairingCode().subscribe({
      next: code => {
        this.generatedCode = code;
        this.ready = true;
        this.message = 'Your space is ready. Share this code privately with your partner.';
        this.isBusy = false;
      },
      error: () => this.fail('Could not generate a partner code right now.'),
    });
  }

  private finish(couple: CoupleResponse, message: string): void {
    this.currentCouple = couple;
    this.ready = true;
    this.message = message;
    this.isBusy = false;
  }

  private start(): void {
    this.isBusy = true;
    this.message = '';
    this.errorMessage = '';
  }

  private fail(message: string): void {
    this.errorMessage = message;
    this.isBusy = false;
  }
}
