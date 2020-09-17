import {Injectable} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { SalesData } from 'src/app/models/sales-data.model';
import { HttpService } from '../http-service/http.service';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    constructor(private httpService: HttpService) {
    }

    public getList(pageIndex: number, pageSize: number): Observable<SalesData[]> {
        const url = '/api/sales';

        return this.httpService.get<SalesData[]>(url, {
            'pageIndex': `${pageIndex}`,
            'pageSize': `${pageSize}`
        });
    }

    public getCount(): Observable<number> {
        const url = '/api/sales/count';
        
        return this.httpService.get<number>(url);
    }

    public create(salesData: SalesData): Observable<boolean> {
        const url = '/api/sales/create';

        return this.httpService.post<boolean>(url, salesData).pipe(
            catchError(() => {
                return of(false);
            }),
            mapTo(true)
        );
    }
}
