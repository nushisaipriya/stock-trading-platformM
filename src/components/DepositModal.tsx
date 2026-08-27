import React, { useState } from 'react';
import { X, PlusCircle, ArrowRight } from 'lucide-react';
import { UserAccount } from '../models/UserAccount';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onDepositSuccess: (amount: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  user,
  onDepositSuccess,
}) => {
  if (!isOpen) return null;

  const [depositAmount, setDepositAmount] = useState<number>(10000);
  const [error, setError] = useState<string | null>(null);

  const presets = [5000, 10000, 25000, 50000, 100000];

  const handleDeposit = () => {
    setError(null);
    if (depositAmount <= 0 || isNaN(depositAmount)) {
      setError('Please enter a valid positive deposit amount.');
      return;
    }

    try {
      user.portfolio.depositCash(depositAmount);
      onDepositSuccess(depositAmount);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0A0E14]/85 backdrop-blur-xs">
      <div className="bg-[#0F141C] border border-[#1C2128] rounded max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C2128]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#151921] border border-[#1C2128] flex items-center justify-center text-[#00C805]">
              <PlusCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Deposit Capital</h3>
              <p className="text-[10px] text-[#8E9299]">Inject funds into cash reserve</p>
            </div>
          </div>
          <button
            id="btn-close-deposit-modal"
            onClick={onClose}
            className="p-1 rounded text-[#8E9299] hover:text-white hover:bg-[#151921] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5">
          <div className="p-2.5 rounded bg-[#0A0E14] border border-[#1C2128] flex items-center justify-between">
            <span className="text-[10px] text-[#8E9299] uppercase font-bold tracking-wider">Current Cash:</span>
            <span className="text-sm font-bold font-mono text-[#00C805]">
              ${user.portfolio.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-[#8E9299] tracking-wider">Deposit Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-[#8E9299] font-mono text-sm font-bold">$</span>
              <input
                id="input-deposit-amount"
                type="number"
                min="100"
                step="500"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#151921] border border-[#363A45] rounded pl-7 pr-3 py-1.5 text-white font-mono font-bold text-base focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-5 gap-1">
            {presets.map((amt) => (
              <button
                key={amt}
                id={`btn-deposit-preset-${amt}`}
                onClick={() => setDepositAmount(amt)}
                className="py-1 rounded bg-[#151921] hover:bg-[#1C2128] text-[#8E9299] hover:text-white text-[10px] font-mono font-bold border border-[#1C2128] transition-colors"
              >
                +${(amt / 1000).toFixed(0)}k
              </button>
            ))}
          </div>

          {error && (
            <div className="p-2 rounded bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-xs">
              {error}
            </div>
          )}

          <button
            id="btn-confirm-deposit"
            onClick={handleDeposit}
            className="w-full py-2.5 rounded bg-[#00C805] text-[#0A0E14] hover:bg-[#00C805]/90 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Deposit ${depositAmount.toLocaleString()}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
