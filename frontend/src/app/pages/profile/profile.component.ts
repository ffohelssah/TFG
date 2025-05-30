import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { User } from '@models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-6 max-w-4xl">
      <h1 class="text-3xl font-bold mb-8 text-gray-900 profile-title">My Profile</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Personal Information -->
        <div class="bg-white dark:bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6 text-gray-900 profile-subtitle">Personal Information</h2>
          
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="space-y-4">
              <!-- Username -->
              <div>
                <label for="username" class="block text-sm font-medium text-gray-900 mb-1 profile-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  formControlName="username"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="profileForm.get('username')?.invalid && profileForm.get('username')?.touched"
                />
                <div *ngIf="profileForm.get('username')?.invalid && profileForm.get('username')?.touched" class="text-red-500 text-sm mt-1">
                  <span *ngIf="profileForm.get('username')?.errors?.['required']">Username is required</span>
                  <span *ngIf="profileForm.get('username')?.errors?.['minlength']">Minimum 3 characters</span>
                </div>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-900 mb-1 profile-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                />
                <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
                  <span *ngIf="profileForm.get('email')?.errors?.['required']">Email is required</span>
                  <span *ngIf="profileForm.get('email')?.errors?.['email']">Email is invalid</span>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex space-x-3 pt-4">
                <button
                  type="submit"
                  [disabled]="profileForm.invalid || isUpdatingProfile"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {{ isUpdatingProfile ? 'Updating...' : 'Update information' }}
                </button>
                <button
                  type="button"
                  (click)="resetProfileForm()"
                  class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="bg-white dark:bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6 text-gray-900 profile-subtitle">Change Password</h2>
          
          <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()">
            <div class="space-y-4">
              <!-- Current Password -->
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-900 mb-1 profile-label">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  formControlName="currentPassword"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched"
                />
                <div *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched" class="text-red-500 text-sm mt-1">
                  Current password is required
                </div>
              </div>

              <!-- New Password -->
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-900 mb-1 profile-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  formControlName="newPassword"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
                />
                <div *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched" class="text-red-500 text-sm mt-1">
                  <span *ngIf="passwordForm.get('newPassword')?.errors?.['required']">New password is required</span>
                  <span *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Minimum 6 characters</span>
                </div>
              </div>

              <!-- Confirm Password -->
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-900 mb-1 profile-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched"
                />
                <div *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched" class="text-red-500 text-sm mt-1">
                  <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
                  <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex space-x-3 pt-4">
                <button
                  type="submit"
                  [disabled]="passwordForm.invalid || isUpdatingPassword"
                  class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {{ isUpdatingPassword ? 'Changing...' : 'Change Password' }}
                </button>
                <button
                  type="button"
                  (click)="resetPasswordForm()"
                  class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="mt-8 bg-red-50 dark:bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 text-red-900 dark:text-red-900">Danger Zone</h2>
        <p class="text-red-700 dark:text-red-700 mb-4">
          Once you delete your account, you cannot recover it. This action is permanent.
        </p>
        
        <button
          (click)="showDeleteConfirmation = true"
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
          Delete Account
        </button>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-white rounded-lg p-6 max-w-md w-full mx-4 modal-bg-white">
          <h3 class="text-lg font-semibold mb-4 modal-text-black">Confirm Account Deletion</h3>
          <p class="modal-text-gray mb-4">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <p class="modal-text-gray mb-6">
            Type <strong class="modal-text-black">"DELETE"</strong> to confirm:
          </p>
          
          <input
            type="text"
            [(ngModel)]="deleteConfirmationText"
            placeholder="Type DELETE"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 modal-input"
          />
          
          <div class="flex space-x-3">
            <button
              (click)="deleteAccount()"
              [disabled]="deleteConfirmationText !== 'DELETE' || isDeletingAccount"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ isDeletingAccount ? 'Deleting...' : 'Delete Account' }}
            </button>
            <button
              (click)="cancelDelete()"
              class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Mensajes de éxito/error -->
      <div *ngIf="successMessage" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .container {
      background-color: #f9fafb;
      min-height: calc(100vh - 64px);
    }
    
    .dark .container {
      background-color: #f9fafb;
    }
    
    /* Forzar que los labels siempre sean negros */
    :host ::ng-deep label,
    :host ::ng-deep .profile-label {
      color: #111827 !important; /* gray-900 - siempre negro */
    }
    
    :host ::ng-deep .dark label,
    :host ::ng-deep .dark .profile-label,
    :host ::ng-deep body.dark label,
    :host ::ng-deep body.dark .profile-label {
      color: #111827 !important; /* gray-900 - siempre negro */
    }
    
    /* Forzar que los títulos y subtítulos siempre sean negros */
    :host ::ng-deep .profile-title,
    :host ::ng-deep .profile-subtitle {
      color: #111827 !important; /* gray-900 - siempre negro */
    }
    
    :host ::ng-deep .dark .profile-title,
    :host ::ng-deep .dark .profile-subtitle,
    :host ::ng-deep body.dark .profile-title,
    :host ::ng-deep body.dark .profile-subtitle {
      color: #111827 !important; /* gray-900 - siempre negro */
    }
    
    /* Asegurar que los textos de error se mantengan rojos */
    :host ::ng-deep .text-red-500,
    :host ::ng-deep .dark .text-red-500,
    :host ::ng-deep body.dark .text-red-500 {
      color: #EF4444 !important; /* red-500 */
    }
    
    /* Asegurar que los textos de la zona de peligro se mantengan en colores apropiados */
    :host ::ng-deep .text-red-900,
    :host ::ng-deep .dark .text-red-900,
    :host ::ng-deep body.dark .text-red-900 {
      color: #7F1D1D !important; /* red-900 */
    }
    
    :host ::ng-deep .text-red-700,
    :host ::ng-deep .dark .text-red-700,
    :host ::ng-deep body.dark .text-red-700 {
      color: #B91C1C !important; /* red-700 */
    }
    
    /* Estilos para el modal de eliminación de cuenta */
    .modal-bg-white {
      background-color: white !important;
    }
    
    .modal-text-black {
      color: #111827 !important;
    }
    
    .modal-text-black * {
      color: #111827 !important;
    }
    
    .modal-text-gray {
      color: #4B5563 !important;
    }
    
    .modal-text-gray * {
      color: #4B5563 !important;
    }
    
    .modal-input {
      color: #111827 !important;
      background-color: white !important;
    }
    
    .modal-input::placeholder {
      color: #6B7280 !important;
    }
    
    .modal-input:focus {
      color: #111827 !important;
      background-color: white !important;
    }
    
    /* Force styles for dark mode in modal */
    :host ::ng-deep .dark .modal-bg-white {
      background-color: white !important;
    }
    
    :host ::ng-deep .dark .modal-text-black {
      color: #111827 !important;
    }
    
    :host ::ng-deep .dark .modal-text-black * {
      color: #111827 !important;
    }
    
    :host ::ng-deep .dark .modal-text-gray {
      color: #4B5563 !important;
    }
    
    :host ::ng-deep .dark .modal-text-gray * {
      color: #4B5563 !important;
    }
    
    :host ::ng-deep .dark .modal-input {
      color: #111827 !important;
      background-color: white !important;
    }
    
    :host ::ng-deep .dark .modal-input::placeholder {
      color: #6B7280 !important;
    }
    
    :host ::ng-deep .dark .modal-input:focus {
      color: #111827 !important;
      background-color: white !important;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null = null;
  
  isUpdatingProfile = false;
  isUpdatingPassword = false;
  isDeletingAccount = false;
  
  showDeleteConfirmation = false;
  deleteConfirmationText = '';
  
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email
        });
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      const confirmControl = form.get('confirmPassword');
      if (confirmControl?.errors?.['passwordMismatch']) {
        delete confirmControl.errors['passwordMismatch'];
        if (Object.keys(confirmControl.errors).length === 0) {
          confirmControl.setErrors(null);
        }
      }
    }
    return null;
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdatingProfile = true;
      const formData = this.profileForm.value;
      
      this.authService.updateProfile(formData).subscribe({
        next: (response) => {
          this.isUpdatingProfile = false;
          this.showSuccessMessage('Profile updated successfully');
        },
        error: (error) => {
          this.isUpdatingProfile = false;
          this.showErrorMessage(error.error?.message || 'Error updating profile');
        }
      });
    }
  }

  updatePassword(): void {
    if (this.passwordForm.valid) {
      this.isUpdatingPassword = true;
      const formData = this.passwordForm.value;
      
      this.authService.updatePassword(formData).subscribe({
        next: (response) => {
          this.isUpdatingPassword = false;
          this.showSuccessMessage('Password updated successfully');
          this.resetPasswordForm();
        },
        error: (error) => {
          this.isUpdatingPassword = false;
          this.showErrorMessage(error.error?.message || 'Error updating password');
        }
      });
    }
  }

  deleteAccount(): void {
    if (this.deleteConfirmationText === 'DELETE') {
      this.isDeletingAccount = true;
      
      this.authService.deleteAccount().subscribe({
        next: () => {
          this.isDeletingAccount = false;
          this.showSuccessMessage('Account deleted successfully. Redirecting...');
          setTimeout(() => {
            this.authService.logout();
          }, 2000);
        },
        error: (error) => {
          this.isDeletingAccount = false;
          this.showErrorMessage(error.error?.message || 'Error deleting account');
        }
      });
    }
  }

  resetProfileForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        username: this.currentUser.username,
        email: this.currentUser.email
      });
    }
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.deleteConfirmationText = '';
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
} 