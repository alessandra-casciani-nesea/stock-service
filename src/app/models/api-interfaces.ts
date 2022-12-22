export interface IApiStockName {
  count: number;
  result: ResultEntity[] | [];
}

export interface ResultEntity {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface IApiQuoteData {
  c: number; // current price
  d: number; // change
  dp: number; // Percent Change
  h: number; // High price of the day
  l: number; // low price of the day
  o: number; // open price of the day
  pc: number; // previous close price
  t: number; // timestamp
}

export interface IApiInsiderSentiment {
  data: InsiderSentiment[] | [];
  symbol: string;
}
export interface InsiderSentiment {
  symbol: string;
  year: number;
  month: number;
  change: number | null; // Net buying/selling from all insiders' transactions.
  mspr: number | null; // Monthly share purchase ratio.
}
