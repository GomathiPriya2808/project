import { Component, inject, signal } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  fb = inject(FormBuilder);
  auth = inject(Auth);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  sanitizeInput(value: string): string {
    return value.trim();
  }

  forgotPassword() {
    this.successMessage.set('');
    this.errorMessage.set('');

    const email = this.sanitizeInput(this.forgotForm.value.email);

    if (!email) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        this.successMessage.set('✅ Password reset email sent.');
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/user-not-found':
            this.errorMessage.set('No account found with this email.');
            break;
          case 'auth/invalid-email':
            this.errorMessage.set('Invalid email address.');
            break;
          default:
            this.errorMessage.set('Reset failed: ' + error.message);
        }
      });
  }
}
