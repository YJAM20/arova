import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LetterDataService } from '../../../../core/services/letter-data.service';
import { LetterInput } from '../../../../core/services/letter.service';
import { LetterCategory } from '../../../../shared/models/letter.model';

interface CategoryOption {
  value: LetterCategory;
  label: string;
}

type LetterFormGroup = FormGroup<{
  title: FormControl<string>;
  body: FormControl<string>;
  category: FormControl<LetterCategory>;
  unlockDate: FormControl<string>;
  passcode: FormControl<string>;
  isLocked: FormControl<boolean>;
  isFavorite: FormControl<boolean>;
  visibleToPartner: FormControl<boolean>;
}>;

@Component({
  selector: 'app-letter-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './letter-form.component.html',
  styleUrls: ['./letter-form.component.scss'],
})
export class LetterFormComponent implements OnInit {
  isEditMode = false;
  notFound = false;
  isAdminRoute = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  private letterId: string | null = null;

  categories: CategoryOption[] = [
    { value: 'miss-me', label: 'Miss Me' },
    { value: 'sad', label: 'Sad' },
    { value: 'argument', label: 'After an Argument' },
    { value: 'overthinking', label: 'Overthinking' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'reassurance', label: 'Reassurance' },
    { value: 'future', label: 'Future' },
  ];

  form: LetterFormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private letterService: LetterDataService
  ) {
    this.form = this.fb.nonNullable.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      category: ['miss-me' as LetterCategory, Validators.required],
      unlockDate: [''],
      passcode: [''],
      isLocked: [false],
      isFavorite: [false],
      visibleToPartner: [true],
    });
  }

  ngOnInit(): void {
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.letterId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.letterId;

    if (!this.letterId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.letterService.getLetterById(this.letterId).subscribe({
      next: letter => {
        this.isLoading = false;
        if (!letter || !this.letterService.canEditLetter(letter)) {
          this.notFound = true;
          return;
        }

        this.form.patchValue({
          title: letter.title,
          body: letter.body,
          category: letter.category,
          unlockDate: letter.unlockDate ?? '',
          passcode: letter.passcode ?? '',
          isLocked: letter.isLocked,
          isFavorite: letter.isFavorite,
          visibleToPartner: letter.visibleToPartner,
        });
      },
      error: error => {
        this.isLoading = false;
        this.notFound = true;
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const value = this.form.getRawValue();
    const input: LetterInput = {
      title: value.title.trim(),
      body: value.body.trim(),
      category: value.category,
      unlockDate: this.optional(value.unlockDate),
      passcode: this.optional(value.passcode),
      isLocked: value.isLocked,
      isFavorite: value.isFavorite,
      visibleToPartner: value.visibleToPartner,
    };

    const save$ =
      this.isEditMode && this.letterId
        ? this.letterService.updateLetter(this.letterId, input)
        : this.letterService.addLetter(input);

    save$.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate([this.returnPath()]);
      },
      error: error => {
        this.isSaving = false;
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  cancel(): void {
    this.router.navigate([this.returnPath()]);
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private optional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'The letter request failed. Please try again.';
  }

  get contextLabel(): string {
    return this.isAdminRoute && this.auth.isAdmin() ? 'Admin / Letters' : 'Our Space / Letters';
  }

  get pageTitle(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Edit Letter' : 'Add Letter';
    }

    return this.isEditMode ? 'Update this letter' : 'Write a letter for later';
  }

  get pageSubtitle(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Adjust a sealed message.' : 'Write a new letter for the vault.';
    }

    return this.isEditMode
      ? 'Keep the message clear, choose visibility, and decide whether it should stay locked.'
      : 'Leave words your partner, or your future self, can return to.';
  }

  get saveLabel(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Save changes' : 'Create letter';
    }

    return this.isEditMode ? 'Save this letter' : 'Add letter';
  }

  private returnPath(): string {
    return this.isAdminRoute && this.auth.isAdmin() ? '/admin/letters' : '/letters';
  }
}
