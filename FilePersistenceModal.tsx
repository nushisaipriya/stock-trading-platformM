import React, { useState, useRef } from 'react';
import {
  X,
  HardDrive,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserAccount } from '../models/UserAccount';
import { FilePersistence } from '../models/FilePersistence';

interface FilePersistenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUserLoaded: (newUser: UserAccount) => void;
  onResetAccount: (startingCapital: number) => void;
}

export const FilePersistenceModal: React.FC<FilePersistenceModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserLoaded,
  onResetAccount,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [selectedCapital, setSelectedCapital] = useState<number>(100000);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const loadedUser = await FilePersistence.importFromJSONFile(file);
      onUserLoaded(loadedUser);
      setImportStatus({ success: true, message: `Successfully imported portfolio for "${loadedUser.username}"!` });
    } catch (err: any) {
      setImportStatus({ success: false, message: err.message || 'Failed to import portfolio file.' });
    }
  };

  const handleResetConfirm = () => {
    if (window.confirm(`Are you sure you want to reset your account with $${selectedCapital.toLocaleString()} initial capital?`)) {
      onResetAccount(selectedCapital);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0A0E14]/85 backdrop-blur-xs">
      <div className="bg-[#0F141C] border border-[#1C2128] rounded max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C2128]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#151921] border border-[#1C2128] flex items-center justify-center text-blue-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">File I/O & Portfolio Persistence</h3>
              <p className="text-[10px] text-[#8E9299]">Save, restore, and export trading environment data</p>
            </div>
          </div>
          <button
            id="btn-close-persistence-modal"
            onClick={onClose}
            className="p-1 rounded text-[#8E9299] hover:text-white hover:bg-[#151921] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Status Message */}
          {importStatus && (
            <div
              className={`p-2.5 rounded text-xs flex items-center gap-2 border ${
                importStatus.success
                  ? 'bg-[#00C805]/10 border-[#00C805]/30 text-[#00C805]'
                  : 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Section 1: Export Data to File */}
          <div className="space-y-2">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#8E9299]">Export Portfolio Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              
              {/* JSON Backup */}
              <button
                id="btn-export-json-file"
                onClick={() => FilePersistence.exportToJSONFile(user)}
                className="p-2.5 rounded bg-[#0A0E14] hover:bg-[#151921] border border-[#1C2128] text-left transition-colors group"
              >
                <Download className="w-3.5 h-3.5 text-[#00C805] mb-1.5" />
                <div className="font-bold text-white text-xs">JSON Backup</div>
                <div className="text-[10px] text-[#8E9299] mt-0.5">Full state & history</div>
              </button>

              {/* CSV Spreadsheet */}
              <button
                id="btn-export-csv-file"
                onClick={() => FilePersistence.exportTransactionsToCSV(user)}
                className="p-2.5 rounded bg-[#0A0E14] hover:bg-[#151921] border border-[#1C2128] text-left transition-colors group"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400 mb-1.5" />
                <div className="font-bold text-white text-xs">CSV Ledger</div>
                <div className="text-[10px] text-[#8E9299] mt-0.5">Excel / Sheets trades</div>
              </button>

              {/* Java Data File */}
              <button
                id="btn-export-java-dat"
                onClick={() => FilePersistence.exportToJavaDataFile(user)}
                className="p-2.5 rounded bg-[#0A0E14] hover:bg-[#151921] border border-[#1C2128] text-left transition-colors group"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400 mb-1.5" />
                <div className="font-bold text-white text-xs">Java Data (.dat)</div>
                <div className="text-[10px] text-[#8E9299] mt-0.5">Java I/O file schema</div>
              </button>
            </div>
          </div>

          {/* Section 2: Import / Load Portfolio */}
          <div className="space-y-2">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#8E9299]">Import Portfolio File</h4>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded bg-[#0A0E14] border border-dashed border-[#363A45] hover:border-blue-500 cursor-pointer text-center space-y-1.5 transition-colors group"
            >
              <Upload className="w-6 h-6 text-[#8E9299] group-hover:text-blue-400 mx-auto transition-colors" />
              <div className="text-xs font-bold text-white">Click or Drop .JSON Backup File</div>
              <div className="text-[10px] text-[#8E9299]">Restore cash balance, positions, and trades</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Section 3: Reset / Preset Accounts */}
          <div className="space-y-2 pt-2 border-t border-[#1C2128]">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#8E9299]">Reset Account & Starting Capital</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {[10000, 50000, 100000, 250000].map((cap) => (
                <button
                  key={cap}
                  id={`btn-preset-capital-${cap}`}
                  onClick={() => setSelectedCapital(cap)}
                  className={`py-1.5 rounded text-[11px] font-mono font-bold transition-all border ${
                    selectedCapital === cap
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-[#0A0E14] text-[#8E9299] border-[#1C2128] hover:text-white'
                  }`}
                >
                  ${(cap / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <button
              id="btn-confirm-account-reset"
              onClick={handleResetConfirm}
              className="w-full py-2 rounded bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Portfolio (${(selectedCapital / 1000).toFixed(0)}k Capital)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
