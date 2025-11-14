import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface HrAttendance {
  id: number;
  employeeId: number;
  employeeName: string | null;
  employeeEmail: string | null;
  date: string;
  present: boolean;
  workingHours: number | null;
  checkInAt: string | null;
  checkOutAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class HrAttendanceService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/attendance`;

  list(search?: string) {
    const options = search && search.trim().length
      ? { params: { search: search.trim() } }
      : {};
    return this.http.get<HrAttendance[]>(this.base, options);
  }

  byEmployee(employeeId: number) {
    return this.http.get<HrAttendance[]>(`${this.base}/${employeeId}`);
  }

  byEmail(email: string) {
    const encoded = encodeURIComponent(email.trim());
    return this.http.get<HrAttendance[]>(`${this.base}?email=${encoded}`);
  }

  mine() {
    return this.http.get<HrAttendance[]>(`${this.base}/me`);
  }

  checkIn() {
    return this.http.post<HrAttendance>(`${this.base}/check-in`, {});
  }

  checkOut() {
    return this.http.post<HrAttendance>(`${this.base}/check-out`, {});
  }
}
