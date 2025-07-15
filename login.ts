import {
  Component,
  signal,
  WritableSignal,
  computed,
  effect,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  UserCredential,
} from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  fb = inject(FormBuilder);
  router = inject(Router);
  auth = inject(Auth);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  emailSignal = signal('');
  passwordSignal = signal('');
  errorMessage = signal('');
  successMessage = signal('');
  submitted = signal(false);
  showPassword = false;

  formValue = computed(() => this.loginForm.value);

  formEffect = effect(() => {
    const { email, password } = this.formValue();
    this.emailSignal.set(email ?? '');
    this.passwordSignal.set(password ?? '');
  });

  sanitizeInput(value: string): string {
    return value?.trim() ?? '';
  }

  onLogin(): void {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill out the form correctly.');
      return;
    }

    const email = this.sanitizeInput(this.loginForm.get('email')?.value || '');
    const password = this.sanitizeInput(
      this.loginForm.get('password')?.value || ''
    );

    if (!email || !password) {
      this.errorMessage.set('Email and password are required.');
      return;
    }

    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential: UserCredential) => {
        console.log('Login successful:', userCredential);
        this.successMessage.set('Login successful!');
        this.router.navigate(['/home']);
      })
      .catch((error: any) => {
        console.error('Firebase error:', error);
        switch (error.code) {
          case 'auth/invalid-email':
            this.errorMessage.set('Invalid email address.');
            break;
          case 'auth/user-not-found':
            this.errorMessage.set('No user found with this email.');
            break;
          case 'auth/wrong-password':
            this.errorMessage.set('Incorrect password.');
            break;
          default:
            this.errorMessage.set('Login failed: ' + error.message);
        }
      });
  }

  forgotPassword(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const email = this.sanitizeInput(this.emailSignal());

    if (!email || !email.includes('@')) {
      this.errorMessage.set(
        'Please enter a valid email to reset the password.'
      );
      return;
    }

    console.log('Sending reset to:', email); // Debug line

    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        this.successMessage.set('✅ Password reset email sent.');
      })
      .catch((error) => {
        console.error('Reset error:', error);
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

  get error() {
    return this.errorMessage();
  }

  get success() {
    return this.successMessage();
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
