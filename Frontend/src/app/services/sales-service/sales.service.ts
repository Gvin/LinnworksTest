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

    public getSales(startIndex: number, count: number): Observable<SalesData[]> {
        const url = '/api/sales';

        return this.httpService.get<SalesData[]>(url, {
            'startIndex': `${startIndex}`,
            'count': `${count}`
        });
    }
}
