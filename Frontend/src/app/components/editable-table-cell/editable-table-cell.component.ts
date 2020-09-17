import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";

export interface CellUpdate {
    value: string,
    name: string
}

@Component({
    selector: 'editable-table-cell',
    templateUrl: './editable-table-cell.component.html'
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

    @Output() 
    public update = new EventEmitter<CellUpdate>();

    @ViewChild('input')
    public input: ElementRef;

    public callUpdate(): void {
        this.update.emit({
            value: this.input.nativeElement.value, 
            name: this.fieldName
        });
    }
}
