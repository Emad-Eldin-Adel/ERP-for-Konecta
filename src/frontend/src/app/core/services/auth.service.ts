import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

type LoginDto = { email: string; password: string };
type LoginResponse = { token: string; user?: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/auth`;

  login(dto: LoginDto) {
    // adjust endpoint to your auth microservice route if different
    return this.http.post<LoginResponse>(`${this.base}/login`, dto);
  }

  saveToken(token: string, remember: boolean) {
    const store = remember ? localStorage : sessionStorage;
    store.setItem('token', token);
    if (!remember) localStorage.removeItem('token'); // keep a single source
  }

  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  get token(): string | null {
    return localStorage.getItem('token') ?? sessionStorage.getItem('token');
  }
}
