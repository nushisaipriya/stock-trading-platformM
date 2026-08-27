import { PricePoint, Sector, StockData } from '../types/stock';

/**
 * Object-Oriented Stock Model
 * Encapsulates stock properties, price mechanics, and volatility ticks.
 */
export class Stock {
  private _symbol: string;
  private _name: string;
  private _sector: Sector;
  private _price: number;
  private _previousClose: number;
  private _open: number;
  private _dayHigh: number;
  private _dayLow: number;
  private _volume: number;
  private _marketCap: number;
  private _peRatio: number;
  private _dividendYield: number;
  private _description: string;
  private _volatility: number;
  private _trendBias: number;
  private _history: PricePoint[];

  constructor(data: StockData) {
    this._symbol = data.symbol;
    this._name = data.name;
    this._sector = data.sector;
    this._price = data.price;
    this._previousClose = data.previousClose;
    this._open = data.open;
    this._dayHigh = data.dayHigh;
    this._dayLow = data.dayLow;
    this._volume = data.volume;
    this._marketCap = data.marketCap;
    this._peRatio = data.peRatio;
    this._dividendYield = data.dividendYield;
    this._description = data.description;
    this._volatility = data.volatility;
    this._trendBias = data.trendBias;
    this._history = [...data.history];
  }

  // Getters
  public get symbol(): string { return this._symbol; }
  public get name(): string { return this._name; }
  public get sector(): Sector { return this._sector; }
  public get price(): number { return this._price; }
  public get previousClose(): number { return this._previousClose; }
  public get open(): number { return this._open; }
  public get dayHigh(): number { return this._dayHigh; }
  public get dayLow(): number { return this._dayLow; }
  public get volume(): number { return this._volume; }
  public get marketCap(): number { return this._marketCap; }
  public get peRatio(): number { return this._peRatio; }
  public get dividendYield(): number { return this._dividendYield; }
  public get description(): string { return this._description; }
  public get volatility(): number { return this._volatility; }
  public get trendBias(): number { return this._trendBias; }
  public get history(): PricePoint[] { return [...this._history]; }

  public get change(): number {
    return Number((this._price - this._previousClose).toFixed(2));
  }

  public get changePercent(): number {
    if (this._previousClose === 0) return 0;
    return Number((((this._price - this._previousClose) / this._previousClose) * 100).toFixed(2));
  }

  public get bid(): number {
    return Number((this._price * 0.9995).toFixed(2));
  }

  public get ask(): number {
    return Number((this._price * 1.0005).toFixed(2));
  }

  /**
   * Simulates a tick step in price based on volatility, trend, and global market momentum
   */
  public tick(marketMomentumMultiplier: number = 1.0, newsFactor: number = 0): void {
    const randomShock = (Math.random() - 0.49) * 2; // -1 to +1
    const totalPercentChange =
      (randomShock * this._volatility * 0.4 + this._trendBias * 0.2 + newsFactor) * marketMomentumMultiplier;

    const oldPrice = this._price;
    const newPrice = Math.max(0.5, Number((oldPrice * (1 + totalPercentChange)).toFixed(2)));

    this._price = newPrice;
    this._dayHigh = Math.max(this._dayHigh, newPrice);
    this._dayLow = Math.min(this._dayLow, newPrice);
    
    // Add trade volume tick
    const tickVolume = Math.floor(500 + Math.random() * 5000 * marketMomentumMultiplier);
    this._volume += tickVolume;

    // Record new candlestick point
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const high = Math.max(oldPrice, newPrice) * (1 + Math.random() * 0.001);
    const low = Math.min(oldPrice, newPrice) * (1 - Math.random() * 0.001);

    const newPoint: PricePoint = {
      time: timeStr,
      timestamp: Date.now(),
      open: oldPrice,
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: newPrice,
      volume: tickVolume,
    };

    if (!Array.isArray(this._history) || !Object.isExtensible(this._history)) {
      this._history = Array.isArray(this._history) ? [...this._history] : [];
    }

    this._history.push(newPoint);

    // Keep history bounded to last 60 points for smooth performance
    if (this._history.length > 60) {
      this._history.shift();
    }
  }

  public toJSON(): StockData {
    return {
      symbol: this._symbol,
      name: this._name,
      sector: this._sector,
      price: this._price,
      previousClose: this._previousClose,
      open: this._open,
      dayHigh: this._dayHigh,
      dayLow: this._dayLow,
      volume: this._volume,
      marketCap: this._marketCap,
      peRatio: this._peRatio,
      dividendYield: this._dividendYield,
      description: this._description,
      volatility: this._volatility,
      trendBias: this._trendBias,
      history: [...this._history],
    };
  }
}
