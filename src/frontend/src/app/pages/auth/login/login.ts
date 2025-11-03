import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  submitting = false;
  serverError = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  get f() {
    return this.form.controls;
  }

  async submit() {
    this.serverError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { email, password, remember } = this.form.value as any;

    this.auth.login({ email, password }).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token, !!remember);
        this.router.navigateByUrl('/'); // go home (or /dashboard)
      },
      error: (err) => {
        this.serverError =
          err?.error?.s_message || err?.error?.C_message || 'Login failed. Please try again.';
        this.submitting = false;
      },
      complete: () => (this.submitting = false),
    });
  }
}
