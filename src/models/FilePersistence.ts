import { UserAccountData } from '../types/stock';
import { UserAccount } from './UserAccount';

/**
 * File I/O & Persistence Service
 * Supports JSON import/export, CSV ledger downloads, LocalStorage sync, and Java serialization schema export.
 */
export class FilePersistence {
  private static STORAGE_KEY = 'stock_trading_platform_user_v1';

  /**
   * Saves UserAccount to browser LocalStorage
   */
  public static saveToLocalStorage(user: UserAccount): boolean {
    try {
      const json = JSON.stringify(user.toJSON());
      localStorage.setItem(this.STORAGE_KEY, json);
      return true;
    } catch (err) {
      console.error('Failed to save to local storage', err);
      return false;
    }
  }

  /**
   * Loads UserAccount from browser LocalStorage
   */
  public static loadFromLocalStorage(): UserAccount | null {
    try {
      const dataStr = localStorage.getItem(this.STORAGE_KEY);
      if (!dataStr) return null;
      const data: UserAccountData = JSON.parse(dataStr);
      return UserAccount.fromData(data);
    } catch (err) {
      console.error('Failed to load from local storage', err);
      return null;
    }
  }

  /**
   * Clears saved LocalStorage state
   */
  public static clearLocalStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Exports UserAccount as a downloadable JSON file
   */
  public static exportToJSONFile(user: UserAccount): void {
    const data = user.toJSON();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${user.username.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Reads and parses an uploaded JSON file into a UserAccount
   */
  public static async importFromJSONFile(file: File): Promise<UserAccount> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content) as UserAccountData;
          if (!parsed || typeof parsed.cashBalance !== 'number') {
            throw new Error('Invalid portfolio file schema');
          }
          const user = UserAccount.fromData(parsed);
          resolve(user);
        } catch (error) {
          reject(new Error('Failed to parse portfolio file. Ensure valid JSON format.'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  /**
   * Exports transaction history to CSV format for financial spreadsheet analysis (Excel/Sheets)
   */
  public static exportTransactionsToCSV(user: UserAccount): void {
    const txs = user.portfolio.transactions;
    if (txs.length === 0) {
      alert('No transactions recorded to export.');
      return;
    }

    const headers = ['Transaction ID', 'Timestamp', 'Date', 'Symbol', 'Stock Name', 'Type', 'Execution', 'Shares', 'Price ($)', 'Total Amount ($)', 'Fees ($)', 'Realized P&L ($)'];
    const rows = txs.map((tx) => [
      tx.id,
      tx.timestamp,
      `"${tx.formattedDate}"`,
      tx.symbol,
      `"${tx.stockName}"`,
      tx.type,
      tx.executionType,
      tx.shares,
      tx.price.toFixed(2),
      tx.totalAmount.toFixed(2),
      tx.fees.toFixed(2),
      tx.realizedPnL !== undefined ? tx.realizedPnL.toFixed(2) : 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_${user.username.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates a Java-compliant Data File representation (demonstrating Java File I/O formatting)
   */
  public static exportToJavaDataFile(user: UserAccount): void {
    const lines: string[] = [
      '# === JAVA STOCK TRADING PLATFORM PORTFOLIO DATA FILE ===',
      `# Generated: ${new Date().toISOString()}`,
      `USER_ID=${user.id}`,
      `USERNAME=${user.username}`,
      `INITIAL_DEPOSIT=${user.portfolio.initialDeposit}`,
      `CASH_BALANCE=${user.portfolio.cashBalance}`,
      `CREATED_AT=${user.createdAt}`,
      '',
      '# === HOLDINGS [SYMBOL:SHARES:TOTAL_INVESTED] ===',
    ];

    for (const [sym, pos] of user.portfolio.positions.entries()) {
      lines.push(`POS=${sym}:${pos.shares}:${pos.totalInvested}`);
    }

    lines.push('', '# === TRANSACTIONS [ID:TIME:SYM:TYPE:SHARES:PRICE:TOTAL] ===');
    for (const tx of user.portfolio.transactions) {
      lines.push(`TX=${tx.id}:${tx.timestamp}:${tx.symbol}:${tx.type}:${tx.shares}:${tx.price}:${tx.totalAmount}`);
    }

    const textContent = lines.join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${user.username.replace(/\s+/g, '_')}.dat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
