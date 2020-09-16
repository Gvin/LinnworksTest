import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {UserModel} from '../../models/user.model';
import {mergeMap, catchError, take} from 'rxjs/operators';
import {HttpService} from '../http-service/http.service';
import {LoginModel} from '../../models/login.model';
import {JwtService} from '../jwt-service/jwt.service';
import {HttpErrorResponse} from '@angular/common/http';

const fieldLogin = 'sub';
const fieldId = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const fieldRole = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

const keyCurrentUser = 'urrentUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private httpService: HttpService,
    private jwtService: JwtService
    ) {
  }

  public getCurrentUser(): UserModel {
    const userData = localStorage.getItem(keyCurrentUser);
    if (!userData) {
      return null;
    }
    return JSON.parse(userData);
  }

  public getIfUserLoggedIn(): boolean {
    return !this.jwtService.getIfTokenExpired();
  }

  public getIfUserInRole(roles: string[]): boolean {
    if (!this.getIfUserLoggedIn()) {
      return false;
    }

    var user = this.getCurrentUser();
    for (let index = 0; index < roles.length; index++) {
      const role = roles[index];
      if (user.role.toLowerCase() === role.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  private getUserFromJwt(): UserModel {
    if (this.jwtService.getIfTokenExpired()) {
      return null;
    }

    const decodedToken = this.jwtService.getDecodedJwtToken();
    return this.createUserModel(decodedToken);
  }

  private refreshCurrentUser(): void {
    const currentUser = this.getUserFromJwt();
    localStorage.setItem(keyCurrentUser, JSON.stringify(currentUser));
  }

  private createUserModel(decodedToken: Map<string, string>): UserModel {
    return {
      login: decodedToken[fieldLogin],
      id: decodedToken[fieldId],
      role: decodedToken[fieldRole]
    };
  }

  public logOut(): void {
    this.jwtService.clearJwtToken();
    this.refreshCurrentUser();
  }

  public register(login: string, password: string, avatar?: File): Observable<string[]> {
    const url = '/api/user/register';

    const formData = new FormData();
    formData.append('login', login);
    formData.append('password', password);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    return this.httpService.post(url, formData).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        const errorsMap: Map<string, string[]> = errorResponse.error;
        const errors = Object.keys(errorsMap);
        return throwError(errors);
      }),
      mergeMap((response: any) => {
        if (!response) {
          return of(['Unknown error']);
        }
        const token = response.result;
        this.jwtService.setJwtToken(token);
        this.refreshCurrentUser();
        return of([]);
      })
    );
  }

  public logIn(login: string, password: string): Observable<boolean> {
    const url = '/api/user/login';
    const credentials = {
      login: login,
      password: password
    };

    return this.httpService.post(url, credentials).pipe(
      catchError(() => {
        return of(false);
      }),
      mergeMap((response: LoginModel) => {
        if (!response) {
          return of(false);
        }
        const token = response.result;
        this.jwtService.setJwtToken(token);
        this.refreshCurrentUser();
        return of(true);
      })
    );
  }
}
