import {
  Component,
  signal,
  WritableSignal,
  effect,
  computed,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  UserCredential,
  sendPasswordResetEmail,
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

  emailSignal: WritableSignal<string> = signal('');
  passwordSignal: WritableSignal<string> = signal('');
  errorMessage: WritableSignal<string> = signal('');
  submitted: WritableSignal<boolean> = signal(false);

  formValue = computed(() => this.loginForm.value);

  formEffect = effect(() => {
    const { email, password } = this.formValue();
    this.emailSignal.set(email);
    this.passwordSignal.set(password);
  });

  onLogin() {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      console.warn('Form is invalid');
      return;
    }

    const email = this.loginForm.value.email?.trim();
    const password = this.loginForm.value.password;

    console.log('Logging in with:', email, password);

    if (!email || !password) {
      this.errorMessage.set('Email and password are required.');
      return;
    }

    localStorage.setItem('formdata', JSON.stringify({ email, password }));

    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential: UserCredential) => {
        console.log('Login successful:', userCredential);
        this.router.navigate(['/home']);
      })
      .catch((error: any) => {
        console.error('Login error:', error);
        this.errorMessage.set('Login failed: ' + error.message);
      });
  }
}
