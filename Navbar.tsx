import React from 'react';
import {
  Play,
  Pause,
  PieChart,
  History,
  Clock,
  PlusCircle,
  BarChart3,
  FileCode,
} from 'lucide-react';
import { MarketCondition } from '../types/stock';

interface NavbarProps {
  activeTab: 'market' | 'portfolio' | 'history' | 'limitOrders' | 'javaSource';
  setActiveTab: (tab: 'market' | 'portfolio' | 'history' | 'limitOrders' | 'javaSource') => void;
  isRunning: boolean;
  onTogglePause: () => void;
  speed: number;
  onSetSpeed: (speed: number) => void;
  marketCondition: MarketCondition;
  onSetCondition: (c: MarketCondition) => void;
  totalNetWorth: number;
  cashBalance: number;
  onDeposit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isRunning,
  onTogglePause,
  speed,
  onSetSpeed,
  marketCondition,
  onSetCondition,
  totalNetWorth,
  cashBalance,
  onDeposit,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F141C] border-b border-[#1C2128] text-[#D1D4DC] shadow-sm select-none">
      {/* Top Bar with Brand, Market Engine Controls, and User Equity */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <div className="flex items-center justify-between h-[52px] gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-5">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setActiveTab('market')}
            >
              <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center font-bold text-white text-xs shadow-sm">
                Q
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white uppercase">
                  QuantTrade
                </span>
                <span className="text-blue-400 font-mono text-[10px] hidden sm:inline">Terminal</span>
              </div>
            </div>

            {/* Quick Net Worth & Cash Tickers in Header */}
            <div className="hidden md:flex items-center gap-5 text-[11px] font-medium border-l border-[#1C2128] pl-4">
              <div className="flex flex-col">
                <span className="text-[#8E9299] uppercase text-[9px] font-bold tracking-wider">Portfolio Value</span>
                <span className="text-white font-mono font-bold">
                  ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[#8E9299] uppercase text-[9px] font-bold tracking-wider">Buying Power</span>
                <span className="text-white font-mono">
                  ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[#8E9299] uppercase text-[9px] font-bold tracking-wider">Market Status</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isRunning ? 'bg-[#00C805] shadow-[0_0_6px_#00C805]' : 'bg-amber-400'
                    }`}
                  />
                  <span className={`text-[10px] font-bold uppercase ${isRunning ? 'text-[#00C805]' : 'text-amber-400'}`}>
                    {isRunning ? 'NYSE Live' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Simulation Controls */}
          <div className="flex items-center gap-2">
            
            {/* Speed & Pause */}
            <div className="flex items-center bg-[#151921] p-1 rounded border border-[#1C2128] gap-1">
              <button
                id="btn-toggle-pause"
                onClick={onTogglePause}
                className={`p-1 rounded text-[10px] font-medium transition-all ${
                  isRunning
                    ? 'bg-[#1C2128] hover:bg-[#363A45] text-[#D1D4DC]'
                    : 'bg-blue-600 hover:bg-blue-500 text-white font-bold'
                }`}
                title={isRunning ? 'Pause Engine' : 'Resume Engine'}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center bg-[#0A0E14] rounded p-0.5 border border-[#1C2128]">
                {[1, 2, 5].map((s) => (
                  <button
                    key={s}
                    id={`btn-speed-${s}x`}
                    onClick={() => onSetSpeed(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      speed === s
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-[#8E9299] hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Market Condition */}
              <select
                id="select-market-condition"
                value={marketCondition}
                onChange={(e) => onSetCondition(e.target.value as MarketCondition)}
                className="bg-[#0A0E14] text-[11px] text-white font-medium border border-[#1C2128] rounded px-2 py-0.5 focus:outline-none focus:border-blue-500 hidden sm:block"
              >
                <option value="STABLE_GROWTH">Stable Growth</option>
                <option value="BULL_MARKET">Bull Market</option>
                <option value="BEAR_MARKET">Bear Market</option>
                <option value="HIGH_VOLATILITY">High Volatility</option>
              </select>
            </div>

            {/* Quick Actions (Deposit) */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-nav-deposit"
                onClick={onDeposit}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00C805]/10 hover:bg-[#00C805]/20 text-[#00C805] border border-[#00C805]/30 text-[11px] font-bold uppercase tracking-wider transition-colors"
                title="Deposit Capital"
              >
                <PlusCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Deposit</span>
              </button>
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#1C2128]">
              <div className="h-7 w-7 rounded bg-[#1C2128] border border-[#363A45] flex items-center justify-center text-[10px] font-bold text-white">
                AT
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-[11px] font-bold text-white leading-none">Alex Trader</div>
                <div className="text-[9px] text-[#00C805] font-mono leading-none mt-0.5">ONLINE</div>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation - High Density Dock Style */}
        <nav className="flex space-x-1 overflow-x-auto scrollbar-none border-t border-[#1C2128]">
          <button
            id="tab-market"
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'market'
                ? 'border-b-2 border-blue-500 bg-[#151921] text-white'
                : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Market Watch & Trade</span>
          </button>

          <button
            id="tab-portfolio"
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'portfolio'
                ? 'border-b-2 border-blue-500 bg-[#151921] text-white'
                : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portfolio Performance</span>
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 bg-[#151921] text-white'
                : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trade Ledger</span>
          </button>

          <button
            id="tab-limit-orders"
            onClick={() => setActiveTab('limitOrders')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'limitOrders'
                ? 'border-b-2 border-blue-500 bg-[#151921] text-white'
                : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Limit Orders</span>
          </button>

          <button
            id="tab-java-source"
            onClick={() => setActiveTab('javaSource')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'javaSource'
                ? 'border-b-2 border-amber-500 bg-[#151921] text-amber-300'
                : 'text-[#8E9299] hover:text-white border-b-2 border-transparent'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Java Source Code (.java)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
