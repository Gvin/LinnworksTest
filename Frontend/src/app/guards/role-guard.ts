import {Injectable} from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import {UserService} from '../services/user-service/user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService
    ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.userService.getIfUserLoggedIn()) {
      if (!route.data || !route.data.roles || this.userService.getIfUserInRole(route.data.roles)) {
        return true;
      }
    }
    this.router.navigate(['/access-denied']);
    return false;
  }
}
