import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface HrLeave {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
}

@Injectable({ providedIn: 'root' })
export class HrLeaveService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/leaves`;

  listAll() {
    return this.http.get<HrLeave[]>(this.base);
  }

  approve(id: number) {
    return this.http.put<HrLeave>(`${this.base}/${id}/approve`, {});
  }

  reject(id: number) {
    return this.http.put<HrLeave>(`${this.base}/${id}/reject`, {});
  }
}
