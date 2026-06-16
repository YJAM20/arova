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
import { ReasonDataService } from '../../../../core/services/reason-data.service';
import { ReasonInput } from '../../../../core/services/reason.service';
import { ReasonCategory } from '../../../../shared/models/reason.model';

interface CategoryOption {
  value: ReasonCategory;
  label: string;
}

type ReasonFormGroup = FormGroup<{
  title: FormControl<string>;
  body: FormControl<string>;
  category: FormControl<ReasonCategory>;
  order: FormControl<number>;
  unlockDate: FormControl<string>;
  isSecret: FormControl<boolean>;
  isFavorite: FormControl<boolean>;
}>;

@Component({
  selector: 'app-reason-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reason-form.component.html',
  styleUrls: ['./reason-form.component.scss'],
})
export class ReasonFormComponent implements OnInit {
  isEditMode = false;
  notFound = false;
  isAdminRoute = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  private reasonId: string | null = null;

  categories: CategoryOption[] = [
    { value: 'love', label: 'Love' },
    { value: 'trust', label: 'Trust' },
    { value: 'choose-you', label: 'I Choose You' },
    { value: 'miss-you', label: 'I Miss You' },
    { value: 'future', label: 'Future' },
  ];

  form: ReasonFormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private reasonService: ReasonDataService
  ) {
    this.form = this.fb.nonNullable.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      category: ['love' as ReasonCategory, Validators.required],
      order: [1, [Validators.required, Validators.min(1)]],
      unlockDate: [''],
      isSecret: [false],
      isFavorite: [false],
    });
  }

  ngOnInit(): void {
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.reasonId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.reasonId;

    if (!this.reasonId) {
      this.prefillNextOrder();
      return;
    }

    this.isLoading = true;
    this.reasonService.getReasonById(this.reasonId).subscribe({
      next: reason => {
        this.isLoading = false;
        if (!reason || !this.reasonService.canEditReason(reason)) {
          this.notFound = true;
          return;
        }

        this.form.patchValue({
          title: reason.title,
          body: reason.body,
          category: reason.category,
          order: reason.order,
          unlockDate: reason.unlockDate ?? '',
          isSecret: reason.isSecret,
          isFavorite: reason.isFavorite,
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
    const input: ReasonInput = {
      title: value.title.trim(),
      body: value.body.trim(),
      category: value.category,
      order: Number(value.order),
      unlockDate: this.optional(value.unlockDate),
      isSecret: value.isSecret,
      isFavorite: value.isFavorite,
    };

    const save$ =
      this.isEditMode && this.reasonId
        ? this.reasonService.updateReason(this.reasonId, input)
        : this.reasonService.addReason(input);

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

  private prefillNextOrder(): void {
    this.reasonService.getAllReasonsForAdmin().subscribe({
      next: reasons => {
        this.form.patchValue({ order: reasons.length + 1 });
      },
      error: error => {
        this.errorMessage = this.messageFromError(error);
      },
    });
  }

  private messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'The reason request failed. Please try again.';
  }

  get contextLabel(): string {
    return this.isAdminRoute && this.auth.isAdmin() ? 'Admin / Reasons' : 'Our Space / Reasons';
  }

  get pageTitle(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Edit Reason' : 'Add Reason';
    }

    return this.isEditMode ? 'Update this reason' : 'Write a reason to remember';
  }

  get pageSubtitle(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Update a reason with care.' : 'Write another reason into the constellation.';
    }

    return this.isEditMode
      ? 'Refine the wording and decide whether it is shared or just for you.'
      : 'Add a gentle note of appreciation, trust, or hope for later.';
  }

  get saveLabel(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Save changes' : 'Create reason';
    }

    return this.isEditMode ? 'Save this reason' : 'Add reason';
  }

  private returnPath(): string {
    return this.isAdminRoute && this.auth.isAdmin() ? '/admin/reasons' : '/reasons';
  }
}
