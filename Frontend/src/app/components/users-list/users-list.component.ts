import { SelectionModel } from '@angular/cdk/collections';
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fromEvent, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, tap } from 'rxjs/operators';
import { UserModel } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user-service/user.service';
import { UsersDataSource } from './users-data-source';

const defaultPageSize = 10;

@Component({
    selector: 'users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit, AfterViewInit {
    public displayedColumns: string[] = ['select', 'login', 'role'];
    public dataSource: UsersDataSource;
    public count: number;

    public selection = new SelectionModel<UserModel>(false, []);

    @ViewChild(MatSort) 
    sort: MatSort;

    @ViewChild(MatPaginator) 
    paginator: MatPaginator

    @ViewChild('input') 
    searchInput: ElementRef;

    constructor(private userService: UserService) {
    }

    public ngOnInit(): void {
        this.userService.getUsersCount('').subscribe((count) => {
            this.count = count;
        });

        this.dataSource = new UsersDataSource(this.userService);
        this.dataSource.loadUsers('', 'asc', 0, defaultPageSize);
    }

    public ngAfterViewInit(): void {
        fromEvent(this.searchInput.nativeElement,'keyup')
            .pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;
                    this.userService.getUsersCount(this.searchInput.nativeElement.value).subscribe((count) => {
                        this.count = count;
                        this.loadUsersPage();
                    });
                })
            )
            .subscribe();

        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadUsersPage())
            )
            .subscribe();
    }

    private loadUsersPage(): void {
        this.dataSource.loadUsers(
            this.searchInput.nativeElement.value,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    public canDeleteUser(): boolean {
        if (this.selection.isEmpty()) {
            return false;
        }

        const selectedId = this.selection.selected[0].id;
        var currentUser = this.userService.getCurrentUser();
        return selectedId.toLowerCase() !== currentUser.id.toLowerCase();
    }

    public canEditUser(user: UserModel): boolean {
        var currentUser = this.userService.getCurrentUser();
        return user.id.toLowerCase() !== currentUser.id.toLowerCase();
    }

    public update(user: UserModel): void {
        this.userService.update(user).subscribe((result) => {
            if (!result) {
                // TODO: Replace alert
                alert('Error while updating user');
            }
        });
    }

    public deleteSelectedUser(): void {
        if (this.selection.isEmpty()) {
            return;
        }

        const selectedId = this.selection.selected[0].id;
        this.userService.delete(selectedId).subscribe((result) => {
            if (!result) {
                // TODO: Replace alert
                alert('Error while deleting user');
            }
            
            this.paginator.pageIndex = 0;
            this.userService.getUsersCount(this.searchInput.nativeElement.value).subscribe((count) => {
                this.count = count;
                this.loadUsersPage();
            });
        });
    }
}
