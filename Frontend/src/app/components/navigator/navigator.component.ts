import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent {
  @Input()
  public totalCount: number;
  @Input()
  public onPageCount: number;
  @Input()
  public currentPage: number;

  private nextPage: number;
  private prevPage: number;

  public get nextPageNumber(): number {
    return this.currentPage + 1;
  }

  public get hasNextPage(): boolean {
    return this.currentPage < this.pagesCount;
  }

  public get prevPageNumber(): number {
    return this.currentPage - 1;
  }

  public get hasPrevPage(): boolean {
    return this.currentPage > 1;
  }

  public get pagesCount(): number {
    return Math.ceil(this.totalCount / this.onPageCount);
  }
}
