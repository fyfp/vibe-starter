export type AssetClass = 'stocks' | 'crypto' | 'forex' | 'indices' | 'futures' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketItem {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  assetClass: AssetClass;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  open: number;
  prevClose: number;
  volume: string;
  volumeNum: number;
  marketCap?: string;
  peRatio?: number;
  dividendYield?: number;
  sector?: string;
  logoUrl?: string;
  country?: string;
  sparkline: number[];
  rating: TechnicalRating;
  description: string;
  candles?: Record<string, Candle[]>;
}

export interface MarketSector {
  name: string;
  performance: number;
  topStock: string;
  marketCap: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  relatedSymbols: string[];
  imageUrl?: string;
  url?: string;
}

export interface MarketHours {
  market: string;
  country: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  timezone: string;
  flag: string;
}

export interface AlertItem {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  triggered: boolean;
}
