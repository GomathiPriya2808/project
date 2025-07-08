import { Component } from '@angular/core';
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
  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: Auth
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      console.warn('Form is invalid');
      return;
    }

    const { name, email, password } = this.signupForm.value;

    const formData = { name, email, password };
    localStorage.setItem('formdata', JSON.stringify(formData));

    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential: UserCredential) => {
        console.log('Signup successful:', userCredential);

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
        }
      });
  }
}
