import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { UserModel } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user-service/user.service';

export class UsersDataSource implements DataSource<UserModel> {

    private usersSubject = new BehaviorSubject<UserModel[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private userService: UserService) {}

    public connect(collectionViewer: CollectionViewer): Observable<UserModel[]> {
        return this.usersSubject.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer): void {
        this.usersSubject.complete();
        this.loadingSubject.complete();
    }
  
    public loadUsers(filter = '', sortDirection = 'asc', pageIndex = 0, pageSize = 3): void {

        this.loadingSubject.next(true);
        this.usersSubject.next([]);

        this.userService.getUsers(filter, sortDirection, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(users => this.usersSubject.next(users));
    } 
}
