import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {UserModel} from '../../models/user.model';
import {UserService} from '../../services/user-service/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnDestroy {
  private userSubscription: Subscription;

  constructor(
    private userService: UserService,
    private router: Router
    ) {
  }

  public getIfUserLoggedIn(): boolean {
    return this.userService.getIfUserLoggedIn();
  }

  public get currentUser(): UserModel {
    return this.userService.getCurrentUser();
  }

  public ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  public handleLogOutClick(): void {
    this.userService.logOut();
    this.router.navigate(['/']);
  }
}
