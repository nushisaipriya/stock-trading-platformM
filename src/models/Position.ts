import { PositionData } from '../types/stock';

/**
 * Object-Oriented Position Model
 * Represents shares owned of a single stock, cost basis, and calculated profits.
 */
export class Position {
  private _symbol: string;
  private _shares: number;
  private _totalInvested: number;

  constructor(symbol: string, shares: number = 0, totalInvested: number = 0) {
    this._symbol = symbol;
    this._shares = shares;
    this._totalInvested = totalInvested;
  }

  public get symbol(): string { return this._symbol; }
  public get shares(): number { return this._shares; }
  public get totalInvested(): number { return this._totalInvested; }

  public get avgBuyPrice(): number {
    if (this._shares <= 0) return 0;
    return Number((this._totalInvested / this._shares).toFixed(2));
  }

  /**
   * Adds bought shares to the position, updating the cost basis
   */
  public addShares(count: number, executionPrice: number): void {
    if (count <= 0) throw new Error('Shares to add must be positive');
    this._shares += count;
    this._totalInvested += count * executionPrice;
  }

  /**
   * Reduces shares from the position and returns the cost basis portion removed
   */
  public removeShares(count: number): number {
    if (count <= 0) throw new Error('Shares to remove must be positive');
    if (count > this._shares) throw new Error('Cannot sell more shares than currently owned');

    const costBasisPortion = this.avgBuyPrice * count;
    this._shares -= count;
    this._totalInvested = Math.max(0, this._totalInvested - costBasisPortion);
    return costBasisPortion;
  }

  public calculateMetrics(currentMarketPrice: number): PositionData {
    const currentValue = Number((this._shares * currentMarketPrice).toFixed(2));
    const unrealizedPnL = Number((currentValue - this._totalInvested).toFixed(2));
    const unrealizedPnLPercent = this._totalInvested > 0
      ? Number(((unrealizedPnL / this._totalInvested) * 100).toFixed(2))
      : 0;

    return {
      symbol: this._symbol,
      shares: this._shares,
      avgBuyPrice: this.avgBuyPrice,
      totalInvested: Number(this._totalInvested.toFixed(2)),
      currentPrice: currentMarketPrice,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercent,
    };
  }

  public toJSON(): { symbol: string; shares: number; totalInvested: number } {
    return {
      symbol: this._symbol,
      shares: this._shares,
      totalInvested: Number(this._totalInvested.toFixed(2)),
    };
  }
}
