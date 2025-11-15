import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/auth/login/login';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard';
import { adminGuard } from './core/guards/admin.guard';
import { HrShellComponent } from './pages/hr/hr-shell';
import { HrEmployeeDashboardComponent } from './pages/hr/employees/employee-dashboard';
import { HrDepartmentsComponent } from './pages/hr/departments/departments.component';
import { HrJobsComponent } from './pages/hr/jobs/jobs.component';
import { HrLeaveComponent } from './pages/hr/leave/leave.component';
import { HrAttendanceComponent } from './pages/hr/attendance/attendance.component';
import { HrPerformanceComponent } from './pages/hr/performance/performance.component';
import { HrTrainingComponent } from './pages/hr/training/training.component';
import { HrOffboardingComponent } from './pages/hr/offboarding/offboarding.component';
import { rolesGuard } from './core/guards/roles.guard';
import { FinanceShellComponent } from './pages/finance/finance-shell';
import { FinanceOverviewComponent } from './pages/finance/overview/finance-overview.component';
import { FinanceExpensesComponent } from './pages/finance/expenses/finance-expenses.component';
import { FinanceInvoicesComponent } from './pages/finance/invoices/finance-invoices.component';
import { FinancePayrollComponent } from './pages/finance/payroll/finance-payroll.component';
import { FinanceBudgetingComponent } from './pages/finance/budgeting/finance-budgeting.component';
import { EmployeeSelfServiceComponent } from './pages/employee/self-service/employee-self-service.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
      {
        path: 'hr',
        component: HrShellComponent,
        canActivate: [rolesGuard],
        data: { roles: ['ADMIN', 'HR'] },
        children: [
          { path: '', redirectTo: 'employees', pathMatch: 'full' },
          { path: 'employees', component: HrEmployeeDashboardComponent },
          { path: 'departments', component: HrDepartmentsComponent },
          { path: 'jobs', component: HrJobsComponent },
          { path: 'leave', component: HrLeaveComponent },
          { path: 'attendance', component: HrAttendanceComponent },
          { path: 'performance', component: HrPerformanceComponent },
          { path: 'training', component: HrTrainingComponent },
          { path: 'offboarding', component: HrOffboardingComponent },
        ],
      },
      {
        path: 'finance',
        component: FinanceShellComponent,
        canActivate: [rolesGuard],
        data: { roles: ['ADMIN', 'FINANCE'] },
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', component: FinanceOverviewComponent },
          { path: 'budgeting', component: FinanceBudgetingComponent },
          { path: 'expenses', component: FinanceExpensesComponent },
          { path: 'invoices', component: FinanceInvoicesComponent },
          { path: 'payroll', component: FinancePayrollComponent },
        ],
      },
      {
        path: 'workspace',
        component: EmployeeSelfServiceComponent,
        canActivate: [rolesGuard],
        data: { roles: ['EMPLOYEE'] },
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
