import React, { useState, useEffect, useRef, useReducer } from 'react';
import { Navbar } from './components/Navbar';
import { MarketOverview } from './components/MarketOverview';
import { PortfolioView } from './components/PortfolioView';
import { TransactionHistory } from './components/TransactionHistory';
import { LimitOrdersView } from './components/LimitOrdersView';
import { JavaOopArchitecture } from './components/JavaOopArchitecture';
import { TradeModal } from './components/TradeModal';
import { DepositModal } from './components/DepositModal';
import { MarketEngine } from './models/MarketEngine';
import { UserAccount } from './models/UserAccount';
import { Stock } from './models/Stock';
import { FilePersistence } from './models/FilePersistence';
import { MarketCondition, OrderType } from './types/stock';
import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // Force rerender trigger for OOP model state updates
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Market Engine state
  const marketEngineRef = useRef<MarketEngine>(new MarketEngine());
  const [speed, setSpeed] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [marketCondition, setMarketCondition] = useState<MarketCondition>('STABLE_GROWTH');

  // User state
  const userRef = useRef<UserAccount>(
    (() => {
      const saved = FilePersistence.loadFromLocalStorage();
      return saved || new UserAccount('Alex Trader', 100000);
    })()
  );

  // Active view tab
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'history' | 'limitOrders' | 'javaSource'>('market');

  // Modals state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeStock, setTradeStock] = useState<Stock | null>(null);
  const [tradeInitialType, setTradeInitialType] = useState<OrderType>('BUY');

  const [depositModalOpen, setDepositModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Main Simulation Interval
  useEffect(() => {
    const engine = marketEngineRef.current;
    const user = userRef.current;

    let tickCount = 0;

    const interval = setInterval(() => {
      if (!engine.isRunning) return;

      // 1. Tick market stocks
      engine.tick();

      // 2. Scan and execute pending limit orders
      const { executedOrders } = user.checkAndExecuteLimitOrders(engine.stocksMap);
      if (executedOrders.length > 0) {
        executedOrders.forEach((o) => {
          addToast(`Limit Order Filled: ${o.type} ${o.shares} ${o.symbol} @ $${o.targetPrice.toFixed(2)}`, 'success');
        });
      }

      // 3. Record portfolio snapshot periodically
      tickCount++;
      if (tickCount % 2 === 0) {
        user.portfolio.recordSnapshot(engine.stocksMap);
        FilePersistence.saveToLocalStorage(user);
      }

      // 4. Force UI refresh
      forceUpdate();
    }, 2000 / speed);

    return () => clearInterval(interval);
  }, [speed]);

  const handleTogglePause = () => {
    const running = marketEngineRef.current.togglePause();
    setIsRunning(running);
    addToast(running ? 'Market simulation active' : 'Market simulation paused', 'info');
  };

  const handleSetSpeed = (s: number) => {
    setSpeed(s);
    marketEngineRef.current.setSpeedMultiplier(s);
    addToast(`Simulation tick speed set to ${s}x`, 'info');
  };

  const handleSetCondition = (c: MarketCondition) => {
    setMarketCondition(c);
    marketEngineRef.current.setMarketCondition(c);
    addToast(`Market condition switched to ${c.replace('_', ' ')}`, 'info');
  };

  const handleOpenTrade = (stock: Stock, type: 'BUY' | 'SELL') => {
    setTradeStock(stock);
    setTradeInitialType(type);
    setTradeModalOpen(true);
  };

  const handleTradeExecuted = (message: string, isSuccess: boolean) => {
    const user = userRef.current;
    const engine = marketEngineRef.current;
    user.portfolio.recordSnapshot(engine.stocksMap);
    FilePersistence.saveToLocalStorage(user);
    addToast(message, isSuccess ? 'success' : 'error');
    forceUpdate();
  };

  const handleDepositSuccess = (amount: number) => {
    const user = userRef.current;
    const engine = marketEngineRef.current;
    user.portfolio.recordSnapshot(engine.stocksMap);
    FilePersistence.saveToLocalStorage(user);
    addToast(`Deposited $${amount.toLocaleString()} into cash reserve`, 'success');
    forceUpdate();
  };

  const engine = marketEngineRef.current;
  const user = userRef.current;
  const totalNetWorth = user.portfolio.calculateTotalValue(engine.stocksMap);
  const cashBalance = user.portfolio.cashBalance;
  const indices = engine.getMarketIndices();

  return (
    <div className="min-h-screen bg-[#0A0E14] text-[#D1D4DC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRunning={isRunning}
        onTogglePause={handleTogglePause}
        speed={speed}
        onSetSpeed={handleSetSpeed}
        marketCondition={marketCondition}
        onSetCondition={handleSetCondition}
        totalNetWorth={totalNetWorth}
        cashBalance={cashBalance}
        onDeposit={() => setDepositModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-4">
        {activeTab === 'market' && (
          <MarketOverview
            stocks={engine.stocks}
            user={user}
            indices={indices}
            newsFeed={engine.newsFeed}
            onOpenTrade={handleOpenTrade}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioView
            user={user}
            stocksMap={engine.stocksMap}
            onOpenTrade={handleOpenTrade}
            onExploreMarket={() => setActiveTab('market')}
          />
        )}

        {activeTab === 'history' && <TransactionHistory user={user} />}

        {activeTab === 'limitOrders' && (
          <LimitOrdersView
            user={user}
            stocksMap={engine.stocksMap}
            onOpenTradeModal={handleOpenTrade}
            onOrderCancelled={(msg) => {
              addToast(msg, 'info');
              forceUpdate();
            }}
          />
        )}

        {activeTab === 'javaSource' && <JavaOopArchitecture />}
      </main>

      {/* High Density Terminal Footer */}
      <footer className="border-t border-[#1C2128] bg-[#0F141C] py-3 text-[10px] text-[#8E9299]">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider">QuantTrade Terminal</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#00C805] rounded-full"></span>
              <span className="text-[#00C805]">Live Feed Active</span>
            </span>
            <span>Zero Commission</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={tradeStock}
        user={user}
        initialType={tradeInitialType}
        onTradeExecuted={handleTradeExecuted}
      />

      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        user={user}
        onDepositSuccess={handleDepositSuccess}
      />

      {/* High Density Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-1.5 max-w-xs w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-2.5 rounded shadow-2xl border flex items-center justify-between gap-2 transition-all animate-in slide-in-from-bottom-3 duration-100 ${
              toast.type === 'success'
                ? 'bg-[#0F141C] border-[#00C805]/40 text-[#00C805]'
                : toast.type === 'error'
                ? 'bg-[#0F141C] border-[#FF3B30]/40 text-[#FF3B30]'
                : 'bg-[#0F141C] border-blue-500/40 text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-[#00C805] shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />}
              {toast.type === 'info' && <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              <span className="text-[11px] font-mono font-medium text-white">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8E9299] hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
