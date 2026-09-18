import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, IconsModule],
  template: `
    <div class="min-h-screen bg-[#f6f8fc] flex flex-col">
      <!-- Top Header -->
      <header class="fixed top-0 left-0 right-0 h-[4.5rem] bg-gradient-to-r from-primary-dark via-primary to-[#274c78] text-white flex items-center justify-between px-4 lg:px-7 z-40 shadow-lg shadow-primary/15 border-b border-white/10">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Toggle Button -->
          <button
            type="button"
            (click)="toggleSidebar()"
            class="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Logo & Title -->
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-white/10 border border-white/15 p-1.5 backdrop-blur-sm"><img src="assets/logo.png" alt="SMP Logo" class="h-full w-full object-contain drop-shadow-sm" /></div>
            <div>
              <h1 class="text-base font-bold tracking-tight text-white leading-tight">San Martín de Porres</h1>
              <p class="text-[11px] text-blue-100/80 font-medium tracking-wide">Gestión Institucional</p>
            </div>
          </div>
        </div>

        <!-- User profile & Logout -->
        <div class="flex items-center gap-4">
          <div class="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
            <div class="w-6 h-6 rounded-full bg-secondary text-primary-dark font-bold text-xs flex items-center justify-center">
              {{ (authService.currentUser()?.fullName || 'A').charAt(0).toUpperCase() }}
            </div>
            <span class="text-xs font-medium text-white max-w-[150px] truncate">
              {{ authService.currentUser()?.fullName || 'Administrador' }}
            </span>
          </div>

          <button
            type="button"
            (click)="logout()"
            class="bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-rose-400/20"
          >
            <span>Cerrar Sesión</span>
            <lucide-icon name="log-out" [size]="14"></lucide-icon>
          </button>
        </div>
      </header>

      <!-- Sidebar + Main content layout -->
      <div class="flex flex-1 pt-[4.5rem]">
        <!-- Sidebar Navigation -->
        <aside
          class="fixed left-0 top-[4.5rem] bottom-0 w-[17rem] bg-white/95 backdrop-blur-xl border-r border-slate-200/80 z-30 transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-[4px_0_18px_rgba(15,23,42,.025)]"
          [ngClass]="{
            'translate-x-0': isSidebarOpen(),
            '-translate-x-full lg:translate-x-0': !isSidebarOpen()
          }"
        >
          <nav class="p-4 space-y-1.5 overflow-y-auto flex-1">
            <a
              routerLink="/admin/dashboard"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/20 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
            >
              <lucide-icon name="layout-dashboard" [size]="18" class="group-hover:scale-110 transition-transform"></lucide-icon>
              <span>Dashboard</span>
            </a>

            <a
              routerLink="/admin/computers"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/20 font-semibold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
            >
              <lucide-icon name="monitor" [size]="18" class="group-hover:scale-110 transition-transform"></lucide-icon>
              <span>Cómputo</span>
            </a>

            <a
              routerLink="/admin/categories"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/20 font-semibold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
            >
              <lucide-icon name="tags" [size]="18" class="group-hover:scale-110 transition-transform"></lucide-icon>
              <span>Áreas / Zonas y Materiales</span>
            </a>

            <a
              routerLink="/admin/teachers"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/20 font-semibold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
            >
              <lucide-icon name="graduation-cap" [size]="18" class="group-hover:scale-110 transition-transform"></lucide-icon>
              <span>Docentes</span>
            </a>

            <a
              routerLink="/admin/schedules"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/20 font-semibold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
            >
              <lucide-icon name="calendar" [size]="18" class="group-hover:scale-110 transition-transform"></lucide-icon>
              <span>Horarios</span>
            </a>

            <a
              routerLink="/admin/school"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/20 font-semibold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
            >
              <lucide-icon name="school" [size]="18" class="group-hover:scale-110 transition-transform"></lucide-icon>
              <span>Colegio</span>
            </a>
          </nav>

          <!-- Sidebar Footer -->
          <div class="p-4 border-t border-slate-100 bg-slate-50/70 text-center">
            <div class="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Conectado
            </div>
            <p class="text-[11px] text-slate-400 mt-1">v2.0.0 &copy; 2026 Colegio SMP</p>
          </div>
        </aside>

        <!-- Mobile overlay -->
        <div
          *ngIf="isSidebarOpen()"
          (click)="toggleSidebar()"
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden"
        ></div>

        <!-- Main Content Area -->
        <main class="flex-1 lg:ml-[17rem] p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4.5rem)] max-w-[96rem] w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Toast notifications -->
      <app-toast></app-toast>
    </div>
  `,
})
export class AdminLayoutComponent {
  isSidebarOpen = signal(false);

  constructor(public authService: AuthService) {}

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
  }
}
