import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginResponse } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
  ) {
    this.clearLegacyStorage();
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((res) => {
        if (res.user) {
          this.currentUser.set(res.user);
        }
      }),
    );
  }

  logout() {
    this.apiService.post('/auth/logout', {}).pipe(
      catchError(() => of(null)),
    ).subscribe();

    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession() {
    this.currentUser.set(null);
    this.clearLegacyStorage();
  }

  private clearLegacyStorage() {
    // Elimina JWT y perfil que versiones anteriores guardaban en almacenamiento
    // accesible desde JavaScript. La sesión vigente vive solo en cookie HttpOnly.
    localStorage.removeItem('smp_token');
    localStorage.removeItem('smp_user');
  }

  refreshProfile(): Observable<User | null> {
    return this.apiService.get<User>('/auth/me').pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  validateSession(): Observable<boolean> {
    if (this.currentUser()) return of(true);
    return this.refreshProfile().pipe(map((user) => !!user));
  }
}
