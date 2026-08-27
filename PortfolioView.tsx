import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Stock } from '../models/Stock';
import { UserAccount } from '../models/UserAccount';

interface PortfolioViewProps {
  user: UserAccount;
  stocksMap: Map<string, Stock>;
  onOpenTrade: (stock: Stock, type: 'BUY' | 'SELL') => void;
  onExploreMarket: () => void;
}

const SECTOR_COLORS = [
  '#00C805', // bright green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  user,
  stocksMap,
  onOpenTrade,
  onExploreMarket,
}) => {
  const portfolio = user.portfolio;
  const positionsMetrics = portfolio.getPositionsMetrics(stocksMap);
  const totalNetWorth = portfolio.calculateTotalValue(stocksMap);
  const investedValue = portfolio.calculateInvestedValue(stocksMap);
  const cashBalance = portfolio.cashBalance;
  const initialDeposit = portfolio.initialDeposit;
  const totalPnL = Number((totalNetWorth - initialDeposit).toFixed(2));
  const totalReturnPercent = initialDeposit > 0 ? Number(((totalPnL / initialDeposit) * 100).toFixed(2)) : 0;
  const isOverallPositive = totalPnL >= 0;

  // Performance history points for area chart
  const historyData = portfolio.performanceHistory.map((snap) => ({
    time: snap.formattedTime,
    totalValue: snap.totalValue,
    cashBalance: snap.cashBalance,
    investedValue: snap.investedValue,
  }));

  // Allocation data for donut chart
  const allocationData = positionsMetrics.map((p) => ({
    name: p.symbol,
    value: p.currentValue,
  }));

  if (cashBalance > 0) {
    allocationData.push({
      name: 'Cash',
      value: cashBalance,
    });
  }

  return (
    <div className="space-y-4">
      
      {/* 1. Portfolio KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Net Worth */}
        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="flex items-center justify-between text-[#8E9299] text-[9px] uppercase font-bold tracking-wider">
            <span>Portfolio Value</span>
            <Wallet className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-mono">
            <span className={isOverallPositive ? 'text-[#00C805] font-bold' : 'text-[#FF3B30] font-bold'}>
              {isOverallPositive ? '+' : ''}${totalPnL.toLocaleString()} ({isOverallPositive ? '+' : ''}
              {totalReturnPercent.toFixed(2)}%)
            </span>
            <span className="text-[#8E9299] text-[9px]">TOTAL RETURN</span>
          </div>
        </div>

        {/* Invested Equity */}
        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="flex items-center justify-between text-[#8E9299] text-[9px] uppercase font-bold tracking-wider">
            <span>Stock Holdings</span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${investedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#8E9299] mt-1 font-mono">
            Across {positionsMetrics.length} active {positionsMetrics.length === 1 ? 'position' : 'positions'}
          </div>
        </div>

        {/* Cash Balance */}
        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="flex items-center justify-between text-[#8E9299] text-[9px] uppercase font-bold tracking-wider">
            <span>Buying Power (Cash)</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#8E9299] mt-1 font-mono">
            {totalNetWorth > 0 ? ((cashBalance / totalNetWorth) * 100).toFixed(1) : 100}% unallocated
          </div>
        </div>

        {/* Starting Capital */}
        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="flex items-center justify-between text-[#8E9299] text-[9px] uppercase font-bold tracking-wider">
            <span>Initial Capital</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${initialDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#8E9299] mt-1 font-mono">Base principal deposit</div>
        </div>
      </div>

      {/* 2. Performance Over Time Chart & Asset Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Performance Chart (8 cols) */}
        <div className="lg:col-span-8 p-4 rounded bg-[#0F141C] border border-[#1C2128] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1C2128] pb-2.5">
            <div>
              <h3 className="font-bold text-sm text-white">Portfolio Performance Curve</h3>
              <p className="text-[10px] text-[#8E9299]">Continuous valuation tracking across market ticks</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8E9299] font-mono">Current Valuation: </span>
              <span className="text-xs font-bold font-mono text-[#00C805]">${totalNetWorth.toFixed(2)}</span>
            </div>
          </div>

          <div className="h-60 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#1C2128" opacity={0.8} />
                <XAxis
                  dataKey="time"
                  stroke="#8E9299"
                  tick={{ fontSize: 9, fill: '#8E9299', fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#1C2128' }}
                />
                <YAxis
                  stroke="#8E9299"
                  tick={{ fontSize: 9, fill: '#8E9299', fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#1C2128' }}
                  orientation="right"
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0A0E14] border border-[#1C2128] rounded p-2 text-[10px] font-mono shadow-2xl">
                          <div className="text-[#8E9299]">{data.time}</div>
                          <div className="font-bold text-white text-xs mt-0.5">
                            Net Worth: ${data.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[#00C805] mt-0.5">
                            Stocks: ${data.investedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[#8E9299]">
                            Cash: ${data.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalValue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Allocation (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded bg-[#0F141C] border border-[#1C2128] flex flex-col justify-between space-y-2">
          <div className="border-b border-[#1C2128] pb-2">
            <h3 className="font-bold text-sm text-white">Asset Allocation</h3>
            <p className="text-[10px] text-[#8E9299]">Portfolio distribution by weight</p>
          </div>

          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={66}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Cash' ? '#475569' : SECTOR_COLORS[index % SECTOR_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Value']}
                  contentStyle={{ backgroundColor: '#0A0E14', borderColor: '#1C2128', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono max-h-24 overflow-y-auto pr-1">
            {allocationData.map((item, idx) => {
              const pct = totalNetWorth > 0 ? ((item.value / totalNetWorth) * 100).toFixed(1) : '0.0';
              return (
                <div key={item.name} className="flex items-center justify-between p-1 bg-[#151921] rounded border border-[#1C2128]">
                  <div className="flex items-center gap-1 truncate">
                    <span
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{
                        backgroundColor:
                          item.name === 'Cash' ? '#475569' : SECTOR_COLORS[idx % SECTOR_COLORS.length],
                      }}
                    />
                    <span className="font-bold text-white truncate">{item.name}</span>
                  </div>
                  <span className="text-[#8E9299] shrink-0 font-bold">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. High Density Positions Table */}
      <div className="bg-[#0A0E14] border border-[#1C2128] rounded overflow-hidden">
        <div className="p-3 bg-[#0F141C] border-b border-[#1C2128] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Open Positions ({positionsMetrics.length})
            </span>
          </div>
          <button
            id="btn-explore-more-stocks"
            onClick={onExploreMarket}
            className="text-xs text-blue-400 hover:underline font-bold uppercase"
          >
            + Trade Equities
          </button>
        </div>

        {positionsMetrics.length === 0 ? (
          <div className="py-10 text-center text-[#8E9299] space-y-2">
            <p className="text-xs">No active stock holdings in portfolio.</p>
            <button
              onClick={onExploreMarket}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider"
            >
              Browse Market Equities
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-[#0F141C] text-[#8E9299] uppercase text-[9px] font-sans border-b border-[#1C2128]">
                <tr>
                  <th className="px-3 py-2 font-medium">Symbol</th>
                  <th className="px-3 py-2 font-medium">Quantity</th>
                  <th className="px-3 py-2 font-medium">Avg Cost</th>
                  <th className="px-3 py-2 font-medium">Market Price</th>
                  <th className="px-3 py-2 font-medium">Market Value</th>
                  <th className="px-3 py-2 font-medium text-right">Unrealized P/L</th>
                  <th className="px-3 py-2 font-medium text-right font-sans">Quick Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2128]">
                {positionsMetrics.map((pos) => {
                  const stock = stocksMap.get(pos.symbol);
                  const isPosProfitable = pos.unrealizedPnL >= 0;

                  return (
                    <tr key={pos.symbol} className="hover:bg-[#151921] transition-colors">
                      <td className="px-3 py-2 font-sans font-bold text-white">
                        {pos.symbol}
                      </td>
                      <td className="px-3 py-2 text-white">{pos.shares}</td>
                      <td className="px-3 py-2 text-[#8E9299]">${pos.avgBuyPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-white">${pos.currentPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 font-bold text-white">
                        ${pos.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${isPosProfitable ? 'text-[#00C805]' : 'text-[#FF3B30]'}`}>
                        {isPosProfitable ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} ({isPosProfitable ? '+' : ''}
                        {pos.unrealizedPnLPercent.toFixed(2)}%)
                      </td>
                      <td className="px-3 py-2 text-right">
                        {stock && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`btn-portfolio-buy-${pos.symbol}`}
                              onClick={() => onOpenTrade(stock, 'BUY')}
                              className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider"
                            >
                              Buy
                            </button>
                            <button
                              id={`btn-portfolio-sell-${pos.symbol}`}
                              onClick={() => onOpenTrade(stock, 'SELL')}
                              className="px-2 py-0.5 rounded bg-[#1C2128] hover:bg-[#FF3B30] text-[#D1D4DC] hover:text-white text-[10px] font-bold uppercase tracking-wider border border-[#363A45]"
                            >
                              Sell
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
