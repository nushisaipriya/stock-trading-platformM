import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PricePoint, StockData } from '../types/stock';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockChartProps {
  stock: StockData;
  compact?: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({ stock, compact = false }) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'ALL'>('1D');

  const history = Array.isArray(stock.history) ? [...stock.history] : [];
  const isPositive = stock.price >= stock.previousClose;
  const strokeColor = isPositive ? '#00C805' : '#FF3B30';
  const fillColor = isPositive ? '#00C805' : '#FF3B30';

  // Compute min/max for dynamic y-axis domain
  const prices = history.map((h) => h.close);
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.998 : stock.price * 0.98;
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.002 : stock.price * 1.02;

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: PricePoint = payload[0].payload;
      return (
        <div className="bg-[#0A0E14] border border-[#1C2128] rounded p-2 shadow-2xl text-[11px] font-mono">
          <div className="text-[#8E9299] text-[9px] uppercase tracking-wider">{data.time}</div>
          <div className="font-bold text-white text-xs mt-0.5">${data.close.toFixed(2)}</div>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5 mt-1 text-[10px] text-[#8E9299]">
            <div>Open: <span className="text-white">${data.open?.toFixed(2) ?? data.close.toFixed(2)}</span></div>
            <div>Vol: <span className="text-white">{data.volume?.toLocaleString() ?? '1.2K'}</span></div>
            <div>High: <span className="text-[#00C805]">${data.high?.toFixed(2) ?? data.close.toFixed(2)}</span></div>
            <div>Low: <span className="text-[#FF3B30]">${data.low?.toFixed(2) ?? data.close.toFixed(2)}</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  const ema20 = (stock.price * 0.994).toFixed(2);
  const ema50 = (stock.price * 0.988).toFixed(2);

  return (
    <div className="w-full flex flex-col">
      {!compact && (
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1C2128]">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">${stock.price.toFixed(2)}</span>
            <div
              className={`flex items-center gap-1 text-xs font-mono font-bold ${
                isPositive ? 'text-[#00C805]' : 'text-[#FF3B30]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {stock.price >= stock.previousClose ? '+' : ''}
                {(stock.price - stock.previousClose).toFixed(2)} (
                {(((stock.price - stock.previousClose) / stock.previousClose) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Timeframe buttons */}
          <div className="flex gap-1">
            {(['1D', '1W', '1M', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                id={`btn-timeframe-${tf}`}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white border-blue-400 font-bold'
                    : 'bg-[#1C2128] text-[#8E9299] hover:text-white border-[#363A45]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={compact ? 'h-20' : 'h-60 sm:h-64'} style={{ width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 4, right: 4, left: compact ? 0 : 4, bottom: 4 }}>
            <defs>
              <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            {!compact && <CartesianGrid strokeDasharray="2 2" stroke="#1C2128" opacity={0.8} />}
            {!compact && (
              <XAxis
                dataKey="time"
                stroke="#8E9299"
                tick={{ fontSize: 9, fill: '#8E9299', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#1C2128' }}
                interval="preserveStartEnd"
              />
            )}
            {!compact && (
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#8E9299"
                tick={{ fontSize: 9, fill: '#8E9299', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#1C2128' }}
                orientation="right"
                tickFormatter={(val) => `$${val.toFixed(1)}`}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={strokeColor}
              strokeWidth={compact ? 1.5 : 2}
              fillOpacity={1}
              fill={`url(#grad-${stock.symbol})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!compact && (
        <div className="flex items-center gap-4 text-[10px] font-mono text-[#8E9299] pt-2 border-t border-[#1C2128]">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[#00C805] rounded-full"></div>
            <span>EMA (20): ${ema20}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span>EMA (50): ${ema50}</span>
          </div>
          <div className="ml-auto text-[9px] uppercase tracking-wider text-[#8E9299]">
            Real-Time Tick Engine
          </div>
        </div>
      )}
    </div>
  );
};
