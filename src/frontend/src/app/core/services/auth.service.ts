import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from './../../environments/environment';

type LoginDto = { email: string; password: string };
export type LoginResponse = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
};
export type AuthUser = Omit<LoginResponse, 'token'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadStoredUser());

  currentUser$ = this.currentUserSubject.asObservable();

  login(dto: LoginDto, remember = false) {
    return this.http.post<LoginResponse>(`${this.base}/login`, dto).pipe(
      tap((res) => this.persistSession(res, remember))
    );
  }

  logout() {
    this.clearStorage(this.getStorage('local'));
    this.clearStorage(this.getStorage('session'));
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return (
      this.getStorage('local')?.getItem('token') ??
      this.getStorage('session')?.getItem('token') ??
      null
    );
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  private persistSession(response: LoginResponse, remember: boolean) {
    const target = this.getStorage(remember ? 'local' : 'session');
    const fallback = this.getStorage(remember ? 'session' : 'local');
    const profile = this.extractUser(response);

    if (target) {
      target.setItem('token', response.token);
      target.setItem('user', JSON.stringify(profile));
    }
    this.clearStorage(fallback);
    this.currentUserSubject.next(profile);
  }

  private extractUser(response: LoginResponse): AuthUser {
    const { token, ...user } = response;
    return user;
  }

  private loadStoredUser(): AuthUser | null {
    const raw =
      this.getStorage('local')?.getItem('user') ?? this.getStorage('session')?.getItem('user');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private clearStorage(store: Storage | null) {
    store?.removeItem('token');
    store?.removeItem('user');
  }

  private getStorage(type: 'local' | 'session'): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return type === 'local' ? window.localStorage : window.sessionStorage;
  }
}
