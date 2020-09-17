import { Component } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { SalesData } from 'src/app/models/sales-data.model';
import { SalesService } from 'src/app/services/sales-service/sales.service';

@Component({
    selector: 'create-sales-data',
    templateUrl: './create-sales-data.component.html',
    styleUrls: ['./create-sales-data.component.scss']
})
export class CreateSalesDataComponent {
    public regionField = new FormControl('', [Validators.required]);
    public countryField = new FormControl('', [Validators.required]);
    public itemTypeField = new FormControl('', [Validators.required]);
    public orderDateField = new FormControl('', [Validators.required]);
    public orderPriorityField = new FormControl('', [Validators.required, Validators.maxLength(1)]);
    public salesChannelField = new FormControl('', [Validators.required]);
    public shipDateField = new FormControl('', [Validators.required]);
    public totalCostField = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]);
    public totalProfitField = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]);
    public totalRevenueField = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]);
    public unitCostField = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]);
    public unitPriceField = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]);
    public unitsSoldField = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]);

    private fields = [
        this.regionField,
        this.countryField,
        this.itemTypeField,
        this.orderDateField,
        this.orderPriorityField,
        this.salesChannelField,
        this.shipDateField,
        this.totalCostField,
        this.totalProfitField,
        this.totalRevenueField,
        this.unitCostField,
        this.unitPriceField,
        this.unitsSoldField
    ]

    public creationError = false;

    constructor(
        private salesService: SalesService,
        private router: Router
        ) {
    }

    public hasRequiredError(field: FormControl): boolean {
        return field.hasError('required');
    }

    public handleCreateClick(): void {
        this.fields.forEach(field => field.markAsTouched());
    
        if (this.fields.some(field => field.invalid)) {
            return;
        }

        const salesData: SalesData = {
            region: this.regionField.value,
            country: this.countryField.value,
            itemType: this.itemTypeField.value,
            orderDate: this.orderDateField.value,
            orderPriority: this.orderPriorityField.value,
            salesChannel: this.salesChannelField.value,
            shipDate: this.shipDateField.value,
            totalCost: this.totalCostField.value,
            totalProfit: this.totalProfitField.value,
            totalRevenue: this.totalRevenueField.value,
            unitCost: this.unitCostField.value,
            unitPrice: this.unitPriceField.value,
            unitsSold: this.unitsSoldField.value
        };
    
        this.salesService.create(salesData).pipe(
            take(1)
        ).subscribe(result => {
            this.creationError = !result;
            if (result) {
                this.router.navigate(['/']);
            }
        });
    }

    public handleCancelClick(): void {
        this.router.navigate(['/sales']);
    }
}
