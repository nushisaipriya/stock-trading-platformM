import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Stock } from '../models/Stock';
import { UserAccount } from '../models/UserAccount';
import { OrderExecutionType, OrderType } from '../types/stock';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  user: UserAccount;
  initialType?: OrderType;
  onTradeExecuted: (message: string, isSuccess: boolean) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  stock,
  user,
  initialType = 'BUY',
  onTradeExecuted,
}) => {
  if (!isOpen || !stock) return null;

  const [orderType, setOrderType] = useState<OrderType>(initialType);
  const [executionType, setExecutionType] = useState<OrderExecutionType>('MARKET');
  const [shares, setShares] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(stock.price);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setOrderType(initialType);
    setLimitPrice(stock.price);
    setErrorMsg(null);
  }, [stock, initialType]);

  const currentPosition = user.portfolio.getPosition(stock.symbol);
  const ownedShares = currentPosition ? currentPosition.shares : 0;
  const cashAvailable = user.portfolio.cashBalance;

  // Price calculations
  const effectivePrice = executionType === 'MARKET' ? (orderType === 'BUY' ? stock.ask : stock.bid) : limitPrice;
  const totalAmount = Number((shares * effectivePrice).toFixed(2));

  // Max calculations
  const maxBuyShares = effectivePrice > 0 ? Math.floor(cashAvailable / effectivePrice) : 0;
  const maxSellShares = ownedShares;

  const handlePercentageClick = (percent: number) => {
    if (orderType === 'BUY') {
      const targetShares = Math.floor((cashAvailable * (percent / 100)) / (effectivePrice || stock.price));
      setShares(Math.max(1, targetShares));
    } else {
      const targetShares = Math.floor(ownedShares * (percent / 100));
      setShares(Math.max(1, targetShares));
    }
  };

  const handleExecute = () => {
    setErrorMsg(null);

    if (shares <= 0 || !Number.isInteger(shares)) {
      setErrorMsg('Please enter a valid positive number of shares.');
      return;
    }

    if (executionType === 'LIMIT' && (limitPrice <= 0 || isNaN(limitPrice))) {
      setErrorMsg('Please enter a valid limit price.');
      return;
    }

    try {
      if (executionType === 'MARKET') {
        if (orderType === 'BUY') {
          user.portfolio.buyStock(stock, shares, effectivePrice, 'MARKET');
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
          onTradeExecuted(`Bought ${shares} shares of ${stock.symbol} @ $${effectivePrice.toFixed(2)}`, true);
        } else {
          user.portfolio.sellStock(stock, shares, effectivePrice, 'MARKET');
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
          onTradeExecuted(`Sold ${shares} shares of ${stock.symbol} @ $${effectivePrice.toFixed(2)}`, true);
        }
      } else {
        // Limit Order
        user.addLimitOrder({
          symbol: stock.symbol,
          type: orderType,
          targetPrice: limitPrice,
          shares,
        });
        onTradeExecuted(
          `Placed ${orderType} Limit Order: ${shares} ${stock.symbol} @ target $${limitPrice.toFixed(2)}`,
          true
        );
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0A0E14]/85 backdrop-blur-xs">
      <div className="bg-[#0F141C] border border-[#1C2128] rounded max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C2128]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#151921] border border-[#1C2128] flex items-center justify-center font-bold text-white font-mono text-xs">
              {stock.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">{stock.symbol}</h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#151921] text-[#8E9299] font-medium">
                  {stock.sector}
                </span>
              </div>
              <p className="text-[10px] text-[#8E9299] truncate max-w-[200px]">{stock.name}</p>
            </div>
          </div>
          <button
            id="btn-close-trade-modal"
            onClick={onClose}
            className="p-1 rounded text-[#8E9299] hover:text-white hover:bg-[#151921] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5">
          {/* Market Price Banner */}
          <div className="flex items-center justify-between p-2.5 rounded bg-[#0A0E14] border border-[#1C2128]">
            <div>
              <div className="text-[9px] text-[#8E9299] uppercase tracking-wider">Market Quote</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">${stock.price.toFixed(2)}</div>
            </div>
            <div className="text-right text-[10px] font-mono">
              <div className="text-[#8E9299]">
                Bid: <span className="text-white">${stock.bid.toFixed(2)}</span> | Ask:{' '}
                <span className="text-white">${stock.ask.toFixed(2)}</span>
              </div>
              <div className="text-[#8E9299] mt-0.5">
                Holding: <span className="text-[#00C805] font-bold">{ownedShares} shares</span>
              </div>
            </div>
          </div>

          {/* Action Tabs: BUY vs SELL */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0A0E14] rounded border border-[#1C2128]">
            <button
              id="tab-trade-buy"
              onClick={() => setOrderType('BUY')}
              className={`py-1.5 rounded font-bold text-xs uppercase tracking-wider transition-all ${
                orderType === 'BUY'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#8E9299] hover:text-white'
              }`}
            >
              Buy {stock.symbol}
            </button>
            <button
              id="tab-trade-sell"
              onClick={() => setOrderType('SELL')}
              className={`py-1.5 rounded font-bold text-xs uppercase tracking-wider transition-all ${
                orderType === 'SELL'
                  ? 'bg-[#FF3B30] text-white shadow-sm'
                  : 'text-[#8E9299] hover:text-white'
              }`}
            >
              Sell {stock.symbol}
            </button>
          </div>

          {/* Order Type: MARKET vs LIMIT */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#8E9299] text-[10px] uppercase font-bold tracking-wider">Execution Type</span>
            <div className="flex bg-[#0A0E14] rounded p-0.5 border border-[#1C2128] text-[10px] font-bold uppercase">
              <button
                id="btn-execution-market"
                onClick={() => setExecutionType('MARKET')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  executionType === 'MARKET' ? 'bg-[#151921] text-white border border-[#363A45]' : 'text-[#8E9299]'
                }`}
              >
                Market Order
              </button>
              <button
                id="btn-execution-limit"
                onClick={() => setExecutionType('LIMIT')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  executionType === 'LIMIT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-[#8E9299]'
                }`}
              >
                Limit Order
              </button>
            </div>
          </div>

          {/* Limit Price Input (Only for LIMIT) */}
          {executionType === 'LIMIT' && (
            <div className="p-2.5 rounded bg-[#0A0E14] border border-amber-500/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-amber-400">Target Trigger Price ($)</label>
                <span className="text-[10px] font-mono text-[#8E9299]">Current: ${stock.price.toFixed(2)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-[#8E9299] font-mono text-xs">$</span>
                <input
                  id="input-limit-price"
                  type="number"
                  step="0.10"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#151921] border border-[#363A45] rounded pl-6 pr-3 py-1.5 text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <p className="text-[10px] text-[#8E9299]">
                {orderType === 'BUY'
                  ? 'Fills automatically when market ask price drops to or below your limit.'
                  : 'Fills automatically when market bid price rises to or above your limit.'}
              </p>
            </div>
          )}

          {/* Shares Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[10px] font-bold uppercase text-[#8E9299] tracking-wider">Number of Shares</label>
              <span className="text-[10px] text-[#8E9299] font-mono">
                {orderType === 'BUY' ? `Max Buy: ${maxBuyShares}` : `Available: ${maxSellShares}`}
              </span>
            </div>
            <input
              id="input-trade-shares"
              type="number"
              min="1"
              max={orderType === 'SELL' ? ownedShares : undefined}
              value={shares}
              onChange={(e) => setShares(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#151921] border border-[#363A45] rounded px-3 py-1.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick Percentage Chips */}
          <div className="grid grid-cols-4 gap-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                id={`btn-percent-${pct}`}
                onClick={() => handlePercentageClick(pct)}
                className="py-1 rounded bg-[#151921] hover:bg-[#1C2128] text-[#8E9299] hover:text-white text-[10px] font-mono font-bold border border-[#1C2128] transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="p-2.5 rounded bg-[#0A0E14] border border-[#1C2128] space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-[#8E9299]">
              <span>Execution Price:</span>
              <span className="text-white">${effectivePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#8E9299]">
              <span>Brokerage Commission:</span>
              <span className="text-[#00C805] font-bold">$0.00 (Zero Fee)</span>
            </div>
            <div className="flex justify-between text-white font-bold border-t border-[#1C2128] pt-1 text-xs">
              <span>Estimated Total:</span>
              <span className="text-white font-mono">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2 rounded bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            id="btn-confirm-trade"
            onClick={handleExecute}
            className={`w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider text-white transition-all shadow-sm ${
              orderType === 'BUY'
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-[#FF3B30] hover:bg-[#FF3B30]/90'
            }`}
          >
            {executionType === 'MARKET' ? (
              <span>
                Confirm {orderType} {shares} {stock.symbol} (${totalAmount.toFixed(2)})
              </span>
            ) : (
              <span>
                Submit Limit {orderType} Order @ ${limitPrice.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
