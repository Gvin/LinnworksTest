import { SalesData } from 'src/app/models/sales-data.model';

import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SalesService } from 'src/app/services/sales-service/sales.service';

export class SalesDataSource implements DataSource<SalesData> {
    private salesSubject = new BehaviorSubject<SalesData[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private salesService: SalesService) {}

    public connect(collectionViewer: CollectionViewer): Observable<SalesData[]> {
        return this.salesSubject.asObservable();
    }

    public disconnect(collectionViewer: CollectionViewer): void {
        this.salesSubject.complete();
        this.loadingSubject.complete();
    }
  
    public loadSales(pageIndex = 0, pageSize = 3): void {

        this.loadingSubject.next(true);
        this.salesSubject.next([]);

        this.salesService.getList(pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(users => this.salesSubject.next(users));
    } 
}
