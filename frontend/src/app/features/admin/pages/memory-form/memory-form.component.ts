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
import { MemoryDataService } from '../../../../core/services/memory-data.service';
import { MemoryInput } from '../../../../core/services/memory.service';
import { MemoryCategory } from '../../../../shared/models/memory.model';

interface CategoryOption {
  value: MemoryCategory;
  label: string;
}

type MemoryFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  date: FormControl<string>;
  imageUrl: FormControl<string>;
  category: FormControl<MemoryCategory>;
  mood: FormControl<string>;
  privateNote: FormControl<string>;
  visibleToPartner: FormControl<boolean>;
  isFavorite: FormControl<boolean>;
}>;

@Component({
  selector: 'app-memory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './memory-form.component.html',
  styleUrls: ['./memory-form.component.scss'],
})
export class MemoryFormComponent implements OnInit {
  isEditMode = false;
  notFound = false;
  isAdminRoute = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  private memoryId: string | null = null;

  categories: CategoryOption[] = [
    { value: 'firsts', label: 'Firsts' },
    { value: 'funny', label: 'Funny' },
    { value: 'deep', label: 'Deep' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'special-day', label: 'Special Day' },
    { value: 'random', label: 'Random' },
  ];

  form: MemoryFormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private memoryService: MemoryDataService
  ) {
    this.form = this.fb.nonNullable.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      imageUrl: [''],
      category: ['romantic' as MemoryCategory, Validators.required],
      mood: [''],
      privateNote: [''],
      visibleToPartner: [true],
      isFavorite: [false],
    });
  }

  ngOnInit(): void {
    this.isAdminRoute = this.router.url.startsWith('/admin');
    this.memoryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.memoryId;

    if (!this.memoryId) {
      this.form.patchValue({ date: new Date().toISOString().slice(0, 10) });
      return;
    }

    this.isLoading = true;
    this.memoryService.getMemoryById(this.memoryId).subscribe({
      next: memory => {
        this.isLoading = false;
        if (!memory || !this.memoryService.canEditMemory(memory)) {
          this.notFound = true;
          return;
        }

        this.form.patchValue({
          title: memory.title,
          description: memory.description,
          date: memory.date,
          imageUrl: memory.imageUrl ?? '',
          category: memory.category,
          mood: memory.mood ?? '',
          privateNote: memory.privateNote ?? '',
          visibleToPartner: memory.visibleToPartner,
          isFavorite: memory.isFavorite,
        });
      },
      error: error => {
        this.isLoading = false;
        this.notFound = true;
        this.errorMessage = error instanceof Error ? error.message : 'Memory could not be loaded.';
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const input: MemoryInput = {
      title: value.title.trim(),
      description: value.description.trim(),
      date: value.date,
      imageUrl: this.optional(value.imageUrl),
      category: value.category,
      mood: this.optional(value.mood),
      privateNote: this.optional(value.privateNote),
      visibleToPartner: value.visibleToPartner,
      isFavorite: value.isFavorite,
    };

    this.isSaving = true;
    this.errorMessage = '';

    const request$ =
      this.isEditMode && this.memoryId
        ? this.memoryService.updateMemory(this.memoryId, input)
        : this.memoryService.addMemory(input);

    request$.subscribe({
      next: () => this.router.navigate([this.returnPath()]),
      error: error => {
        this.isSaving = false;
        this.errorMessage = error instanceof Error ? error.message : 'Memory could not be saved.';
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

  get contextLabel(): string {
    return this.isAdminRoute && this.auth.isAdmin() ? 'Admin / Memories' : 'Our Space / Memories';
  }

  get pageTitle(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Edit Memory' : 'Add Memory';
    }

    return this.isEditMode ? 'Update this shared moment' : 'Save a meaningful moment';
  }

  get pageSubtitle(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Refine a preserved moment.' : 'Save a new moment in the universe.';
    }

    return this.isEditMode
      ? 'Adjust the details and choose whether this stays private or shared.'
      : 'Capture something worth remembering, even if it is small.';
  }

  get saveLabel(): string {
    if (this.isAdminRoute && this.auth.isAdmin()) {
      return this.isEditMode ? 'Save changes' : 'Create memory';
    }

    return this.isEditMode ? 'Save this moment' : 'Add to our memories';
  }

  private returnPath(): string {
    return this.isAdminRoute && this.auth.isAdmin() ? '/admin/memories' : '/memories';
  }
}
