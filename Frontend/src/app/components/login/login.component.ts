import {Component} from '@angular/core';
import {UserService} from '../../services/user-service/user.service';
import {take} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginField = new FormControl('', [Validators.required]);
  public passwordField = new FormControl('', [Validators.required]);
  public loginError = false;

  constructor(
    private userService: UserService,
    private router: Router
    ) {
  }

  public hasRequiredError(field: FormControl): boolean {
    return field.hasError('required');
  }

  public handleLogInClick(): void {
    this.loginField.markAsTouched();
    this.passwordField.markAsTouched();

    const login = this.loginField.value;
    const password = this.passwordField.value;

    if (this.loginField.invalid || this.passwordField.invalid) {
      return;
    }

    this.userService.logIn(login, password).pipe(
      take(1)
    ).subscribe(result => {
      this.loginError = !result;
      if (result) {
        this.router.navigate(['/']);
      }
    });
  }
}
