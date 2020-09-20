import { Component, OnInit } from "@angular/core";
import { take, tap } from 'rxjs/operators';
import { SalesStatisticsModel } from 'src/app/models/sales-statistics.model';
import { SalesService } from 'src/app/services/sales-service/sales.service';

@Component({
    selector: 'statistics-list',
    templateUrl: './statistics-list.component.html',
    styleUrls: ['./statistics-list.component.scss']
})
export class StatisticsListComponent implements OnInit {
    public countries: string[] = [];
    public selectedCountry: string;
    public statistics: SalesStatisticsModel[];

    public displayedColumns = ['year', 'totalSold', 'totalProfit'];

    constructor(private salesService: SalesService) {
    }

    public countriesLoaded(): boolean {
        return this.countries && this.countries.length > 0;
    }

    public ngOnInit(): void {
        this.salesService.getCountries().pipe(
            take(1)
        ).subscribe(result => {
            this.countries = result;
        });
    }

    public updateStatisticsTable(): void {
        if (!this.selectedCountry) {
            return;
        }

        this.salesService.getStatistics(this.selectedCountry).pipe(
            take(1)
        ).subscribe(result => {
            this.statistics = result;
        });
    }
}
