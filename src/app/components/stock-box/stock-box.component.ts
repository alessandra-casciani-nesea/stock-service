import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {catchError, finalize, Observable} from 'rxjs';

import {IStock} from '../../models/project.interfaces';
import {StockService} from '../../services/stock.service';

@Component({
  selector: 'app-stock-box',
  templateUrl: './stock-box.component.html',
  styleUrls: ['./stock-box.component.css']
})
export class StockBoxComponent implements OnInit {

  @Input() stockSymbol = '';
  @Output() removeBox: EventEmitter<string> = new EventEmitter();

  stock$: Observable<IStock>;

  closeBtnId: string = 'remove{stock}';
  sentimentBtnId: string = 'sentiment{stock}';

  loading: boolean;

  constructor(private stockService: StockService) {
    this.loading = true;
  }

  ngOnInit(): void {
    this.stock$ = this.stockService.getStockObject(this.stockSymbol).pipe(
      catchError(() => {
        alert('Stock ' + this.stockSymbol + ' not found.');
        this.deleteBox();
        throw new Error('No stock found with symbol ' + this.stockSymbol);
      }),
      finalize(() => this.loading = false)
    );

    this.closeBtnId = this.closeBtnId.replace('{stock}', this.stockSymbol);
    this.sentimentBtnId = this.sentimentBtnId.replace('{stock}', this.stockSymbol);

  }

  deleteBox(): void {
    this.removeBox.emit(this.stockSymbol);
  }
}
