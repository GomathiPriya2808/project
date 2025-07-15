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
  GoogleAuthProvider,
  UserCredential,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { signInWithPopup } from 'firebase/auth';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  nameSignal = signal('');
  emailSignal = signal('');
  passwordSignal = signal('');
  submitted = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  @Input({ required: true }) defaultName!: WritableSignal<string>;
  @Input({ required: true }) defaultEmail!: WritableSignal<string>;

  fb = inject(FormBuilder);
  auth = inject(Auth);
  router = inject(Router);
  firestore = inject(Firestore);
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

  async onSubmit(): Promise<void> {
    this.submitted.set(true);

    if (this.signupForm.invalid) {
      console.warn('Form is invalid');
      return;
    }

    const name = this.sanitizeInput(this.signupForm.value.name);
    const email = this.sanitizeInput(this.signupForm.value.email);
    const password = this.sanitizeInput(this.signupForm.value.password);

    const formData = { name, email, password };
    localStorage.setItem('formdata', JSON.stringify(formData));
    this.isLoading.set(true);

    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(this.firestore, 'users', uid), {
        uid,
        name,
        email,
        createdAt: new Date().toISOString(),
      });
      this.successMessage.set('signup successfull');
      this.signupForm.reset();
      this.submitted.set(false);
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Firebase error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage.set('This email is already registered.');
          break;
        case 'auth/invalid-email':
          this.errorMessage.set('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          this.errorMessage.set(
            'Password should be at least 6 characters and include uppercase, number, and special character.'
          );
          break;
        default:
          this.errorMessage.set('Signup failed: ' + error.message);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // Save user to Firestore
      await setDoc(doc(this.firestore, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        provider: 'google',
        createdAt: new Date().toISOString(),
      });

      console.log('Logged in', user.displayName);
      this.router.navigate(['/home']);
    } catch (error) {
      console.log('Google sign-in error:', error);
    }
  }
}
