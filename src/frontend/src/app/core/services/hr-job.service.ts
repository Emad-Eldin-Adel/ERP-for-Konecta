import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type JobStatus = 'OPEN' | 'ON_HOLD' | 'CLOSED';

export interface HrJob {
  id: number;
  title: string;
  description: string;
  departmentId: number | null;
  departmentName: string | null;
  location: string | null;
  employmentType: string | null;
  status: JobStatus | null;
}

export interface HrJobRequest {
  title: string;
  description: string;
  departmentId: number | null;
  location: string | null;
  employmentType: string | null;
  status: string | null;
}

@Injectable({ providedIn: 'root' })
export class HrJobService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/jobs`;

  list() {
    return this.http.get<HrJob[]>(this.base);
  }

  create(payload: HrJobRequest) {
    return this.http.post<HrJob>(this.base, payload);
  }

  update(id: number, payload: HrJobRequest) {
    return this.http.put<HrJob>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
