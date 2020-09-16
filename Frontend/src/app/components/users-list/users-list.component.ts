import { SelectionModel } from '@angular/cdk/collections';
import {Component, OnInit, ViewChild} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs/operators';
import { UserModel } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user-service/user.service';


@Component({
    selector: 'users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
    public displayedColumns: string[] = ['select', 'login', 'role'];
    public dataSource = new MatTableDataSource<UserModel>();
    public loading: boolean;

    public selection = new SelectionModel<UserModel>(false, []);

    @ViewChild(MatSort) 
    sort: MatSort;

    constructor(private userService: UserService) {
        this.loading = false;
    }

    public ngOnInit(): void {
        this.loadData();
    }

    private loadData(): void {
        this.loading = true;
        this.dataSource.data = [];

        this.userService.getUsers().pipe(
          take(1)
        ).subscribe(users => {
            this.dataSource.data = users;
            this.dataSource.sort = this.sort;
            this.loading = false;
        });
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
        this.loading = true;
        this.userService.update(user).subscribe((result) => {
            if (!result) {
                // TODO: Replace alert
                alert('Error while updating user');
            }
            this.loading = false;
        });
    }

    public deleteSelectedUser(): void {
        if (this.selection.isEmpty()) {
            return;
        }

        this.loading = true;
        
        const selectedId = this.selection.selected[0].id;
        this.userService.delete(selectedId).subscribe((result) => {
            if (!result) {
                // TODO: Replace alert
                alert('Error while deleting user');
            }
            this.loadData();
        });
    }

    public isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected == numRows;
    }
      
      /** Selects all rows if they are not all selected; otherwise clear selection. */
    public masterToggle(): void {
        this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
    }
}
