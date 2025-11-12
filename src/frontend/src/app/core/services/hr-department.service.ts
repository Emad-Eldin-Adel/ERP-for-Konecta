import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface HrDepartment {
  id: number;
  name: string;
  description: string;
}

export type HrDepartmentRequest = Omit<HrDepartment, 'id'>;

@Injectable({ providedIn: 'root' })
export class HrDepartmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/departments`;

  list() {
    return this.http.get<HrDepartment[]>(this.base);
  }

  create(payload: HrDepartmentRequest) {
    return this.http.post<HrDepartment>(this.base, payload);
  }

  update(id: number, payload: HrDepartmentRequest) {
    return this.http.put<HrDepartment>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
