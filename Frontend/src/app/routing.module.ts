import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './guards/auth-guard';
import {RoleGuard} from './guards/role-guard';
import {DataGridComponent} from './components/data-grid/data-grid.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';

const routes: Routes = [
  {path: '', component: DataGridComponent, pathMatch: 'full', canActivate: [AuthGuard]},
  {path: 'users', component: UsersListComponent, pathMatch: 'full', data: {roles: ['Administrator']}, canActivate: [AuthGuard, RoleGuard]},
  // {path: '', component: PostsLineComponent, pathMatch: 'full'},
  // {path: 'post/create', component: CreatePostComponent, canActivate: [AuthGuard]},
  // {path: 'post/:id', component: PostDetailComponent},
  {path: 'login', component: LoginComponent},
  {path: 'access-denied', component: AccessDeniedComponent}
  // {path: 'register', component: RegisterComponent},
  // {path: ':page', component: PostsLineComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
