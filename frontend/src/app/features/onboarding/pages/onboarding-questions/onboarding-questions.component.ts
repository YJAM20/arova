import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppModeService } from '../../../../core/services/app-mode.service';
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
  isLoading = true;
  isBusy = false;
  isComplete = false;
  hasLoadError = false;
  private saveInFlight = false;

  constructor(
    private onboarding: OnboardingApiService,
    private appMode: AppModeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.hasLoadError = false;
    this.isComplete = false;
    this.errorMessage = '';
    this.message = '';
    this.index = 0;

    if (this.appMode.isLocalMode()) {
      this.questions = this.fallbackQuestions();
      this.isLoading = false;
      this.loadAnswers();
      return;
    }

    this.onboarding.getQuestions().subscribe({
      next: questions => {
        const questionList = Array.isArray(questions) ? questions : [];
        this.questions = questionList.slice(0, 7);
        this.isLoading = false;
        if (this.questions.length) {
          this.loadAnswers();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.questions = [];
        this.hasLoadError = true;
        this.errorMessage = 'We could not load onboarding right now. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get current(): OnboardingQuestion | null {
    return this.questions[this.index] ?? null;
  }

  get progress(): number {
    return this.questions.length ? ((this.index + 1) / this.questions.length) * 100 : 0;
  }

  get currentNumber(): number {
    return this.questions.length ? this.index + 1 : 0;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get isLastQuestion(): boolean {
    return this.index === this.questions.length - 1;
  }

  get hasQuestions(): boolean {
    return this.questions.length > 0;
  }

  next(): void {
    if (!this.validateCurrentAnswer()) {
      return;
    }

    this.errorMessage = '';
    if (this.index < this.questions.length - 1) this.index++;
  }

  back(): void {
    this.errorMessage = '';
    if (this.index > 0) this.index--;
  }

  save(): void {
    if (this.saveInFlight) return;

    if (!this.validateCurrentAnswer()) {
      return;
    }

    const answers = this.toAnswers();
    this.errorMessage = '';
    this.saveInFlight = true;

    const busyTimer = setTimeout(() => {
      if (this.saveInFlight) {
        this.isBusy = true;
      }
    }, 300);

    this.onboarding.saveAnswers(answers).subscribe({
      next: () => {
        clearTimeout(busyTimer);
        this.saveInFlight = false;
        this.finishAndRoute();
      },
      error: err => {
        clearTimeout(busyTimer);
        this.saveInFlight = false;
        this.errorMessage = err?.status === 0
          ? 'We could not save onboarding because the backend is offline at http://localhost:5036.'
          : 'We could not save onboarding right now. Please try again.';
        this.isBusy = false;
      },
    });
  }

  skip(): void {
    this.message = 'No problem. We will start with a simple default space. You can personalize Arova anytime from Settings.';
    this.finishAndRoute();
  }

  categoryLabel(question: OnboardingQuestion): string {
    return question.category || this.fallbackCategory(question.id);
  }

  helperText(question: OnboardingQuestion): string {
    switch (question.id) {
      case 'rhythm':
        return 'Choose the kind of small rhythm that would make Arova feel useful from the first day.';
      case 'memory':
        return 'A short answer is enough. This helps shape prompts for memories and shared moments.';
      case 'distance':
        return 'This helps Arova tune reminders and check-ins without assuming how your relationship works.';
      case 'tone':
        return 'Pick the emotional texture that should guide prompts, letters, and daily questions.';
      case 'questions':
        return 'Your answer helps daily questions feel light, deep, or somewhere in between.';
      case 'privacy':
        return 'Private-by-default preferences can be refined later as the space grows.';
      case 'first-action':
        return 'This helps Arova make the first step feel calm instead of overwhelming.';
      default:
        return 'Answer in the way that feels most natural. You can keep it brief.';
    }
  }

  answerControlId(question: OnboardingQuestion): string {
    return `onboarding-answer-${question.id}`;
  }

  questionTitleId(question: OnboardingQuestion): string {
    return `onboarding-question-${question.id}`;
  }

  questionHelpId(question: OnboardingQuestion): string {
    return `onboarding-help-${question.id}`;
  }

  trackByQuestionId(_: number, question: OnboardingQuestion): string {
    return question.id;
  }

  trackByOption(_: number, option: string): string {
    return option;
  }

  private loadAnswers(): void {
    this.onboarding.getMyAnswers().subscribe({
      next: answers => {
        answers.forEach(answer => {
          this.answers[answer.questionId] = answer.answer;
        });
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  private validateCurrentAnswer(): boolean {
    const question = this.current;
    if (!question) return false;

    if (question.required && !this.answers[question.id]?.trim()) {
      this.errorMessage = 'This question helps shape your setup. Add an answer or choose Skip for now.';
      return false;
    }

    return true;
  }

  private finishAndRoute(): void {
    this.saveInFlight = false;
    this.isBusy = false;
    this.errorMessage = '';
    if (!this.message) {
      this.message = 'Your space is ready to begin.';
    }

    setTimeout(() => {
      this.isComplete = true;
      setTimeout(() => this.router.navigate(['/profile-setup']), 800);
    }, 180);
  }

  private toAnswers(): OnboardingAnswer[] {
    return Object.entries(this.answers)
      .filter(([, answer]) => answer.trim())
      .map(([questionId, answer]) => ({ questionId, answer: answer.trim() }));
  }

  private fallbackCategory(id: string): string {
    const categories: Record<string, string> = {
      rhythm: 'Rituals',
      memory: 'Memories',
      distance: 'Connection',
      tone: 'Tone',
      questions: 'Prompts',
      privacy: 'Privacy',
      'first-action': 'First step',
    };

    return categories[id] ?? 'Setup';
  }

  private fallbackQuestions(): OnboardingQuestion[] {
    return [
      {
        id: 'rhythm',
        category: 'Rituals',
        prompt: 'What kind of small ritual would help you feel close?',
        required: true,
        options: ['A daily check-in', 'A weekly memory', 'Letters for meaningful days', 'A calm shared plan'],
      },
      {
        id: 'memory',
        category: 'Memories',
        prompt: 'What is one kind of memory you want to preserve first?',
        required: true,
      },
      {
        id: 'distance',
        category: 'Connection',
        prompt: 'Are you usually together, long-distance, or somewhere in between?',
        options: ['Usually together', 'Long-distance', 'Mixed rhythm', 'Still finding our rhythm'],
      },
      {
        id: 'tone',
        category: 'Tone',
        prompt: 'Should Arova feel calm, playful, reflective, or practical?',
        options: ['Calm', 'Playful', 'Reflective', 'Practical'],
      },
      {
        id: 'questions',
        category: 'Prompts',
        prompt: 'How often do you want daily questions to feel deep?',
        options: ['Mostly light', 'Balanced', 'Often deep', 'Only when it fits'],
      },
      {
        id: 'privacy',
        category: 'Privacy',
        prompt: 'What kinds of things should stay private by default?',
      },
      {
        id: 'first-action',
        category: 'First step',
        prompt: 'What would you like to do first in Arova?',
        options: ['Save a memory', 'Write a letter', 'Check in on moods', 'Plan something future-facing'],
      },
    ];
  }
}
