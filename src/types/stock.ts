export type Sector = 'Technology' | 'Healthcare' | 'Financials' | 'Consumer' | 'Energy' | 'Automotive' | 'Crypto/Fintech';

export type OrderType = 'BUY' | 'SELL';
export type OrderExecutionType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED';

export interface PricePoint {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  name: string;
  sector: Sector;
  price: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number; // in billions
  peRatio: number;
  dividendYield: number; // percentage
  history: PricePoint[];
  description: string;
  volatility: number; // 0.01 to 0.05
  trendBias: number; // -0.01 to 0.01
}

export interface PositionData {
  symbol: string;
  shares: number;
  avgBuyPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface TransactionData {
  id: string;
  timestamp: number;
  formattedDate: string;
  symbol: string;
  stockName: string;
  type: OrderType;
  executionType: OrderExecutionType;
  shares: number;
  price: number;
  totalAmount: number;
  fees: number;
  realizedPnL?: number;
}

export interface LimitOrderData {
  id: string;
  timestamp: number;
  symbol: string;
  type: OrderType;
  targetPrice: number;
  shares: number;
  status: OrderStatus;
  createdAt: string;
  expiresAt?: string;
}

export interface PortfolioSnapshot {
  timestamp: number;
  formattedTime: string;
  totalValue: number;
  cashBalance: number;
  investedValue: number;
  totalProfitLoss: number;
  dailyReturnPercent: number;
}

export interface UserAccountData {
  id: string;
  username: string;
  initialDeposit: number;
  cashBalance: number;
  positions: Record<string, PositionData>;
  transactions: TransactionData[];
  limitOrders: LimitOrderData[];
  performanceHistory: PortfolioSnapshot[];
  createdAt: number;
  lastUpdated: number;
}

export interface MarketNewsItem {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  affectedSymbol?: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactPercentage: number;
}

export type MarketCondition = 'BULL_MARKET' | 'BEAR_MARKET' | 'HIGH_VOLATILITY' | 'STABLE_GROWTH';
