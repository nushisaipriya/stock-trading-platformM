import React, { useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  Activity,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Stock } from '../models/Stock';
import { UserAccount } from '../models/UserAccount';
import { MarketNewsItem } from '../types/stock';
import { StockChart } from './StockChart';

interface MarketOverviewProps {
  stocks: Stock[];
  user: UserAccount;
  indices: {
    sp500: { value: number; change: number; changePercent: number };
    nasdaq: { value: number; change: number; changePercent: number };
    dow: { value: number; change: number; changePercent: number };
  };
  newsFeed: MarketNewsItem[];
  onOpenTrade: (stock: Stock, type: 'BUY' | 'SELL') => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  stocks,
  user,
  indices,
  newsFeed,
  onOpenTrade,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'change' | 'price' | 'volume' | 'name'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>(stocks[0]?.symbol || 'AAPL');

  const sectors = useMemo(() => {
    const list = Array.from(new Set(stocks.map((s) => s.sector)));
    return ['ALL', ...list];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        const matchesSearch =
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSector = selectedSector === 'ALL' || s.sector === selectedSector;
        return matchesSearch && matchesSector;
      })
      .sort((a, b) => {
        let factor = sortOrder === 'desc' ? -1 : 1;
        if (sortBy === 'change') {
          return (a.changePercent - b.changePercent) * factor;
        } else if (sortBy === 'price') {
          return (a.price - b.price) * factor;
        } else if (sortBy === 'volume') {
          return (a.volume - b.volume) * factor;
        } else {
          return a.symbol.localeCompare(b.symbol) * factor;
        }
      });
  }, [stocks, searchQuery, selectedSector, sortBy, sortOrder]);

  const activeStock = stocks.find((s) => s.symbol === selectedStockSymbol) || stocks[0];
  const userPosition = activeStock ? user.portfolio.getPosition(activeStock.symbol) : undefined;
  const latestNews = newsFeed[0];

  // Calculated technicals for high-density panel
  const rsiVal = activeStock ? Math.min(85, Math.max(25, 50 + activeStock.changePercent * 4.5)).toFixed(1) : '50.0';
  const isBullishMacd = activeStock ? activeStock.change >= 0 : true;

  return (
    <div className="space-y-4">
      
      {/* 1. High Density Market Indices Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* S&P 500 */}
        <div className="p-3 bg-[#0F141C] border border-[#1C2128] rounded flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[#8E9299] uppercase font-bold tracking-wider">S&P 500 Index</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {indices.sp500.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
              indices.sp500.change >= 0 ? 'bg-[#00C805]/10 text-[#00C805]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
            }`}
          >
            {indices.sp500.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {indices.sp500.change >= 0 ? '+' : ''}
              {indices.sp500.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* NASDAQ */}
        <div className="p-3 bg-[#0F141C] border border-[#1C2128] rounded flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[#8E9299] uppercase font-bold tracking-wider">NASDAQ 100</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {indices.nasdaq.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
              indices.nasdaq.change >= 0 ? 'bg-[#00C805]/10 text-[#00C805]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
            }`}
          >
            {indices.nasdaq.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {indices.nasdaq.change >= 0 ? '+' : ''}
              {indices.nasdaq.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* DOW */}
        <div className="p-3 bg-[#0F141C] border border-[#1C2128] rounded flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[#8E9299] uppercase font-bold tracking-wider">Dow Jones Industrial</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {indices.dow.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
              indices.dow.change >= 0 ? 'bg-[#00C805]/10 text-[#00C805]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
            }`}
          >
            {indices.dow.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {indices.dow.change >= 0 ? '+' : ''}
              {indices.dow.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. News Banner / Catalyst Ticker */}
      {latestNews && (
        <div className="px-3 py-2 bg-[#0F141C] border border-[#1C2128] rounded flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>CATALYST</span>
            </span>
            <span className="text-white font-medium truncate text-xs">{latestNews.title}</span>
            <span className="text-[#8E9299] hidden lg:inline truncate text-[11px]">— {latestNews.content}</span>
          </div>
          <span className="text-[10px] text-[#8E9299] font-mono shrink-0">
            {new Date(latestNews.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* 3. Main Market Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Watchlist & Multi-Stock Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Search, Sort & Sector Filter Bar */}
          <div className="p-3 bg-[#0F141C] border border-[#1C2128] rounded space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E9299]" />
                <input
                  id="input-market-search"
                  type="text"
                  placeholder="Filter ticker (AAPL, NVDA, TSLA) or company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151921] border border-[#363A45] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8E9299] focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <select
                  id="select-market-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#151921] text-[11px] text-white border border-[#363A45] rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="change">% Daily Change</option>
                  <option value="price">Share Price</option>
                  <option value="volume">Trading Volume</option>
                  <option value="name">Ticker A-Z</option>
                </select>

                <button
                  id="btn-sort-order"
                  onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="p-1.5 bg-[#151921] border border-[#363A45] rounded text-[#8E9299] hover:text-white"
                  title="Toggle Asc/Desc"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sector Tags */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
              <span className="text-[#8E9299] uppercase font-bold flex items-center gap-1 mr-1 shrink-0 text-[9px]">
                <Filter className="w-2.5 h-2.5" />
                <span>Sector:</span>
              </span>
              {sectors.map((sec) => (
                <button
                  key={sec}
                  id={`btn-sector-${sec}`}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-2 py-0.5 rounded transition-colors shrink-0 font-medium ${
                    selectedSector === sec
                      ? 'bg-blue-600 text-white font-bold border border-blue-400'
                      : 'bg-[#151921] text-[#8E9299] hover:text-white border border-[#1C2128]'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* High Density Watchlist Table Container */}
          <div className="bg-[#0A0E14] border border-[#1C2128] rounded overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-3 py-2 bg-[#0F141C] border-b border-[#1C2128] text-[9px] uppercase font-bold text-[#8E9299] tracking-wider">
              <span className="col-span-4 sm:col-span-3">Symbol / Company</span>
              <span className="col-span-3 text-right">Price</span>
              <span className="col-span-2 text-right">Chg%</span>
              <span className="col-span-2 hidden sm:block text-center">Trend</span>
              <span className="col-span-3 sm:col-span-2 text-right">Trade</span>
            </div>

            {/* Stock Rows */}
            <div className="divide-y divide-[#1C2128] font-mono text-[11px]">
              {filteredStocks.map((stock) => {
                const isPositive = stock.change >= 0;
                const isSelected = stock.symbol === selectedStockSymbol;
                const pos = user.portfolio.getPosition(stock.symbol);

                return (
                  <div
                    key={stock.symbol}
                    id={`card-stock-${stock.symbol}`}
                    onClick={() => setSelectedStockSymbol(stock.symbol)}
                    className={`grid grid-cols-12 px-3 py-2 items-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#151921] border-l-2 border-l-blue-500'
                        : 'hover:bg-[#151921]/60'
                    }`}
                  >
                    {/* Symbol & Name */}
                    <div className="col-span-4 sm:col-span-3">
                      <div className="flex items-center gap-1.5 font-sans">
                        <span className="font-bold text-white text-xs">{stock.symbol}</span>
                        {pos && pos.shares > 0 && (
                          <span className="px-1 py-0.2 rounded bg-[#00C805]/10 text-[#00C805] text-[9px] font-mono font-bold">
                            {pos.shares}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8E9299] truncate max-w-[130px] font-sans">
                        {stock.name}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-3 text-right">
                      <span className="font-bold text-white text-xs">${stock.price.toFixed(2)}</span>
                      <div className="text-[10px] text-[#8E9299] hidden sm:block">
                        Vol: {(stock.volume / 1000).toFixed(0)}k
                      </div>
                    </div>

                    {/* Change % */}
                    <div className={`col-span-2 text-right font-bold ${isPositive ? 'text-[#00C805]' : 'text-[#FF3B30]'}`}>
                      <span>
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    {/* Sparkline */}
                    <div className="col-span-2 hidden sm:flex items-center justify-center px-1">
                      <div className="w-20 h-6">
                        <StockChart stock={stock.toJSON()} compact />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`btn-quick-buy-${stock.symbol}`}
                        onClick={() => onOpenTrade(stock, 'BUY')}
                        className="px-2 py-1 rounded bg-[#00C805] text-[#0A0E14] text-[10px] font-bold uppercase tracking-wider hover:bg-[#00C805]/90 transition-colors shadow-sm"
                      >
                        Buy
                      </button>
                      <button
                        id={`btn-quick-sell-${stock.symbol}`}
                        onClick={() => onOpenTrade(stock, 'SELL')}
                        className="px-2 py-1 rounded bg-[#1C2128] hover:bg-[#FF3B30] text-[#D1D4DC] hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors border border-[#363A45]"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Stock Terminal Dock (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {activeStock && (
            <div className="bg-[#0F141C] border border-[#1C2128] rounded p-4 sticky top-20 space-y-4">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#1C2128] pb-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-xl font-bold text-white">{activeStock.name}</h2>
                    <span className="text-[#8E9299] text-xs font-mono">{activeStock.symbol} : NASDAQ</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-mono font-bold text-white">${activeStock.price.toFixed(2)}</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        activeStock.change >= 0 ? 'text-[#00C805]' : 'text-[#FF3B30]'
                      }`}
                    >
                      {activeStock.change >= 0 ? '+' : ''}
                      {activeStock.change.toFixed(2)} ({activeStock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    id="btn-active-buy"
                    onClick={() => onOpenTrade(activeStock, 'BUY')}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Buy
                  </button>
                  <button
                    id="btn-active-sell"
                    onClick={() => onOpenTrade(activeStock, 'SELL')}
                    className="px-3 py-1.5 rounded bg-[#1C2128] hover:bg-[#FF3B30] text-[#D1D4DC] hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-[#363A45]"
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* High Density Chart Box */}
              <div className="p-2 bg-[#0A0E14] rounded border border-[#1C2128]">
                <StockChart stock={activeStock.toJSON()} />
              </div>

              {/* Technical Indicators & Fundamentals Grid */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-wider block">
                  Market Statistics & Fundamentals
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                  <div className="p-2 rounded bg-[#151921] border border-[#1C2128]">
                    <div className="text-[#8E9299] text-[9px] uppercase font-sans">Day High</div>
                    <div className="font-bold text-white text-xs mt-0.5">${activeStock.dayHigh.toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded bg-[#151921] border border-[#1C2128]">
                    <div className="text-[#8E9299] text-[9px] uppercase font-sans">Day Low</div>
                    <div className="font-bold text-white text-xs mt-0.5">${activeStock.dayLow.toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded bg-[#151921] border border-[#1C2128]">
                    <div className="text-[#8E9299] text-[9px] uppercase font-sans">Market Cap</div>
                    <div className="font-bold text-white text-xs mt-0.5">${activeStock.marketCap}B</div>
                  </div>
                  <div className="p-2 rounded bg-[#151921] border border-[#1C2128]">
                    <div className="text-[#8E9299] text-[9px] uppercase font-sans">P/E Ratio</div>
                    <div className="font-bold text-white text-xs mt-0.5">{activeStock.peRatio}</div>
                  </div>
                  <div className="p-2 rounded bg-[#151921] border border-[#1C2128]">
                    <div className="text-[#8E9299] text-[9px] uppercase font-sans">Div Yield</div>
                    <div className="font-bold text-white text-xs mt-0.5">{activeStock.dividendYield}%</div>
                  </div>
                  <div className="p-2 rounded bg-[#151921] border border-[#1C2128]">
                    <div className="text-[#8E9299] text-[9px] uppercase font-sans">Bid / Ask</div>
                    <div className="font-bold text-white text-[11px] mt-0.5">
                      ${activeStock.bid} / ${activeStock.ask}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#151921] border border-[#1C2128] col-span-2">
                    <div className="text-[#8E9299] text-[9px] uppercase font-sans">24h Volume</div>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {activeStock.volume.toLocaleString()} shares
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Technical Analytics */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-wider block">
                  Quick Analytics
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#151921] p-2 rounded border border-[#1C2128]">
                    <div className="text-[9px] text-[#8E9299] uppercase mb-1">RSI (14)</div>
                    <div className="h-1 w-full bg-[#1C2128] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${rsiVal}%` }}></div>
                    </div>
                    <div className="text-right text-[10px] text-white font-mono mt-1">{rsiVal}</div>
                  </div>
                  <div className="bg-[#151921] p-2 rounded border border-[#1C2128] flex flex-col justify-center">
                    <div className="text-[9px] text-[#8E9299] uppercase mb-0.5">MACD Trend</div>
                    <div className={`text-[10px] font-bold ${isBullishMacd ? 'text-[#00C805]' : 'text-[#FF3B30]'}`}>
                      {isBullishMacd ? 'Bullish Signal' : 'Bearish Pressure'}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Position in Active Stock */}
              {userPosition && userPosition.shares > 0 ? (
                <div className="p-3 rounded bg-[#151921] border border-[#00C805]/30 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span className="text-[11px] text-[#00C805] uppercase">Active Position: {userPosition.shares} Shares</span>
                    <span className="font-mono">${(userPosition.shares * activeStock.price).toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1.5 text-[#8E9299] font-mono text-[11px]">
                    <div>Avg: ${userPosition.avgBuyPrice.toFixed(2)}</div>
                    <div>
                      P&L:{' '}
                      <span
                        className={
                          userPosition.calculateMetrics(activeStock.price).unrealizedPnL >= 0
                            ? 'text-[#00C805] font-bold'
                            : 'text-[#FF3B30] font-bold'
                        }
                      >
                        ${userPosition.calculateMetrics(activeStock.price).unrealizedPnL.toFixed(2)} (
                        {userPosition.calculateMetrics(activeStock.price).unrealizedPnLPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded bg-[#151921] border border-[#1C2128] text-xs text-[#8E9299] flex items-center justify-between">
                  <span>0 shares owned in portfolio.</span>
                  <button
                    onClick={() => onOpenTrade(activeStock, 'BUY')}
                    className="text-blue-400 hover:underline font-bold text-xs uppercase"
                  >
                    Open Position →
                  </button>
                </div>
              )}

              {/* Description */}
              <div className="text-[11px] text-[#8E9299] leading-relaxed border-t border-[#1C2128] pt-2">
                <span className="text-white font-medium">Profile: </span>
                {activeStock.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
