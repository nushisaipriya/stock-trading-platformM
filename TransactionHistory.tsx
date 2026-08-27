import React, { useState, useMemo } from 'react';
import {
  History,
  Download,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { UserAccount } from '../models/UserAccount';
import { OrderType } from '../types/stock';
import { FilePersistence } from '../models/FilePersistence';

interface TransactionHistoryProps {
  user: UserAccount;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ user }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | OrderType>('ALL');

  const transactions = user.portfolio.transactions;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.symbol.toLowerCase().includes(search.toLowerCase()) ||
        tx.stockName.toLowerCase().includes(search.toLowerCase()) ||
        tx.id.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  // Aggregate stats
  const totalVolumeTraded = transactions.reduce((acc, tx) => acc + tx.totalAmount, 0);
  const buyCount = transactions.filter((tx) => tx.type === 'BUY').length;
  const sellCount = transactions.filter((tx) => tx.type === 'SELL').length;
  const totalRealizedPnL = transactions.reduce((acc, tx) => acc + (tx.realizedPnL || 0), 0);

  return (
    <div className="space-y-4">
      
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Executed Trades</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{transactions.length}</div>
          <div className="text-[10px] text-[#8E9299] mt-1 font-mono">{buyCount} Buys • {sellCount} Sells</div>
        </div>

        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Gross Volume</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${totalVolumeTraded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#8E9299] mt-1 font-mono">Turnover volume</div>
        </div>

        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128]">
          <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Realized Net P/L</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${totalRealizedPnL >= 0 ? 'text-[#00C805]' : 'text-[#FF3B30]'}`}>
            {totalRealizedPnL >= 0 ? '+' : ''}${totalRealizedPnL.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#8E9299] mt-1 font-mono">Closed positions</div>
        </div>

        <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128] flex items-center justify-between">
          <div>
            <div className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Spreadsheet Export</div>
            <div className="text-xs font-bold text-white mt-1">CSV Audit Ledger</div>
          </div>
          <button
            id="btn-export-csv-history"
            onClick={() => FilePersistence.exportTransactionsToCSV(user)}
            className="px-2.5 py-1.5 rounded bg-[#00C805]/10 hover:bg-[#00C805]/20 text-[#00C805] border border-[#00C805]/30 text-xs font-bold transition-colors flex items-center gap-1"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="p-3 rounded bg-[#0F141C] border border-[#1C2128] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E9299]" />
          <input
            id="input-history-search"
            type="text"
            placeholder="Search by Symbol, Company name, or TX ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#151921] border border-[#363A45] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8E9299] focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-[#151921] p-0.5 rounded border border-[#1C2128] text-[10px]">
            {(['ALL', 'BUY', 'SELL'] as const).map((t) => (
              <button
                key={t}
                id={`btn-filter-tx-${t}`}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                  typeFilter === t ? 'bg-blue-600 text-white' : 'text-[#8E9299] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            id="btn-export-json-tx"
            onClick={() => FilePersistence.exportToJSONFile(user)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#151921] hover:bg-[#1C2128] text-[#D1D4DC] hover:text-white text-[10px] font-bold uppercase border border-[#363A45] shrink-0"
          >
            <Download className="w-3 h-3 text-blue-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* 3. Transaction Table */}
      <div className="bg-[#0A0E14] border border-[#1C2128] rounded overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-[#8E9299] space-y-2">
            <History className="w-6 h-6 mx-auto text-[#8E9299]" />
            <p className="text-xs">No transaction records found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-[#0F141C] text-[#8E9299] uppercase text-[9px] font-sans border-b border-[#1C2128]">
                <tr>
                  <th className="py-2.5 px-3">TX ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Shares</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3 text-right">Realized P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2128]">
                {filteredTransactions.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  return (
                    <tr key={tx.id} className="hover:bg-[#151921] transition-colors">
                      <td className="py-2 px-3 text-[#8E9299] font-mono text-[10px]">{tx.id}</td>
                      <td className="py-2 px-3 text-[#8E9299] font-sans text-[10px]">{tx.formattedDate}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-white">{tx.symbol}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isBuy
                              ? 'bg-[#00C805]/10 text-[#00C805] border border-[#00C805]/30'
                              : 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#8E9299] font-sans text-[10px]">{tx.executionType}</td>
                      <td className="py-2 px-3 font-bold text-white">{tx.shares}</td>
                      <td className="py-2 px-3 text-white">${tx.price.toFixed(2)}</td>
                      <td className="py-2 px-3 text-white font-bold">
                        ${tx.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        {tx.realizedPnL !== undefined ? (
                          <span className={tx.realizedPnL >= 0 ? 'text-[#00C805]' : 'text-[#FF3B30]'}>
                            {tx.realizedPnL >= 0 ? '+' : ''}${tx.realizedPnL.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[#8E9299]">—</span>
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
