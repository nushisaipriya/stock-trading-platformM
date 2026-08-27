import { UserAccountData } from '../types/stock';
import { Order } from './Order';
import { Portfolio } from './Portfolio';
import { Stock } from './Stock';
import { Transaction } from './Transaction';

/**
 * Object-Oriented User Account Model
 * Encapsulates user profile, security balance, active portfolio, and pending limit orders.
 */
export class UserAccount {
  private _id: string;
  private _username: string;
  private _portfolio: Portfolio;
  private _limitOrders: Order[];
  private _createdAt: number;

  constructor(username: string = 'Alex Trader', initialDeposit: number = 100000, id?: string) {
    this._id = id || `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this._username = username;
    this._portfolio = new Portfolio(initialDeposit);
    this._limitOrders = [];
    this._createdAt = Date.now();
  }

  public get id(): string { return this._id; }
  public get username(): string { return this._username; }
  public get portfolio(): Portfolio { return this._portfolio; }
  public get limitOrders(): Order[] { return this._limitOrders; }
  public get createdAt(): number { return this._createdAt; }

  public setUsername(name: string): void {
    if (name.trim().length > 0) {
      this._username = name.trim();
    }
  }

  /**
   * Places a limit order
   */
  public addLimitOrder(params: { symbol: string; type: 'BUY' | 'SELL'; targetPrice: number; shares: number }): Order {
    const order = new Order(params);
    this._limitOrders.unshift(order);
    return order;
  }

  /**
   * Cancels a pending limit order
   */
  public cancelLimitOrder(orderId: string): boolean {
    const order = this._limitOrders.find((o) => o.id === orderId);
    if (order && order.status === 'PENDING') {
      order.cancel();
      return true;
    }
    return false;
  }

  /**
   * Scans pending limit orders and automatically triggers execution if target prices match current market conditions
   */
  public checkAndExecuteLimitOrders(stocksMap: Map<string, Stock>): { executedOrders: Order[]; transactions: Transaction[] } {
    const executedOrders: Order[] = [];
    const transactions: Transaction[] = [];

    for (const order of this._limitOrders) {
      if (order.status !== 'PENDING') continue;

      const stock = stocksMap.get(order.symbol);
      if (!stock) continue;

      if (order.shouldExecute(stock.price)) {
        try {
          let tx: Transaction;
          if (order.type === 'BUY') {
            tx = this._portfolio.buyStock(stock, order.shares, order.targetPrice, 'LIMIT');
          } else {
            tx = this._portfolio.sellStock(stock, order.shares, order.targetPrice, 'LIMIT');
          }
          order.execute();
          executedOrders.push(order);
          transactions.push(tx);
        } catch {
          // If execution fails (e.g. not enough cash at moment of trigger), order remains pending or is skipped
        }
      }
    }

    return { executedOrders, transactions };
  }

  public toJSON(): UserAccountData {
    const positionsObj: Record<string, any> = {};
    for (const [sym, pos] of this._portfolio.positions.entries()) {
      positionsObj[sym] = pos.toJSON();
    }

    return {
      id: this._id,
      username: this._username,
      initialDeposit: this._portfolio.initialDeposit,
      cashBalance: this._portfolio.cashBalance,
      positions: positionsObj,
      transactions: this._portfolio.transactions.map((t) => t.toJSON()),
      limitOrders: this._limitOrders.map((o) => o.toJSON()),
      performanceHistory: this._portfolio.performanceHistory,
      createdAt: this._createdAt,
      lastUpdated: Date.now(),
    };
  }

  public static fromData(data: UserAccountData): UserAccount {
    const user = new UserAccount(data.username, data.initialDeposit, data.id);
    user._createdAt = data.createdAt || Date.now();
    user._portfolio = Portfolio.fromData({
      initialDeposit: data.initialDeposit,
      cashBalance: data.cashBalance,
      positions: data.positions as any,
      transactions: data.transactions,
      performanceHistory: data.performanceHistory,
    });

    if (data.limitOrders && Array.isArray(data.limitOrders)) {
      user._limitOrders = data.limitOrders.map(
        (o) =>
          new Order({
            id: o.id,
            timestamp: o.timestamp,
            symbol: o.symbol,
            type: o.type,
            targetPrice: o.targetPrice,
            shares: o.shares,
            status: o.status,
            createdAt: o.createdAt,
          })
      );
    }

    return user;
  }
}
