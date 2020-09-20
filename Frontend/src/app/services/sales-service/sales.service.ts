import {Injectable} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError} from 'rxjs/operators';
import { SalesData } from 'src/app/models/sales-data.model';
import { HttpService, UploadProgress } from '../http-service/http.service';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    constructor(private httpService: HttpService) {
    }

    public getList(filter: string, sort: string, pageIndex: number, pageSize: number): Observable<SalesData[]> {
        const url = '/api/sales';

        return this.httpService.get<SalesData[]>(url, {
            'filter': filter,
            'sort': sort,
            'pageIndex': `${pageIndex}`,
            'pageSize': `${pageSize}`
        });
    }

    public getCount(filter: string): Observable<number> {
        const url = '/api/sales/count';
        
        return this.httpService.get<number>(url, {
            'filter': filter
        });
    }

    public delete(sales: SalesData[]): Observable<boolean> {
        const url = '/api/sales/delete';

        const ids = sales.map(sale => sale.orderId).join(",");

        const formData = new FormData();
        formData.append('ids', ids);

        return this.httpService.post<boolean>(url, formData).pipe(
            catchError(error => {
                console.error('Error while trying to delete sales data', error);
                return of(false);
            })
        );
    }

    public create(salesData: SalesData): Observable<boolean> {
        const url = '/api/sales/create';

        return this.httpService.post<boolean>(url, salesData).pipe(
            catchError(error => {
                console.error('Error while trying to save sales data', error);
                return of(false);
            })
        );
    }

    public update(salesData: SalesData): Observable<boolean> {
        const url = '/api/sales/update';

        return this.httpService.post<boolean>(url, salesData).pipe(
            catchError(error => {
                console.error('Error while trying to update sales data', error);
                return of(false);
            })
        );
    }

    public import(files: File[]): Observable<UploadProgress> {
        const url = '/api/sales/import';

        return this.httpService.upload(url, files).pipe(
            catchError(error => {
                console.error('Error while importing sales data', error);
                return of({
                    complete: false,
                    error: true 
                } as UploadProgress)
            })
        );
    }
}
