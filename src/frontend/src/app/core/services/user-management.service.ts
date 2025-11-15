import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type UserRole = 'ADMIN' | 'HR' | 'FINANCE' | 'INVENTORY' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string | null;
}

export interface UserSummary {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  hr: number;
  finance: number;
  inventory: number;
  employees: number;
}

export interface InviteUserDto {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string | null;
}

export interface InviteUserResponse {
  user: UserResponse;
  temporaryPassword: string;
}

export interface UpdateUserDto {
  fullName?: string | null;
  phone?: string | null;
  role?: UserRole | null;
  status?: UserStatus | null;
  password?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/auth/admin/users`;

  listUsers() {
    return this.http.get<UserResponse[]>(this.base);
  }

  summary() {
    return this.http.get<UserSummary>(`${this.base}/summary`);
  }

  inviteUser(dto: InviteUserDto) {
    return this.http.post<InviteUserResponse>(this.base, dto);
  }

  updateUser(id: number, dto: UpdateUserDto) {
    return this.http.patch<UserResponse>(`${this.base}/${id}`, dto);
  }
}
