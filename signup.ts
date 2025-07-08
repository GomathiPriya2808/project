import {
  Component,
  computed,
  effect,
  inject,
  Input,
  Output,
  signal,
  WritableSignal,
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
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [ReactiveFormsModule, RouterLink],
})
export class Signup {
  nameSignal = signal('');
  emailSignal = signal('');
  passwordSignal = signal('');
  submitted = signal(false);

  @Input({ required: true }) defaultName!: WritableSignal<string>;
  @Input({ required: true }) defaultEmail!: WritableSignal<string>;
  @Output() userRegistered = signal<{ name: string; email: string } | null>(
    null
  );

  fb = inject(FormBuilder);
  auth = inject(Auth);
  router = inject(Router);

  signupForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/),
      ],
    ],
  });

  formValue = computed(() => this.signupForm.value);

  formEffect = effect(() => {
    const { name, email, password } = this.formValue();
    this.nameSignal.set(name);
    this.emailSignal.set(email);
    this.passwordSignal.set(password);
  });

  sanitizeInput(value: string): string {
    return value.trim();
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.signupForm.invalid) {
      console.warn('Form is invalid');
      return;
    }

    const name = this.sanitizeInput(this.formValue().name);
    const email = this.sanitizeInput(this.formValue().email);
    const password = this.formValue().password;

    const formData = { name, email, password };
    localStorage.setItem('formdata', JSON.stringify(formData));

    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential: UserCredential) => {
        console.log('Signup successful:', userCredential);
        this.userRegistered.set({ name, email });
        alert('Signup successful!');
        this.router.navigate(['login']);
      })
      .catch((error: any) => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            alert('This email is already registered.');
            break;
          case 'auth/invalid-email':
            alert('Please enter a valid email address.');
            break;
          case 'auth/weak-password':
            alert('Password should be at least 6 characters.');
            break;
          default:
            alert('Signup failed: ' + error.message);
        }
      });
  }
}
