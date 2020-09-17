import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { SalesData } from 'src/app/models/sales-data.model';
import { HttpService } from '../http-service/http.service';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    constructor(private httpService: HttpService) {
    }

    public getSales(pageIndex: number, pageSize: number): Observable<SalesData[]> {
        const url = '/api/sales';

        return this.httpService.get<SalesData[]>(url, {
            'pageIndex': `${pageIndex}`,
            'pageSize': `${pageSize}`
        });
    }

    public getSalesCount(): Observable<number> {
        const url = '/api/sales/count';
        
        return this.httpService.get<number>(url);
    }
}
