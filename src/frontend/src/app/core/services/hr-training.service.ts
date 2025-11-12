import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface HrTraining {
  id: number;
  type?: string;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  instructor: string | null;
  location: string | null;
}

export interface HrTrainingRequest {
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  instructor: string | null;
  location: string | null;
}

export interface HrTrainingEnrollment {
  id: number;
  programId: number;
  programTitle: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  status: string;
  enrolledAt: string;
}

@Injectable({ providedIn: 'root' })
export class HrTrainingService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/training`;

  listPrograms() {
    return this.http.get<HrTraining[]>(this.base);
  }

  createProgram(payload: HrTrainingRequest) {
    return this.http.post<HrTraining>(this.base, payload);
  }

  updateProgram(id: number, payload: HrTrainingRequest) {
    return this.http.put<HrTraining>(`${this.base}/${id}`, payload);
  }

  deleteProgram(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  listEnrollments(programId: number) {
    return this.http.get<HrTrainingEnrollment[]>(`${this.base}/${programId}/enrollments`);
  }
}
