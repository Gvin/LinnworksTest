import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales-service/sales.service';

@Component({
    selector: 'import-sales',
    templateUrl: './import-sales.component.html',
    styleUrls: ['./import-sales.component.scss']
})
export class ImportSalesComponent {
    public selectedFiles: File[] = [];

    @ViewChild('fileField')
    public fileField: ElementRef;

    public uploading: boolean;
    public uploadProgress: number;

    constructor(private router: Router,
        private salesService: SalesService) {
    }

    public handleFilesSelected(): void {
        const fileElement = this.fileField.nativeElement as HTMLInputElement;
        let files: File[] = [];
        for (let index = 0; index < fileElement.files.length; index++) {
            const file = fileElement.files.item(index);
            files.push(file);
        }

        this.selectedFiles = [...this.selectedFiles, ...files];
    }

    public getIfFilesSelected(): boolean {
        return this.selectedFiles && this.selectedFiles.length > 0;
    }

    public removeSelectedFile(file: File): void {
        this.selectedFiles = this.selectedFiles.filter(element => element !== file);
    }

    public handleImportClick(): void {
        if (this.selectedFiles.length === 0) {
            return;
        }

        this.uploading = true;
        this.uploadProgress = 0;

        let subscription = this.salesService.import(this.selectedFiles).subscribe(upload => {
            if (upload.progress != null) {
                this.uploadProgress = upload.progress;
            }
            if (upload.complete) {
                this.uploading = false;
                subscription.unsubscribe();
                this.router.navigate(['/sales'])
            }
        });
    }

    public handleCancelClick(): void {
        this.router.navigate(['/sales'])
    }
}
