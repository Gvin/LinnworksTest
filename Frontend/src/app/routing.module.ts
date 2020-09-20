import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './guards/auth-guard';
import {RoleGuard} from './guards/role-guard';
import {SalesListComponent} from './components/sales-list/sales-list.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import {Roles} from './models/user.model';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { CreateSalesDataComponent } from './components/create-sales-data/create-sales-data.component';
import { ImportSalesComponent } from './components/import-sales/import-sales.component';
import { StatisticsListComponent } from './components/statistics-list/statistics-list.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'sales'},
  {path: 'sales', component: SalesListComponent, pathMatch: 'full', data: {roles: [Roles.Admin, Roles.Manager, Roles.Reader]}, canActivate: [AuthGuard, RoleGuard]},
  {path: 'sales/create', component: CreateSalesDataComponent, pathMatch: 'full', data: {roles: [Roles.Admin, Roles.Manager]}, canActivate: [AuthGuard, RoleGuard]},
  {path: 'sales/import', component: ImportSalesComponent, pathMatch: 'full', data: {roles: [Roles.Admin, Roles.Manager]}, canActivate: [AuthGuard, RoleGuard]},
  {path: 'statistics', component: StatisticsListComponent, pathMatch: 'full', data: {roles: [Roles.Admin, Roles.Manager, Roles.Reader]}, canActivate: [AuthGuard, RoleGuard]},
  {path: 'users/create', component: CreateUserComponent, pathMatch: 'full', data: {roles: [Roles.Admin]}, canActivate: [AuthGuard, RoleGuard]},
  {path: 'users', component: UsersListComponent, pathMatch: 'full', data: {roles: [Roles.Admin]}, canActivate: [AuthGuard, RoleGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'access-denied', component: AccessDeniedComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
