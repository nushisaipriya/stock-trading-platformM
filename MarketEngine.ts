import { INITIAL_STOCKS } from '../data/initialStocks';
import { MarketCondition, MarketNewsItem, StockData } from '../types/stock';
import { Stock } from './Stock';

export type MarketListener = (stocks: Stock[], news?: MarketNewsItem) => void;

/**
 * Object-Oriented Market Simulation Engine
 * Manages all stock assets, ticker events, volatility trends, and news catalysts.
 */
export class MarketEngine {
  private _stocks: Map<string, Stock>;
  private _marketCondition: MarketCondition;
  private _speedMultiplier: number;
  private _isRunning: boolean;
  private _listeners: Set<MarketListener>;
  private _newsFeed: MarketNewsItem[];
  private _timerId: number | null;

  private static NEWS_TEMPLATES: Array<{
    title: string;
    content: string;
    affectedSector?: string;
    affectedSymbol?: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    impact: number;
  }> = [
    {
      title: 'Federal Reserve Signals Interest Rate Cut',
      content: 'Central bank hints at easing monetary policy as inflation nears target, boosting equity valuations.',
      sentiment: 'BULLISH',
      impact: 0.015,
    },
    {
      title: 'AI Chip Demand Surges Past Supply Forecasts',
      content: 'Data center spending escalates rapidly with cloud providers doubling compute orders.',
      affectedSymbol: 'NVDA',
      sentiment: 'BULLISH',
      impact: 0.035,
    },
    {
      title: 'Tech Earnings Beat Consensus Estimates',
      content: 'Major technology companies deliver robust quarterly revenue and strong guidance.',
      affectedSector: 'Technology',
      sentiment: 'BULLISH',
      impact: 0.02,
    },
    {
      title: 'Supply Chain Bottlenecks Impact Production Output',
      content: 'Logistical delays create temporary shipping headwinds across consumer hardware lines.',
      affectedSymbol: 'AAPL',
      sentiment: 'BEARISH',
      impact: -0.018,
    },
    {
      title: 'Oil Reserves Tighten Amid Geopolitical Shifts',
      content: 'Global crude inventories dip below seasonal 5-year averages, lifting energy producers.',
      affectedSymbol: 'XOM',
      sentiment: 'BULLISH',
      impact: 0.025,
    },
    {
      title: 'Consumer Confidence Index Rises to 12-Month High',
      content: 'Retail sales figures demonstrate resilient consumer purchasing power.',
      affectedSector: 'Consumer',
      sentiment: 'BULLISH',
      impact: 0.012,
    },
    {
      title: 'Regulatory Scrutiny Intensifies on Fintech Custody',
      content: 'Regulatory bodies announce updated compliance frameworks for digital asset custody.',
      affectedSymbol: 'COIN',
      sentiment: 'BEARISH',
      impact: -0.03,
    },
    {
      title: 'Breakthrough Clinical Trial Reaches Phase 3 Success',
      content: 'Pharmaceutical division reports positive efficacy endpoints in landmark therapeutic trial.',
      affectedSymbol: 'JNJ',
      sentiment: 'BULLISH',
      impact: 0.022,
    },
  ];

  constructor(initialData: StockData[] = INITIAL_STOCKS) {
    this._stocks = new Map<string, Stock>();
    for (const data of initialData) {
      this._stocks.set(data.symbol, new Stock(data));
    }
    this._marketCondition = 'STABLE_GROWTH';
    this._speedMultiplier = 1;
    this._isRunning = true;
    this._listeners = new Set<MarketListener>();
    this._newsFeed = [];
    this._timerId = null;

    // Seed initial news
    this.createNewsItem(MarketEngine.NEWS_TEMPLATES[0]);
  }

  public get stocks(): Stock[] {
    return Array.from(this._stocks.values());
  }

  public get stocksMap(): Map<string, Stock> {
    return this._stocks;
  }

  public get isRunning(): boolean {
    return this._isRunning;
  }

  public get marketCondition(): MarketCondition {
    return this._marketCondition;
  }

  public get speedMultiplier(): number {
    return this._speedMultiplier;
  }

  public get newsFeed(): MarketNewsItem[] {
    return [...this._newsFeed];
  }

  public getStock(symbol: string): Stock | undefined {
    return this._stocks.get(symbol.toUpperCase());
  }

  public setMarketCondition(condition: MarketCondition): void {
    this._marketCondition = condition;
  }

  public setSpeedMultiplier(speed: number): void {
    this._speedMultiplier = speed;
  }

  public togglePause(): boolean {
    this._isRunning = !this._isRunning;
    return this._isRunning;
  }

  public subscribe(listener: MarketListener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private createNewsItem(template: (typeof MarketEngine.NEWS_TEMPLATES)[0]): MarketNewsItem {
    const item: MarketNewsItem = {
      id: `NEWS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      title: template.title,
      content: template.content,
      affectedSymbol: template.affectedSymbol,
      sentiment: template.sentiment,
      impactPercentage: template.impact,
    };

    this._newsFeed.unshift(item);
    if (this._newsFeed.length > 20) {
      this._newsFeed.pop();
    }
    return item;
  }

  /**
   * Advance market by a single tick
   */
  public tick(): void {
    if (!this._isRunning) return;

    let momentum = 1.0;
    if (this._marketCondition === 'BULL_MARKET') momentum = 1.8;
    else if (this._marketCondition === 'BEAR_MARKET') momentum = -1.2;
    else if (this._marketCondition === 'HIGH_VOLATILITY') momentum = 2.5;

    // Random news trigger (5% chance per tick)
    let triggeredNews: MarketNewsItem | undefined;
    if (Math.random() < 0.06) {
      const randomTemplate =
        MarketEngine.NEWS_TEMPLATES[Math.floor(Math.random() * MarketEngine.NEWS_TEMPLATES.length)];
      triggeredNews = this.createNewsItem(randomTemplate);
    }

    // Tick each stock
    for (const stock of this._stocks.values()) {
      let newsImpact = 0;
      if (triggeredNews) {
        if (triggeredNews.affectedSymbol === stock.symbol) {
          newsImpact = triggeredNews.impactPercentage;
        } else if (!triggeredNews.affectedSymbol) {
          newsImpact = triggeredNews.impactPercentage * 0.4;
        }
      }

      stock.tick(momentum, newsImpact);
    }

    // Notify all subscribers
    const currentStocks = this.stocks;
    for (const listener of this._listeners) {
      listener(currentStocks, triggeredNews);
    }
  }

  /**
   * Calculates overall simulated composite market indices
   */
  public getMarketIndices(): {
    sp500: { value: number; change: number; changePercent: number };
    nasdaq: { value: number; change: number; changePercent: number };
    dow: { value: number; change: number; changePercent: number };
  } {
    let totalStockPrice = 0;
    let totalStockPrev = 0;
    let techPrice = 0;
    let techPrev = 0;

    for (const stock of this._stocks.values()) {
      totalStockPrice += stock.price;
      totalStockPrev += stock.previousClose;
      if (stock.sector === 'Technology' || stock.sector === 'Crypto/Fintech') {
        techPrice += stock.price;
        techPrev += stock.previousClose;
      }
    }

    const spChangePercent = ((totalStockPrice - totalStockPrev) / totalStockPrev) * 100;
    const nasdaqChangePercent = ((techPrice - techPrev) / techPrev) * 100;

    const baseSP = 5640.25;
    const baseNasdaq = 17820.50;
    const baseDow = 41250.80;

    return {
      sp500: {
        value: Number((baseSP * (1 + spChangePercent / 100)).toFixed(2)),
        change: Number(((baseSP * spChangePercent) / 100).toFixed(2)),
        changePercent: Number(spChangePercent.toFixed(2)),
      },
      nasdaq: {
        value: Number((baseNasdaq * (1 + nasdaqChangePercent / 100)).toFixed(2)),
        change: Number(((baseNasdaq * nasdaqChangePercent) / 100).toFixed(2)),
        changePercent: Number(nasdaqChangePercent.toFixed(2)),
      },
      dow: {
        value: Number((baseDow * (1 + (spChangePercent * 0.7) / 100)).toFixed(2)),
        change: Number(((baseDow * (spChangePercent * 0.7)) / 100).toFixed(2)),
        changePercent: Number((spChangePercent * 0.7).toFixed(2)),
      },
    };
  }

  /**
   * Resets market stocks to fresh initial baseline
   */
  public reset(initialData: StockData[] = INITIAL_STOCKS): void {
    this._stocks.clear();
    for (const data of initialData) {
      this._stocks.set(data.symbol, new Stock(data));
    }
  }
}
