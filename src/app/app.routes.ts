import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { TeachersComponent } from './pages/teachers/teachers.component';
import { SchedulesComponent } from './pages/schedules/schedules.component';
import { SchoolComponent } from './pages/school/school.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'inventory',
        component: InventoryComponent,
      },
      {
        path: 'categories',
        component: CategoriesComponent,
      },
      {
        path: 'teachers',
        component: TeachersComponent,
      },
      {
        path: 'schedules',
        component: SchedulesComponent,
      },
      {
        path: 'school',
        component: SchoolComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/admin/dashboard',
  },
];
