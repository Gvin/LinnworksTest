import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'edit-cell-dialog',
    templateUrl: './edit-cell-dialog.component.html',
    styleUrls: ['./edit-cell-dialog.component.scss']
})
export class EditCellDialogComponent implements OnInit {
    public formField: FormControl;
    public value: string;
    public description: string;
    public columnType: string;
    public options: string[];
    
    constructor(
        private dialogRef: MatDialogRef<EditCellDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data) {

        this.description = data.description;
        this.columnType = data.columnType;
        this.value = data.value;
        this.options = data.options;

        let validators = [];
        if (data.required) {
            validators.push(Validators.required);
        }
        if (data.pattern) {
            validators.push(Validators.pattern(data.pattern))
        }
        if (data.maxLength) {
            validators.push(Validators.maxLength(data.maxLength));
        }
        this.formField = new FormControl('', validators);
    }

    public ngOnInit(): void {
        this.formField.setValue(this.value);
        this.formField.markAsDirty();
    }

    public getColumnType(): string {
        if (!this.columnType) {
            return 'text';
        }
        return this.columnType;
    }

    public save(): void {
        this.dialogRef.close(this.formField.value);
    }

    public close(): void {
        this.dialogRef.close(null);
    }
}
