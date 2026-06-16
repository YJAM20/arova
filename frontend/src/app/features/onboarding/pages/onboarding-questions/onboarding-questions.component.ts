import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  OnboardingAnswer,
  OnboardingApiService,
  OnboardingQuestion,
} from '../../../../core/services/onboarding-api.service';

@Component({
  selector: 'app-onboarding-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './onboarding-questions.component.html',
  styleUrls: ['./onboarding-questions.component.scss'],
})
export class OnboardingQuestionsComponent implements OnInit {
  questions: OnboardingQuestion[] = [];
  answers: Record<string, string> = {};
  index = 0;
  message = '';
  errorMessage = '';
  isBusy = false;

  constructor(private onboarding: OnboardingApiService, private router: Router) {}

  ngOnInit(): void {
    this.questions = this.fallbackQuestions();
    this.onboarding.getQuestions().subscribe({
      next: questions => {
        if (questions.length) this.questions = questions.slice(0, 7);
        this.loadAnswers();
      },
      error: () => this.loadAnswers(),
    });
  }

  get current(): OnboardingQuestion {
    return this.questions[this.index];
  }

  get progress(): number {
    return this.questions.length ? ((this.index + 1) / this.questions.length) * 100 : 0;
  }

  next(): void {
    if (this.current.required && !this.answers[this.current.id]?.trim()) {
      this.errorMessage = 'Answer this one or choose Skip for now.';
      return;
    }
    this.errorMessage = '';
    if (this.index < this.questions.length - 1) this.index++;
  }

  back(): void {
    if (this.index > 0) this.index--;
  }

  save(): void {
    const answers = this.toAnswers();
    this.isBusy = true;
    this.onboarding.saveAnswers(answers).subscribe({
      next: () => this.router.navigate(['/profile-setup']),
      error: () => {
        this.errorMessage = 'Could not save onboarding answers right now.';
        this.isBusy = false;
      },
    });
  }

  skip(): void {
    this.message = 'No problem. We’ll start with a simple default space. You can personalize Arova anytime from Settings.';
    setTimeout(() => this.router.navigate(['/profile-setup']), 900);
  }

  private loadAnswers(): void {
    this.onboarding.getMyAnswers().subscribe({
      next: answers => {
        answers.forEach(answer => {
          this.answers[answer.questionId] = answer.answer;
        });
      },
      error: () => undefined,
    });
  }

  private toAnswers(): OnboardingAnswer[] {
    return Object.entries(this.answers)
      .filter(([, answer]) => answer.trim())
      .map(([questionId, answer]) => ({ questionId, answer: answer.trim() }));
  }

  private fallbackQuestions(): OnboardingQuestion[] {
    return [
      { id: 'rhythm', prompt: 'What kind of small ritual would help you feel close?', required: true },
      { id: 'memory', prompt: 'What is one kind of memory you want to preserve first?', required: true },
      { id: 'distance', prompt: 'Are you usually together, long-distance, or somewhere in between?' },
      { id: 'tone', prompt: 'Should Arova feel calm, playful, reflective, or practical?' },
      { id: 'questions', prompt: 'How often do you want daily questions to feel deep?' },
      { id: 'privacy', prompt: 'What kinds of things should stay private by default?' },
      { id: 'first-action', prompt: 'What would you like to do first in Arova?' },
    ];
  }
}
