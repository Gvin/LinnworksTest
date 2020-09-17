import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SalesData } from 'src/app/models/sales-data.model';
import { Roles } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user-service/user.service';
import { SalesService } from '../../services/sales-service/sales.service';
import { CellUpdate } from '../editable-table-cell/editable-table-cell.component';
import { SalesDataSource } from './sales-data-source';

@Component({
    selector: 'sales-list',
    templateUrl: './sales-list.component.html',
    styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent implements OnInit, AfterViewInit {
    public displayedColumns: string[] = ['select', 'region', 'country'];
    public dataSource: SalesDataSource;
    public count: number;

    public selection = new SelectionModel<SalesData>(true, []);

    public defaultPageSize: number = 3;

    @ViewChild(MatSort) 
    public sort: MatSort;

    @ViewChild(MatPaginator) 
    public paginator: MatPaginator

    constructor(
        private userService: UserService,
        private salesService: SalesService) {
    }

    public ngOnInit(): void {
        this.salesService.getSalesCount().subscribe((count) => {
            this.count = count;
        });

        this.dataSource = new SalesDataSource(this.salesService);
        this.dataSource.loadSales(0, this.defaultPageSize);
    }

    public ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadSalesPage())
            )
            .subscribe();
    }

    
    private loadSalesPage(): void {
        this.dataSource.loadSales(
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    public canDelete(): boolean {
        if (this.selection.isEmpty()) {
            return false;
        }

        return this.userService.getIfUserInRole([Roles.Manager, Roles.Admin]);
    }

    public canEdit(): boolean {
        return this.userService.getIfUserInRole([Roles.Manager, Roles.Admin]);
    }

    public update(event: CellUpdate, sale: SalesData): void {
        throw Error("Not implemented");
    }

    public deleteSelectedSale(): void {
        throw Error("Not implemented");
    }
}
