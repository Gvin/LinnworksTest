import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, tap } from 'rxjs/operators';
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
    public displayedColumns: string[] = [
        'select', 
        'orderId', 
        'region', 
        'country',
        'itemType', 
        'salesChannel', 
        'orderPriority',
        'orderDate',
        'shipDate',
        'unitsSold',
        'unitPrice',
        'unitCost',
        'totalRevenue',
        'totalCost',
        'totalProfit'
    ];
    public dataSource: SalesDataSource;
    public count: number;
    public salesChannels = ['Online', 'Offline'];

    @ViewChild('input') 
    public searchInput: ElementRef;

    public selection = new SelectionModel<SalesData>(true, []);

    public defaultPageSize: number = 25;

    @ViewChild(MatSort) 
    public sort: MatSort;

    @ViewChild(MatPaginator) 
    public paginator: MatPaginator

    constructor(
        private userService: UserService,
        private salesService: SalesService) {
    }

    public ngOnInit(): void {
        this.salesService.getCount('').subscribe((count) => {
            this.count = count;
        });

        this.dataSource = new SalesDataSource(this.salesService);
        this.dataSource.loadSales('', 'asc', 0, this.defaultPageSize);
    }

    public ngAfterViewInit(): void {
        fromEvent(this.searchInput.nativeElement,'keyup')
            .pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;
                    this.salesService.getCount(this.searchInput.nativeElement.value).subscribe((count) => {
                        this.count = count;
                        this.loadSalesPage();
                    });
                })
            )
            .subscribe();

        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.loadSalesPage())
            )
            .subscribe();
    }

    
    private loadSalesPage(): void {
        this.dataSource.loadSales(
            this.searchInput.nativeElement.value,
            this.sort.direction,
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
        const oldValue = sale[event.name];
        if (oldValue == event.value) {
            return;
        }

        sale[event.name] = event.value;
        this.salesService.update(sale).pipe(
            take(1)
        ).subscribe(result => {
            if (!result) {
                // TODO: relpace alert
                alert('Error while updating sale data')
            }
        });
    }

    public deleteSelectedSales(): void {
        if (this.selection.isEmpty()) {
            return;
        }

        var selectedSales = this.selection.selected;
        this.salesService.delete(selectedSales).pipe(
            take(1),
        ).subscribe((result) => {
            if (!result) {
                // TODO: Replace alert
                alert('Error while deleting sales');
            }
            
            this.paginator.pageIndex = 0;
            this.salesService.getCount(this.searchInput.nativeElement.value).subscribe((count) => {
                this.count = count;
                this.loadSalesPage();
            });
        });
    }
}
