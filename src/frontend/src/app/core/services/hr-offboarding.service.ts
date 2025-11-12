import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface HrOffboardingStatus {
  employeeId: number;
  status: string;
  lastWorkingDay?: string | null;
  interviewAt?: string | null;
  clearanceFormUrl?: string | null;
  experienceLetterUrl?: string | null;
}

export interface HrOffboardingRequest {
  employeeId: number;
  lastWorkingDay?: string | null;
  interviewAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class HrOffboardingService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/hr/offboarding`;

  status(employeeId: number) {
    return this.http.get<HrOffboardingStatus>(`${this.base}/${employeeId}`);
  }

  initiate(payload: HrOffboardingRequest) {
    return this.http.post<HrOffboardingStatus>(`${this.base}/initiate`, payload);
  }

  interview(payload: HrOffboardingRequest) {
    return this.http.post<HrOffboardingStatus>(`${this.base}/interview`, payload);
  }

  clearance(payload: HrOffboardingRequest) {
    return this.http.put<HrOffboardingStatus>(`${this.base}/clearance`, payload);
  }

  exitDocuments(payload: HrOffboardingRequest) {
    return this.http.post<HrOffboardingStatus>(`${this.base}/exit-documents`, payload);
  }
}
