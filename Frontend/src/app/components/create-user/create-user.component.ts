import {Component} from '@angular/core';
import { Roles} from 'src/app/models/user.model';
import {FormControl, Validators} from '@angular/forms';
import { UserService } from 'src/app/services/user-service/user.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent {
    public loginField = new FormControl('', [Validators.required]);
    public passwordField = new FormControl('', [Validators.required]);
    public roleField = new FormControl('');
    public creationError = false;

    constructor(
        private userService: UserService,
        private router: Router
        ) {

        this.roleField.setValue(Roles.Reader);
        this.roleField.markAsDirty();
    }

    public hasRequiredError(field: FormControl): boolean {
        return field.hasError('required');
    }

    public handleCancelClick(): void {
        this.router.navigate(['/users']);
    }

    public handleCreateClick(): void {
        this.loginField.markAsTouched();
        this.passwordField.markAsTouched();
        this.roleField.markAsTouched();

        const login = this.loginField.value;
        const password = this.passwordField.value;
        const role = this.roleField.value;

        if (this.loginField.invalid || this.passwordField.invalid || this.roleField.invalid) {
            return;
        }

        this.userService.register(login, password, role).pipe(
            take(1)
          ).subscribe(result => {
            this.creationError = !result;
            if (result) {
              this.router.navigate(['/users']);
            }
          });
    }
}
