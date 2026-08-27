import { PortfolioSnapshot, PositionData, TransactionData } from '../types/stock';
import { Position } from './Position';
import { Stock } from './Stock';
import { Transaction } from './Transaction';

/**
 * Object-Oriented Portfolio Model
 * Manages user assets, positions, cash, execution of trades, and performance tracking.
 */
export class Portfolio {
  private _cashBalance: number;
  private _initialDeposit: number;
  private _positions: Map<string, Position>;
  private _transactions: Transaction[];
  private _performanceHistory: PortfolioSnapshot[];

  constructor(initialDeposit: number = 100000, initialCash?: number) {
    this._initialDeposit = initialDeposit;
    this._cashBalance = initialCash !== undefined ? initialCash : initialDeposit;
    this._positions = new Map<string, Position>();
    this._transactions = [];
    this._performanceHistory = [];

    // Initial baseline performance point
    this._performanceHistory.push({
      timestamp: Date.now() - 30 * 60 * 1000,
      formattedTime: 'Start',
      totalValue: this._cashBalance,
      cashBalance: this._cashBalance,
      investedValue: 0,
      totalProfitLoss: 0,
      dailyReturnPercent: 0,
    });
  }

  public get cashBalance(): number { return Number(this._cashBalance.toFixed(2)); }
  public get initialDeposit(): number { return this._initialDeposit; }
  public get positions(): Map<string, Position> { return this._positions; }
  public get transactions(): Transaction[] { return [...this._transactions]; }
  public get performanceHistory(): PortfolioSnapshot[] { return [...this._performanceHistory]; }

  public getPosition(symbol: string): Position | undefined {
    return this._positions.get(symbol.toUpperCase());
  }

  public depositCash(amount: number): void {
    if (amount <= 0) throw new Error('Deposit amount must be greater than zero');
    this._cashBalance += amount;
    this._initialDeposit += amount;
  }

  public withdrawCash(amount: number): boolean {
    if (amount <= 0) throw new Error('Withdrawal amount must be greater than zero');
    if (amount > this._cashBalance) return false;
    this._cashBalance -= amount;
    return true;
  }

  /**
   * Executes a BUY order for a stock with cash validation
   */
  public buyStock(
    stock: Stock,
    shares: number,
    executionPrice?: number,
    executionType: 'MARKET' | 'LIMIT' = 'MARKET'
  ): Transaction {
    if (shares <= 0 || !Number.isInteger(shares)) {
      throw new Error('Number of shares must be a positive whole integer');
    }

    const price = executionPrice !== undefined ? executionPrice : stock.ask;
    const totalCost = Number((shares * price).toFixed(2));
    const fee = 0; // Zero commission broker model

    if (totalCost > this._cashBalance) {
      throw new Error(
        `Insufficient funds. Required: $${totalCost.toLocaleString()}, Available: $${this._cashBalance.toLocaleString()}`
      );
    }

    // Deduct cash
    this._cashBalance -= totalCost;

    // Update position
    const symbol = stock.symbol.toUpperCase();
    let position = this._positions.get(symbol);
    if (!position) {
      position = new Position(symbol, 0, 0);
      this._positions.set(symbol, position);
    }
    position.addShares(shares, price);

    // Create & log transaction
    const transaction = new Transaction({
      symbol,
      stockName: stock.name,
      type: 'BUY',
      executionType,
      shares,
      price,
      fees: fee,
    });

    this._transactions.unshift(transaction);
    return transaction;
  }

  /**
   * Executes a SELL order for a stock with holdings validation
   */
  public sellStock(
    stock: Stock,
    shares: number,
    executionPrice?: number,
    executionType: 'MARKET' | 'LIMIT' = 'MARKET'
  ): Transaction {
    if (shares <= 0 || !Number.isInteger(shares)) {
      throw new Error('Number of shares must be a positive whole integer');
    }

    const symbol = stock.symbol.toUpperCase();
    const position = this._positions.get(symbol);

    if (!position || position.shares < shares) {
      const owned = position ? position.shares : 0;
      throw new Error(`Insufficient shares. You own ${owned} shares of ${symbol}, requested: ${shares}`);
    }

    const price = executionPrice !== undefined ? executionPrice : stock.bid;
    const grossProceeds = Number((shares * price).toFixed(2));
    const fee = 0;

    // Remove shares and calculate realized P&L
    const costBasisRemoved = position.removeShares(shares);
    const realizedPnL = Number((grossProceeds - costBasisRemoved).toFixed(2));

    // If all shares sold, clean up position map
    if (position.shares === 0) {
      this._positions.delete(symbol);
    }

    // Credit cash
    this._cashBalance += grossProceeds;

    // Create & log transaction
    const transaction = new Transaction({
      symbol,
      stockName: stock.name,
      type: 'SELL',
      executionType,
      shares,
      price,
      fees: fee,
      realizedPnL,
    });

    this._transactions.unshift(transaction);
    return transaction;
  }

  /**
   * Calculates total portfolio value (cash + current market value of all held positions)
   */
  public calculateTotalValue(stocksMap: Map<string, Stock>): number {
    let stockEquity = 0;
    for (const [symbol, position] of this._positions.entries()) {
      const stock = stocksMap.get(symbol);
      const currentPrice = stock ? stock.price : position.avgBuyPrice;
      stockEquity += position.shares * currentPrice;
    }
    return Number((this._cashBalance + stockEquity).toFixed(2));
  }

  /**
   * Calculates total invested value currently in stocks
   */
  public calculateInvestedValue(stocksMap: Map<string, Stock>): number {
    let stockEquity = 0;
    for (const [symbol, position] of this._positions.entries()) {
      const stock = stocksMap.get(symbol);
      const currentPrice = stock ? stock.price : position.avgBuyPrice;
      stockEquity += position.shares * currentPrice;
    }
    return Number(stockEquity.toFixed(2));
  }

  /**
   * Generates position metrics array with current market prices
   */
  public getPositionsMetrics(stocksMap: Map<string, Stock>): PositionData[] {
    const metrics: PositionData[] = [];
    for (const [symbol, position] of this._positions.entries()) {
      const stock = stocksMap.get(symbol);
      const currentPrice = stock ? stock.price : position.avgBuyPrice;
      metrics.push(position.calculateMetrics(currentPrice));
    }
    return metrics;
  }

  /**
   * Records a snapshot of portfolio performance over time
   */
  public recordSnapshot(stocksMap: Map<string, Stock>): PortfolioSnapshot {
    const totalValue = this.calculateTotalValue(stocksMap);
    const investedValue = this.calculateInvestedValue(stocksMap);
    const totalProfitLoss = Number((totalValue - this._initialDeposit).toFixed(2));
    const dailyReturnPercent = this._initialDeposit > 0
      ? Number(((totalProfitLoss / this._initialDeposit) * 100).toFixed(2))
      : 0;

    const date = new Date();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const snapshot: PortfolioSnapshot = {
      timestamp: Date.now(),
      formattedTime,
      totalValue,
      cashBalance: this._cashBalance,
      investedValue,
      totalProfitLoss,
      dailyReturnPercent,
    };

    if (!Array.isArray(this._performanceHistory) || !Object.isExtensible(this._performanceHistory)) {
      this._performanceHistory = Array.isArray(this._performanceHistory) ? [...this._performanceHistory] : [];
    }

    this._performanceHistory.push(snapshot);

    // Keep history manageable
    if (this._performanceHistory.length > 50) {
      this._performanceHistory.shift();
    }

    return snapshot;
  }

  /**
   * Restores portfolio state from persistent object
   */
  public static fromData(
    data: {
      initialDeposit: number;
      cashBalance: number;
      positions: Record<string, { shares: number; totalInvested: number }>;
      transactions: TransactionData[];
      performanceHistory: PortfolioSnapshot[];
    }
  ): Portfolio {
    const portfolio = new Portfolio(data.initialDeposit, data.cashBalance);
    portfolio._positions = new Map<string, Position>();

    if (data.positions) {
      for (const [sym, pos] of Object.entries(data.positions)) {
        if (pos && pos.shares > 0) {
          portfolio._positions.set(sym.toUpperCase(), new Position(sym.toUpperCase(), pos.shares, pos.totalInvested));
        }
      }
    }

    if (data.transactions && Array.isArray(data.transactions)) {
      portfolio._transactions = data.transactions.map((tx) => new Transaction(tx));
    }

    if (data.performanceHistory && Array.isArray(data.performanceHistory) && data.performanceHistory.length > 0) {
      portfolio._performanceHistory = [...data.performanceHistory];
    }

    return portfolio;
  }
}
