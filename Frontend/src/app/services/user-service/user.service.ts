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

    public getUsers(filter: string, sortDirection: string, pageIndex: number, pageSize: number): Observable<UserModel[]> {
        return this.httpService.get<UserModel[]>('/api/user/list', {
            'filter': filter, 
            'sort': sortDirection,
            'pageIndex': pageIndex.toString(), 
            'pageSize': pageSize.toString()
        });
    }

    public getUsersCount(filter: string): Observable<number> {
        return this.httpService.get<number>('/api/user/count', {'filter': filter});
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

    public create(login: string, password: string, role: string): Observable<string[]> {
        const url = '/api/user/create';

        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);
        formData.append('role', role);

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
                return of([]);
            })
        );
    }

    public delete(id: string): Observable<boolean> {
        const url = '/api/user/delete';

        const formData = new FormData();
        formData.append('userId', id);

        return this.httpService.post<boolean>(url, formData).pipe(
            catchError((error) => {
                console.error('Error while trying to delete user', error)
                return of(false);
            })
        );
    }

    public update(user: UserModel): Observable<boolean> {
        const url = '/api/user/update';

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('login', user.login);
        formData.append('role', user.role);

        return this.httpService.post<boolean>(url, formData).pipe(
            catchError((error) => {
                console.error('Error while trying to update user data', error)
                return of(false)
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
            catchError((error) => {
                console.error('Error while trying log in', error)
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
