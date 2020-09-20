import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditCellDialogComponent } from '../edit-cell-dialog/edit-cell-dialog.component';

export interface CellUpdate {
    value: string,
    name: string
}

const ColumnType = {
    text: 'text',
    date: 'date'
};

@Component({
    selector: 'editable-table-cell',
    templateUrl: './editable-table-cell.component.html',
    styleUrls: ['./editable-table-cell.component.scss']
})
export class EditableTableCellComponent {
    @Input()
    public title: string;

    @Input()
    public fieldName: string;

    @Input()
    public value: string;

    @Input()
    public canEdit: boolean;

    @Input()
    public columnType: string;

    @Input()
    public required?: boolean;

    @Input()
    public pattern: string;

    @Input()
    public maxLength?: number;

    @Input()
    public options: string[];

    @Output() 
    public update = new EventEmitter<CellUpdate>();

    constructor(private dialog: MatDialog) {
    }

    public callUpdate(newValue: string): void {
        this.update.emit({
            value: newValue,
            name: this.fieldName
        });
    }

    public openEditDialog(): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        dialogConfig.data = {
            value: this.value,
            description: this.title,
            columnType: this.columnType,
            options: this.options,

            required: this.required,
            pattern: this.pattern,
            maxLength: this.maxLength
        };

        const dialogRef = this.dialog.open(EditCellDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(
            data => {
                if (data !== null) {
                    this.callUpdate(data)
                }
            }
        );
    }
}
