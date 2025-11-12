import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface HrEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  hireDate: string | null;
  salary: number | null;
  workingHours: number | null;
  departmentId: number | null;
  departmentName: string | null;
}

export interface HrEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  hireDate: string | null;
  salary: number | null;
  workingHours: number | null;
  departmentId: number | null;
}

@Injectable({ providedIn: 'root' })
export class HrEmployeeService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/employees`;

  list() {
    return this.http.get<HrEmployee[]>(this.base);
  }

  create(payload: HrEmployeeRequest) {
    return this.http.post<HrEmployee>(this.base, payload);
  }

  update(id: number, payload: HrEmployeeRequest) {
    return this.http.put<HrEmployee>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
