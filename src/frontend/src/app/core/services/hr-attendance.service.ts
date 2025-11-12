import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface HrAttendance {
  id: number;
  employeeId: number;
  date: string;
  present: boolean;
  workingHours: number | null;
}

@Injectable({ providedIn: 'root' })
export class HrAttendanceService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/attendance`;

  byEmployee(employeeId: number) {
    return this.http.get<HrAttendance[]>(`${this.base}/${employeeId}`);
  }
}
