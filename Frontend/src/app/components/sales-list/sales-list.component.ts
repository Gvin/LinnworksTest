import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SalesData } from 'src/app/models/sales-data.model';
import { SalesService } from '../../services/sales-service/sales.service';

@Component({
    selector: 'sales-list',
    templateUrl: './sales-list.component.html',
    styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent implements OnInit {
    public displayedColumns: string[] = ['select', 'login', 'role'];
    public dataSource = new MatTableDataSource<SalesData>();
    public loading: boolean;

    public selection = new SelectionModel<SalesData>(false, []);

    @ViewChild(MatSort) 
    sort: MatSort;

    constructor(private salesService: SalesService) {
    }

    public ngOnInit(): void {
        //this.dataSource.
        // TODO: get sales from backend and show them
    }
}
