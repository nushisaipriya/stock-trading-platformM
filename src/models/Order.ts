import { LimitOrderData, OrderStatus, OrderType } from '../types/stock';

/**
 * Object-Oriented Limit Order Model
 * Represents a pending order waiting for price condition trigger.
 */
export class Order {
  private _id: string;
  private _timestamp: number;
  private _symbol: string;
  private _type: OrderType;
  private _targetPrice: number;
  private _shares: number;
  private _status: OrderStatus;
  private _createdAt: string;

  constructor(params: {
    id?: string;
    timestamp?: number;
    symbol: string;
    type: OrderType;
    targetPrice: number;
    shares: number;
    status?: OrderStatus;
    createdAt?: string;
  }) {
    const ts = params.timestamp || Date.now();
    this._id = params.id || `ORD-${ts}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    this._timestamp = ts;
    this._symbol = params.symbol.toUpperCase();
    this._type = params.type;
    this._targetPrice = params.targetPrice;
    this._shares = params.shares;
    this._status = params.status || 'PENDING';
    this._createdAt = params.createdAt || new Date(ts).toLocaleTimeString();
  }

  public get id(): string { return this._id; }
  public get timestamp(): number { return this._timestamp; }
  public get symbol(): string { return this._symbol; }
  public get type(): OrderType { return this._type; }
  public get targetPrice(): number { return this._targetPrice; }
  public get shares(): number { return this._shares; }
  public get status(): OrderStatus { return this._status; }
  public get createdAt(): string { return this._createdAt; }

  public cancel(): void {
    if (this._status === 'PENDING') {
      this._status = 'CANCELLED';
    }
  }

  public execute(): void {
    if (this._status === 'PENDING') {
      this._status = 'EXECUTED';
    }
  }

  /**
   * Checks if current market price triggers the limit order execution
   */
  public shouldExecute(currentMarketPrice: number): boolean {
    if (this._status !== 'PENDING') return false;
    if (this._type === 'BUY') {
      // Buy limit triggers when current price drops to or below target price
      return currentMarketPrice <= this._targetPrice;
    } else {
      // Sell limit triggers when current price rises to or above target price
      return currentMarketPrice >= this._targetPrice;
    }
  }

  public toJSON(): LimitOrderData {
    return {
      id: this._id,
      timestamp: this._timestamp,
      symbol: this._symbol,
      type: this._type,
      targetPrice: this._targetPrice,
      shares: this._shares,
      status: this._status,
      createdAt: this._createdAt,
    };
  }
}
