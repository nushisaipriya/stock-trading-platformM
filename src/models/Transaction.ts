import { OrderExecutionType, OrderType, TransactionData } from '../types/stock';

/**
 * Object-Oriented Transaction Model
 * Represents an executed trade record for ledger auditing.
 */
export class Transaction {
  private _id: string;
  private _timestamp: number;
  private _formattedDate: string;
  private _symbol: string;
  private _stockName: string;
  private _type: OrderType;
  private _executionType: OrderExecutionType;
  private _shares: number;
  private _price: number;
  private _totalAmount: number;
  private _fees: number;
  private _realizedPnL?: number;

  constructor(params: {
    id?: string;
    timestamp?: number;
    formattedDate?: string;
    symbol: string;
    stockName: string;
    type: OrderType;
    executionType?: OrderExecutionType;
    shares: number;
    price: number;
    fees?: number;
    realizedPnL?: number;
  }) {
    const ts = params.timestamp || Date.now();
    this._id = params.id || `TX-${ts}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    this._timestamp = ts;
    this._formattedDate = params.formattedDate || new Date(ts).toLocaleString();
    this._symbol = params.symbol.toUpperCase();
    this._stockName = params.stockName;
    this._type = params.type;
    this._executionType = params.executionType || 'MARKET';
    this._shares = params.shares;
    this._price = params.price;
    this._fees = params.fees || 0;
    this._totalAmount = Number((params.shares * params.price + (params.type === 'BUY' ? this._fees : -this._fees)).toFixed(2));
    this._realizedPnL = params.realizedPnL !== undefined ? Number(params.realizedPnL.toFixed(2)) : undefined;
  }

  public get id(): string { return this._id; }
  public get timestamp(): number { return this._timestamp; }
  public get formattedDate(): string { return this._formattedDate; }
  public get symbol(): string { return this._symbol; }
  public get stockName(): string { return this._stockName; }
  public get type(): OrderType { return this._type; }
  public get executionType(): OrderExecutionType { return this._executionType; }
  public get shares(): number { return this._shares; }
  public get price(): number { return this._price; }
  public get totalAmount(): number { return this._totalAmount; }
  public get fees(): number { return this._fees; }
  public get realizedPnL(): number | undefined { return this._realizedPnL; }

  public toJSON(): TransactionData {
    return {
      id: this._id,
      timestamp: this._timestamp,
      formattedDate: this._formattedDate,
      symbol: this._symbol,
      stockName: this._stockName,
      type: this._type,
      executionType: this._executionType,
      shares: this._shares,
      price: this._price,
      totalAmount: this._totalAmount,
      fees: this._fees,
      realizedPnL: this._realizedPnL,
    };
  }
}
