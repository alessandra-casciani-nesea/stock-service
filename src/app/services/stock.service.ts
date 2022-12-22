import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { IApiInsiderSentiment, IApiQuoteData, IApiStockName, ResultEntity, InsiderSentiment } from '../models/api-interfaces';
import { IStock } from '../models/project.interfaces';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  constructor(private http: HttpClient) {}

  /**
   * SYMBOL SEARCH:
   * To retrieve stock name.
   *
   * @params q = Query text can be symbol, name, isin, or cusip. Ie: aapl.
   * @params token = API token added by ApiInterceptor.
   *
   * @returns An object of type IApiStockName. 'count' is the number of result (0 if there are no result) and 'result' is the result's array ([] if there are no result).
   */
  getStockName(stockSymbol: string): Observable<string> {
    return this.http.get<IApiStockName>('/search', { params: { q: stockSymbol } }).pipe(
      map(res => {
        // verifico se nei risultati c'è una corrispondenza, altrimenti mando in errore e non vado avanti.
        // @ts-ignore
        const stock:ResultEntity = res.result.find((resEntity: ResultEntity) => resEntity.displaySymbol === stockSymbol);

        if(!stock){
          throw new Error('No matches found for the stock ' + stockSymbol);
        }

        return stock.description;
      })
    );
  }

  /**
   * QUOTE DATA
   * Get real-time quote data for US stocks.
   * @params q = Query text can be symbol, name, isin, or cusip. Ie: aapl.
   * @params token = API token added by ApiInterceptor.
   *
   * @returns An object of type IApiQuoteData.
   */
  private getQuoteData(stockSymbol: string): Observable<IApiQuoteData> {
    return this.http.get<IApiQuoteData>('/quote', { params: { symbol: stockSymbol } });
  }

  /**
   * INSIDER SENTIMENT:
   * Get insider sentiment data for US companies.
   * The MSPR ranges from -100 for the most negative to 100 for the most positive which can signal price changes in the coming 30-90 days.
   *
   * @params symbol = Symbol of the company, ie: AAPL.
   * @params from = From date, format: YYYY-MM-DD.
   * @params to = To date, format: YYYY-MM-DD.
   * @params token = API token added by ApiInterceptor.
   *
   * @returns An object of type IApiInsiderSentiment.
   */
  getInsiderSentiment(stockSymbol: string): Observable<InsiderSentiment[]> {
    let areYearsDifferent: boolean = false;
    let dateFrom: Date = new Date();
    let dateTo: Date = new Date();
    dateFrom.setMonth(dateFrom.getMonth() - 2);

    // operazioni necessarie per risolvere un bug nel servizio
    dateFrom.setDate(10);
    dateTo.setDate(10);
    let monthFrom: number = dateFrom.getMonth() + 1;
    let monthTo: number = dateTo.getMonth() + 1;
    
    if(dateFrom.getFullYear() != dateTo.getFullYear()) {
      // imposto il mese della dateTo a dicembre e quello della dateFrom a gennaio
      // altrimenti il servizio non restituisce tutti i risultati
      areYearsDifferent = true;
      dateFrom.setMonth(0);
      dateTo.setMonth(11);
    }
    
    const params: HttpParams = new HttpParams()
      .set('symbol', stockSymbol)
      .set('from', dateFrom.toISOString().substring(0, 10))
      .set('to', dateTo.toISOString().substring(0, 10));

    return this.http.get<IApiInsiderSentiment>('/stock/insider-sentiment', { params }).pipe(
      map(res => {
        let sentiments: InsiderSentiment[] = [];

        if(areYearsDifferent) {
          // devo fare due cicli per ottenere tutti i risultati di cui ho bisogno
          sentiments = this.getSentimentsByMonthAndYear(monthFrom, 12, dateFrom.getFullYear(), res.data, stockSymbol);
          sentiments = [ ...sentiments, ...this.getSentimentsByMonthAndYear(1, monthTo, dateTo.getFullYear(), res.data, stockSymbol)];
        } else {
          sentiments = this.getSentimentsByMonthAndYear(monthFrom, monthTo, dateFrom.getFullYear(), res.data, stockSymbol);
        }
        // lo slice è ridondante, messo se per caso viene modificato in qualche modo il servizio, le date
        return sentiments.slice(-3);
      })
    );
  }

  private getSentimentsByMonthAndYear(monthFrom: number, monthTo: number, year: number, dataArray: InsiderSentiment[], stockSymbol: string ): InsiderSentiment[] {
    let sentiments: InsiderSentiment[] = [];
    for(let month = monthFrom; month <= monthTo; month ++ ) {
      
      let sentiment = dataArray.find((sentiment: InsiderSentiment) => sentiment.month == month && sentiment.year == year);
      
      if (sentiment == null || sentiment == undefined) {
        sentiment = {
          symbol: stockSymbol,
          year: year,
          month: month,
          change: null,
          mspr: null
        }
      }
      sentiments.push(sentiment);
    }
    return sentiments;
  }

  /**
   * Combines multiple call to create the final Object.
   * @param stockSymbol user input
   * @returns a complete Object of type IStock
   */
  getStockObject(stockSymbol: string): Observable<IStock> {
    return forkJoin([
      this.getStockName(stockSymbol),
      this.getQuoteData(stockSymbol)
    ]).pipe(
      map(([stockName, quoteData]) => {
        return {
          name: stockName,
          todayChange: quoteData.d,
          currentPrice: quoteData.c,
          openingPrice: quoteData.o,
          highPrice: quoteData.h,
          isProfit: quoteData.d > 0,
        }
      })
    )
  }

}
