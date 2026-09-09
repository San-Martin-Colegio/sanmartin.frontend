import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-primary via-slate-800 to-blue-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <!-- Background subtle elements -->
      <div class="absolute inset-0 bg-[radial-gradient(#d4a843_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      <div class="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 sm:p-10 flex flex-col items-center border border-white/20">
        <!-- Institution Logo -->
        <div class="w-20 h-20 mb-3 p-2 bg-slate-50 rounded-2xl shadow-inner flex items-center justify-center border border-slate-100">
          <img src="assets/logo.png" alt="Logo SMP" class="w-full h-full object-contain" />
        </div>

        <h1 class="text-primary text-2xl font-extrabold text-center tracking-tight">San Martín de Porres</h1>
        <p class="text-slate-500 text-xs font-medium uppercase tracking-wider mb-6 text-center mt-1">
          Sistema de Gestión de Inventario
        </p>

        <!-- Divider with gold accent -->
        <div class="w-full h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent mb-6"></div>

        <!-- Error Message -->
        <div
          *ngIf="errorMessage()"
          class="w-full bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"
        >
          <lucide-icon name="alert-triangle" [size]="16" class="text-rose-600 flex-shrink-0"></lucide-icon>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="w-full space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5" for="username">Usuario</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <lucide-icon name="user" [size]="16"></lucide-icon>
              </div>
              <input
                id="username"
                type="text"
                [(ngModel)]="username"
                name="username"
                placeholder="Ingresa tu usuario"
                required
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5" for="password">Contraseña</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <lucide-icon name="key" [size]="16"></lucide-icon>
              </div>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
                class="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <lucide-icon *ngIf="!showPassword()" name="eye" [size]="16"></lucide-icon>
                <lucide-icon *ngIf="showPassword()" name="eye-off" [size]="16"></lucide-icon>
              </button>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="isLoading() || !username || !password"
            class="w-full btn-primary py-3 rounded-xl font-bold tracking-wide shadow-md shadow-primary/25 mt-2"
          >
            <span *ngIf="!isLoading()">Iniciar Sesión</span>
            <span *ngIf="isLoading()" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Verificando...
            </span>
          </button>
        </form>

        <p class="mt-8 text-xs text-slate-400 text-center font-medium">
          &copy; 2026 Colegio San Martín de Porres. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    if (this.authService.getToken()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  onSubmit() {
    if (!this.username || !this.password) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const detail = err?.error?.message || 'Usuario o contraseña incorrectos.';
        this.errorMessage.set(detail);
      },
    });
  }
}
