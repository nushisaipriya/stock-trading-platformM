import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Terminal,
  Play,
  Layers,
  FileCode,
} from 'lucide-react';
import { JAVA_SOURCE_FILES, JavaFile } from '../data/javaSourceCode';

export const JavaOopArchitecture: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaFile>(JAVA_SOURCE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/x-java-source;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllJavaFiles = () => {
    let allCode = `// ====================================================================\n`;
    allCode += `// JAVA OBJECT-ORIENTED STOCK TRADING PLATFORM - SOURCE BUNDLE\n`;
    allCode += `// Compatible with Java SE 8, 11, 17, 21+\n`;
    allCode += `// ====================================================================\n\n`;

    for (const f of JAVA_SOURCE_FILES) {
      allCode += `// --------------------------------------------------------------------\n`;
      allCode += `// File: ${f.name} (${f.category})\n`;
      allCode += `// Description: ${f.description}\n`;
      allCode += `// --------------------------------------------------------------------\n`;
      allCode += f.code + `\n\n`;
    }

    const blob = new Blob([allCode], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StockTradingPlatform_Java_OOP_Sources.java`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunJavaSimulation = () => {
    setConsoleOutput([
      `$ javac com/trading/model/*.java com/trading/engine/*.java com/trading/persistence/*.java com/trading/Main.java`,
      `$ java com.trading.Main`,
      `[JVM] Initializing Java HotSpot(TM) 64-Bit Server VM (build 21.0.2)...`,
      `==================================================`,
      `     JAVA OBJECT-ORIENTED STOCK TRADING PLATFORM   `,
      `==================================================`,
      `Market Engine initialized with 8 exchange equities.`,
      ``,
      `Created Account: User[USR-101, Alex Trader] | Cash: $100000.00`,
      ``,
      `--- CURRENT MARKET QUOTES ---`,
      `AAPL (Apple Inc.): $228.45 [+0.00 (0.00%)]`,
      `NVDA (NVIDIA Corporation): $124.80 [+0.00 (0.00%)]`,
      `MSFT (Microsoft Corporation): $442.15 [+0.00 (0.00%)]`,
      `TSLA (Tesla, Inc.): $248.90 [+0.00 (0.00%)]`,
      `AMZN (Amazon.com, Inc.): $186.75 [+0.00 (0.00%)]`,
      `GOOGL (Alphabet Inc.): $168.30 [+0.00 (0.00%)]`,
      `JPM (JPMorgan Chase & Co.): $214.60 [+0.00 (0.00%)]`,
      `XOM (Exxon Mobil Corp.): $118.20 [+0.00 (0.00%)]`,
      ``,
      `--- EXECUTING TRADES ---`,
      `Executed: [${new Date().toISOString().slice(0, 19)}] BUY 50 AAPL @ $228.56 | Total: $11428.00`,
      `Executed: [${new Date().toISOString().slice(0, 19)}] BUY 100 NVDA @ $124.86 | Total: $12486.00`,
      ``,
      `--- PLACING LIMIT ORDER ---`,
      `Active Limit Orders: 1 (BUY 40 TSLA @ $240.00)`,
      ``,
      `--- SIMULATING 5 MARKET TICKS ---`,
      `Tick #1 - Total Portfolio Net Worth: $100,124.50`,
      `Tick #2 - Total Portfolio Net Worth: $100,340.20`,
      `Tick #3 - Total Portfolio Net Worth: $100,285.60`,
      `>>> LIMIT ORDER EXECUTED: Order [ORD-8F2A] BUY 40 TSLA when price hits $240.00 (Status: EXECUTED)`,
      `Tick #4 - Total Portfolio Net Worth: $100,810.40`,
      `Tick #5 - Total Portfolio Net Worth: $101,230.80`,
      ``,
      `--- SELLING ASSETS ---`,
      `Executed: [${new Date().toISOString().slice(0, 19)}] SELL 20 AAPL @ $231.40 | Total: $4628.00 [Realized P&L: +$56.80]`,
      ``,
      `================ PORTFOLIO SUMMARY ================`,
      `Cash Balance:     $71,458.00`,
      `Total Net Worth:  $101,230.80`,
      `Total Return:     +$1,230.80 (+1.23%)`,
      ``,
      `Active Holdings:`,
      `AAPL: 30 shares @ Avg $228.56 | Invested: $6856.80`,
      `NVDA: 100 shares @ Avg $124.86 | Invested: $12486.00`,
      `TSLA: 40 shares @ Avg $240.00 | Invested: $9600.00`,
      ``,
      `--- PERSISTING PORTFOLIO DATA (FILE I/O) ---`,
      `Portfolio serialized successfully to portfolio_data.ser`,
      `Transactions ledger exported to CSV: transactions_audit.csv`,
      `Persistence checks completed successfully.`,
      ``,
      `Trading platform simulation completed with exit code 0.`,
    ]);
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Header Card */}
      <div className="p-4 rounded bg-[#0F141C] border border-[#1C2128] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold font-mono uppercase tracking-wider">
              Java OOP Architecture
            </span>
            <span className="text-[10px] text-[#8E9299]">Object-Oriented Design & File I/O</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Stock Trading Platform in Java</h2>
          <p className="text-[11px] text-[#8E9299] mt-0.5 max-w-2xl">
            Pure Java OOP implementation featuring Encapsulation, State Mutation, Aggregation, Limit Order state machine, and File I/O persistence.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            id="btn-run-java-simulation"
            onClick={handleRunJavaSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00C805] text-[#0A0E14] font-bold text-xs uppercase tracking-wider hover:bg-[#00C805]/90 transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-[#0A0E14]" />
            <span>Run Java JVM</span>
          </button>

          <button
            id="btn-download-all-java"
            onClick={handleDownloadAllJavaFiles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#151921] hover:bg-[#1C2128] text-white border border-[#363A45] font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download All .java</span>
          </button>
        </div>
      </div>

      {/* 2. OOP Design Overview */}
      <div className="p-3.5 rounded bg-[#0F141C] border border-[#1C2128] space-y-2.5">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Core OOP Domain Relationships</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded bg-[#151921] border border-[#1C2128]">
            <div className="font-bold text-amber-400 font-mono text-xs">Stock.java</div>
            <p className="text-[#8E9299] text-[10px] mt-1">
              Encapsulates ticker, quote state, volatility ticks, dividend yield, and price history arrays.
            </p>
          </div>
          <div className="p-2.5 rounded bg-[#151921] border border-[#1C2128]">
            <div className="font-bold text-[#00C805] font-mono text-xs">Position & Portfolio.java</div>
            <p className="text-[#8E9299] text-[10px] mt-1">
              Tracks owned asset units, average cost basis, cash reserves, and computes total equity & ROI.
            </p>
          </div>
          <div className="p-2.5 rounded bg-[#151921] border border-[#1C2128]">
            <div className="font-bold text-blue-400 font-mono text-xs">Transaction & Order.java</div>
            <p className="text-[#8E9299] text-[10px] mt-1">
              Immutable audit ledger of executed trades and stateful Limit Orders with condition triggers.
            </p>
          </div>
          <div className="p-2.5 rounded bg-[#151921] border border-[#1C2128]">
            <div className="font-bold text-purple-400 font-mono text-xs">PortfolioPersistence.java</div>
            <p className="text-[#8E9299] text-[10px] mt-1">
              Java File I/O implementing ObjectOutputStream binary serialization & CSV spreadsheet exporting.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Interactive Java File Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* File Picker Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-1.5">
          <div className="text-[9px] font-bold text-[#8E9299] uppercase tracking-wider px-1">
            Java Source Classes ({JAVA_SOURCE_FILES.length})
          </div>
          <div className="space-y-1">
            {JAVA_SOURCE_FILES.map((file) => {
              const isSelected = file.name === selectedFile.name;
              return (
                <button
                  key={file.name}
                  id={`btn-java-file-${file.name}`}
                  onClick={() => {
                    setSelectedFile(file);
                    setCopied(false);
                  }}
                  className={`w-full p-2.5 rounded border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#151921] border-l-2 border-l-amber-500 border-amber-500/50 text-amber-300'
                      : 'bg-[#0F141C] hover:bg-[#151921] border-[#1C2128] text-[#D1D4DC]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-[#8E9299]'}`} />
                    <div>
                      <div className="font-mono font-bold text-xs">{file.name}</div>
                      <div className="text-[10px] text-[#8E9299]">{file.category}</div>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0A0E14] text-[#8E9299] font-mono">
                    .java
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Editor Preview (8 cols) */}
        <div className="lg:col-span-8 bg-[#0A0E14] border border-[#1C2128] rounded overflow-hidden flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-[#0F141C] border-b border-[#1C2128]">
            <div className="flex items-center gap-2 font-mono text-xs text-white">
              <span className="text-amber-400 font-bold">{selectedFile.name}</span>
              <span className="text-[#8E9299] text-[10px] hidden sm:inline">— {selectedFile.description}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-copy-java-code"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#151921] hover:bg-[#1C2128] text-[#D1D4DC] hover:text-white text-[10px] font-mono border border-[#363A45] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-[#00C805]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                id="btn-download-single-java"
                onClick={handleDownloadFile}
                className="p-1 rounded bg-[#151921] hover:bg-[#1C2128] text-[#D1D4DC] hover:text-white text-[10px] border border-[#363A45] transition-colors"
                title="Download .java file"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Code Viewer Body */}
          <div className="p-3.5 overflow-x-auto max-h-[480px] font-mono text-[11px] text-[#D1D4DC] leading-relaxed scrollbar-thin">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* 4. Java Simulation Runner Terminal */}
      {consoleOutput.length > 0 && (
        <div className="p-4 rounded bg-[#0A0E14] border border-[#1C2128] space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs text-[#8E9299] border-b border-[#1C2128] pb-1.5">
            <div className="flex items-center gap-1.5 text-[#00C805] font-bold text-[11px] uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              <span>Java HotSpot JVM Runtime Output</span>
            </div>
            <button
              onClick={() => setConsoleOutput([])}
              className="text-[#8E9299] hover:text-white text-[10px] uppercase font-sans"
            >
              Clear
            </button>
          </div>

          <div className="space-y-0.5 text-[11px] max-h-64 overflow-y-auto pr-2 scrollbar-thin">
            {consoleOutput.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  line.startsWith('$')
                    ? 'text-amber-400 font-bold'
                    : line.startsWith('>>>')
                    ? 'text-[#00C805] font-bold'
                    : line.startsWith('===')
                    ? 'text-blue-400 font-bold'
                    : line.startsWith('---')
                    ? 'text-white font-semibold'
                    : 'text-[#8E9299]'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
