import { Component, inject, signal } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
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

    const actionCodeSettings = {
      url: 'https://bakery-ac000.web.app/password-changed', // ✅ Replace with your hosted page
      handleCodeInApp: false,
    };

    sendPasswordResetEmail(this.auth, email, actionCodeSettings)
      .then(() => {
        this.successMessage.set(
          '✅ Password reset email sent. Please check your inbox.'
        );
      })
      .catch((error) => {
        console.error('Password reset error:', error);
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
