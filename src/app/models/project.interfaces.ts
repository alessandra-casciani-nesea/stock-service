import { InsiderSentiment } from "./api-interfaces";

export interface IStock {
  name: string;
  todayChange: number;
  currentPrice: number;
  openingPrice: number;
  highPrice: number;
  isProfit: boolean | null;
}

export interface ISentiment {
  name: string;
  symbol: string;
  data: InsiderSentiment[] | [];
}
