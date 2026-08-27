import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { UserAccount } from '../models/UserAccount';
import { Stock } from '../models/Stock';

interface LimitOrdersViewProps {
  user: UserAccount;
  stocksMap: Map<string, Stock>;
  onOpenTradeModal: (stock: Stock, type: 'BUY' | 'SELL') => void;
  onOrderCancelled: (msg: string) => void;
}

export const LimitOrdersView: React.FC<LimitOrdersViewProps> = ({
  user,
  stocksMap,
  onOrderCancelled,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'EXECUTED' | 'CANCELLED'>('PENDING');

  const limitOrders = user.limitOrders;
  const filteredOrders = limitOrders.filter((o) => filterStatus === 'ALL' || o.status === filterStatus);

  const pendingCount = limitOrders.filter((o) => o.status === 'PENDING').length;
  const executedCount = limitOrders.filter((o) => o.status === 'EXECUTED').length;

  const handleCancel = (orderId: string) => {
    if (user.cancelLimitOrder(orderId)) {
      onOrderCancelled(`Limit Order ${orderId} has been cancelled.`);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Pending Orders</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-[#8E9299] mt-1 font-mono">Waiting for market price target</div>
        </div>

        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Triggered & Filled</div>
          <div className="text-2xl font-bold font-mono text-[#00C805] mt-1">{executedCount}</div>
          <div className="text-[10px] text-[#8E9299] mt-1 font-mono">Auto-filled by tick engine</div>
        </div>

        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128] flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Order Mechanics</div>
            <div className="text-xs text-[#D1D4DC] mt-1">
              Buy when price &le; target; Sell when price &ge; target.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex items-center justify-between bg-[#0F141C] p-2.5 rounded border border-[#1C2128]">
        <div className="flex bg-[#151921] p-0.5 rounded border border-[#1C2128] text-[10px]">
          {(['PENDING', 'EXECUTED', 'CANCELLED', 'ALL'] as const).map((st) => (
            <button
              key={st}
              id={`btn-filter-order-${st}`}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded font-bold uppercase transition-colors ${
                filterStatus === st ? 'bg-blue-600 text-white' : 'text-[#8E9299] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Orders List Table */}
      <div className="bg-[#0A0E14] border border-[#1C2128] rounded overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-[#8E9299] space-y-2">
            <Clock className="w-6 h-6 mx-auto text-[#8E9299]" />
            <p className="text-xs">No limit orders found in this status category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-[#0F141C] text-[#8E9299] uppercase text-[9px] font-sans border-b border-[#1C2128]">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Shares</th>
                  <th className="py-2.5 px-3">Target Price</th>
                  <th className="py-2.5 px-3">Market Price</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2128]">
                {filteredOrders.map((ord) => {
                  const stock = stocksMap.get(ord.symbol);
                  const curPrice = stock ? stock.price : 0;
                  const isBuy = ord.type === 'BUY';
                  const diff = curPrice > 0 ? ((curPrice - ord.targetPrice) / ord.targetPrice) * 100 : 0;

                  return (
                    <tr key={ord.id} className="hover:bg-[#151921] transition-colors">
                      <td className="py-2 px-3 text-[#8E9299] text-[10px]">{ord.id}</td>
                      <td className="py-2 px-3 text-[#8E9299] font-sans text-[10px]">{ord.createdAt}</td>
                      <td className="py-2 px-3 font-bold text-white font-sans">{ord.symbol}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isBuy
                              ? 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30'
                              : 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30'
                          }`}
                        >
                          LIMIT {ord.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-white">{ord.shares}</td>
                      <td className="py-2 px-3 text-amber-400 font-bold">${ord.targetPrice.toFixed(2)}</td>
                      <td className="py-2 px-3">
                        <div className="text-white font-bold">${curPrice.toFixed(2)}</div>
                        <div className="text-[9px] text-[#8E9299] font-sans">
                          {isBuy
                            ? diff > 0
                              ? `$${(curPrice - ord.targetPrice).toFixed(2)} away`
                              : 'In Range'
                            : diff < 0
                            ? `$${(ord.targetPrice - curPrice).toFixed(2)} away`
                            : 'In Range'}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        {ord.status === 'PENDING' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase">
                            PENDING
                          </span>
                        )}
                        {ord.status === 'EXECUTED' && (
                          <span className="px-1.5 py-0.5 rounded bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30 text-[9px] font-bold uppercase flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>FILLED</span>
                          </span>
                        )}
                        {ord.status === 'CANCELLED' && (
                          <span className="px-1.5 py-0.5 rounded bg-[#1C2128] text-[#8E9299] text-[9px] font-bold uppercase flex items-center gap-1 w-max">
                            <XCircle className="w-2.5 h-2.5" />
                            <span>CANCELLED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {ord.status === 'PENDING' && (
                          <button
                            id={`btn-cancel-order-${ord.id}`}
                            onClick={() => handleCancel(ord.id)}
                            className="p-1 rounded bg-[#FF3B30]/10 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-white transition-colors border border-[#FF3B30]/20"
                            title="Cancel Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
