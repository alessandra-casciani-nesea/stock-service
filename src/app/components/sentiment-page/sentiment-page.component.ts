import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, Observable} from 'rxjs';

import {InsiderSentiment} from '../../models/api-interfaces';
import {StockService} from '../../services/stock.service';

@Component({
  selector: 'app-sentiment-page',
  templateUrl: './sentiment-page.component.html',
  styleUrls: ['./sentiment-page.component.css']
})
export class SentimentPageComponent {

  stockName$: Observable<string>;
  sentiments$: Observable<InsiderSentiment[]>;

  symbol: string;

  constructor(private route: ActivatedRoute, private stockService: StockService,private router: Router) {
    this.symbol = this.route.snapshot.params['symbol'];

    this.stockName$ = this.stockService.getStockName(this.symbol).pipe(
      catchError((error)=>{
        alert('Oops! Something went wrong with symbol ' + this.symbol);
        this.router.navigate(['/error-page']);
        throw error;
      })
    );
    this.sentiments$ = this.stockService.getInsiderSentiment(this.symbol);
  }

  calculateProfit(change: number): boolean {
    return change >= 0;
  }

}
