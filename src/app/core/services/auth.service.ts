import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginResponse } from '../models/models';

const TOKEN_KEY = 'smp_token';
const USER_KEY = 'smp_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        this.token.set(storedToken);
        this.currentUser.set(JSON.parse(storedUser));
      }
    } catch {
      this.clearStorage();
    }
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((res) => {
        if (res.accessToken && res.user) {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.token.set(res.accessToken);
          this.currentUser.set(res.user);
        }
      }),
    );
  }

  logout() {
    this.apiService.post('/auth/logout', {}).pipe(
      catchError(() => of(null)),
    ).subscribe();

    this.clearStorage();
    this.router.navigate(['/login']);
  }

  private clearStorage() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  refreshProfile(): Observable<User | null> {
    if (!this.token()) return of(null);
    return this.apiService.get<User>('/auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }
}
