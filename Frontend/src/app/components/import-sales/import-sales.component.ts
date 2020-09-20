import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@aspnet/signalr';
import { SalesService } from 'src/app/services/sales-service/sales.service';

@Component({
    selector: 'import-sales',
    templateUrl: './import-sales.component.html',
    styleUrls: ['./import-sales.component.scss']
})
export class ImportSalesComponent implements OnInit {
    private connection: HubConnection;

    public selectedFiles: File[] = [];

    @ViewChild('fileField')
    public fileField: ElementRef;

    public uploading: boolean;
    public progressValue: number;
    public operation: string;

    constructor(private router: Router,
        private salesService: SalesService) {
    }
    
    public ngOnInit(): void {
        
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
        this.progressValue = 0;

        if (this.connection) {
            this.connection.stop();
        }

        this.connection = new HubConnectionBuilder()
            .configureLogging(LogLevel.Debug)
            .withUrl('https://localhost:44348/import-progress')
            .build();
      
        this.connection.on("taskStarted", () => {
            console.log('Import task started');
        });
        this.connection.on('readDataProgressChanged', (fileIndex, filesCount, lineIndex, linesCount) => {
            this.operation = "readData";
            this.progressValue = 100 * ((fileIndex + 1) / filesCount) * (lineIndex / linesCount);
        });
        this.connection.on('saveDataProgressChanged', (index, recordsCount) => {
            this.operation = "saveData";
            this.progressValue = 100 * index / recordsCount;
        });
        this.connection.on('taskEnded', () => {
            console.log('Import task ended');
        });
    
        this.connection
            .start()
            .then(() => console.log('Connection started!'))
            .catch(err => console.error('Error while establishing connection: ' + err));

        this.operation = "upload";

        let subscription = this.salesService.import(this.selectedFiles).subscribe(upload => {
            if (upload.progress != null) {
                this.progressValue = upload.progress;
            }
            if (upload.complete) {
                this.uploading = false;
                subscription.unsubscribe();
                this.connection.stop();
                this.router.navigate(['/sales']);
            }
        });
    }

    public handleCancelClick(): void {
        this.router.navigate(['/sales'])
    }
}
