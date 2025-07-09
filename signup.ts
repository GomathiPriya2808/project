import {
  Component,
  signal,
  computed,
  effect,
  inject,
  WritableSignal,
  Input,
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
  createUserWithEmailAndPassword,
  UserCredential,
} from '@angular/fire/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  // Signals
  nameSignal = signal('');
  emailSignal = signal('');
  passwordSignal = signal('');
  submitted = signal(false);
  isLoading = signal(false);
  // Input Signals (optional from parent)
  @Input({ required: true }) defaultName!: WritableSignal<string>;
  @Input({ required: true }) defaultEmail!: WritableSignal<string>;

  // Firebase & Angular services
  fb = inject(FormBuilder);
  auth = inject(Auth);
  router = inject(Router);

  // Reactive Form
  signupForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/),
      ],
    ],
  });

  // Form value as signal
  formValue = computed(() => this.signupForm.value);

  // Reactive side-effect to sync signals with form values
  formEffect = effect(() => {
    const { name, email, password } = this.formValue();
    this.nameSignal.set(name);
    this.emailSignal.set(email);
    this.passwordSignal.set(password);
  });

  // Trim helper
  sanitizeInput(value: string): string {
    return value.trim();
  }

  // Submit Handler

  async onSubmit(): Promise<void> {
    this.submitted.set(true);

    if (this.signupForm.invalid) {
      console.warn('Form is invalid');
      return;
    }

    const name = this.sanitizeInput(this.signupForm.value.name);
    const email = this.sanitizeInput(this.signupForm.value.email);
    const password = this.sanitizeInput(this.signupForm.value.password);

    const formData = { name, email,password };
    localStorage.setItem('formdata', JSON.stringify(formData));

    this.isLoading.set(true); // Start loader

    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(this.auth, email, password);

      console.log('Signup successful:', userCredential);
      alert('Signup successful!');
      this.signupForm.reset();
      this.submitted.set(false);
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Firebase error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('This email is already registered.');
          break;
        case 'auth/invalid-email':
          alert('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          alert(
            'Password should be at least 6 characters and include uppercase, number, and special character.'
          );
          break;
        default:
          alert('Signup failed: ' + error.message);
      }
    } finally {
      this.isLoading.set(false); // Stop loader
    }
  }
}
