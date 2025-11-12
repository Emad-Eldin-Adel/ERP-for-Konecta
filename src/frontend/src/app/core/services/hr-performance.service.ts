import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface HrPerformance {
  id: number;
  employeeId: number;
  rating: number;
  feedback: string;
  reviewDate: string;
}

export interface HrPerformanceRequest {
  employeeId: number;
  rating: number;
  feedback: string;
  reviewDate: string;
}

@Injectable({ providedIn: 'root' })
export class HrPerformanceService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/performance`;

  byEmployee(employeeId: number) {
    return this.http.get<HrPerformance[]>(`${this.base}/${employeeId}`);
  }

  create(payload: HrPerformanceRequest) {
    return this.http.post<HrPerformance>(this.base, payload);
  }
}
