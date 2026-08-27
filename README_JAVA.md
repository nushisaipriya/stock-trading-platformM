# Java Object-Oriented Stock Trading Platform

A complete Object-Oriented Programming (OOP) stock trading system implemented in Java, featuring live pricing mechanics, order execution, position cost-basis tracking, realized/unrealized profit & loss calculation, and file persistence.

---

## 🏛️ OOP Architecture & Class Breakdown

### 1. `com.trading.model.Stock`
- **Encapsulation**: Private fields (`symbol`, `name`, `currentPrice`, `previousClose`, `dayHigh`, `dayLow`, `volume`, `volatility`, `priceHistory`) with public accessors and synchronized mutators.
- **Methods**: `tick(marketMultiplier)` for geometric Brownian random-walk price simulation, `getBidPrice()`, `getAskPrice()`, `getChange()`, `getChangePercent()`.

### 2. `com.trading.model.Position`
- **Asset Holding Tracker**: Tracks total shares owned and weighted total cost basis.
- **Methods**:
  - `getAverageBuyPrice()`: Cost basis per share.
  - `addShares(count, price)`: Accumulates share count and increments invested capital.
  - `removeShares(count)`: Deducts shares using weighted-average cost basis and returns cost basis removed.
  - `calculateMarketValue(currentPrice)`: Current equity value.
  - `calculateUnrealizedPnL(currentPrice)`: Unrealized gain/loss ($).
  - `calculateUnrealizedPnLPercent(currentPrice)`: Unrealized gain/loss (%).

### 3. `com.trading.model.Transaction`
- **Immutable Audit Record**: Holds unique ID (`TX-XXXXXXXX`), timestamp, symbol, type (`BUY`, `SELL`, `DIVIDEND`), execution type (`MARKET`, `LIMIT`), price, shares, total dollar amount, and realized P&L.

### 4. `com.trading.model.Order`
- **Limit Order State Machine**: States include `PENDING`, `EXECUTED`, `CANCELLED`.
- **Condition Matching**: `shouldExecute(currentPrice)` compares current bid/ask with user target price.

### 5. `com.trading.model.Portfolio`
- **Aggregate Root**: Manages cash balance, active positions map (`Map<String, Position>`), transaction history, and equity performance snapshots.
- **Methods**:
  - `buyStock(stock, shares, execType, customPrice)`: Validates cash balance, deducts funds, updates position, appends transaction.
  - `sellStock(stock, shares, execType, customPrice)`: Validates share balance, computes realized profit/loss, adds proceeds, updates position, appends transaction.
  - `calculateTotalValue(marketStocks)`: Total Net Worth ($ cash + market value of stocks).
  - `calculateTotalProfitLoss(marketStocks)`: Total P&L ($).
  - `calculateTotalReturnPercent(marketStocks)`: Total Return (%).

### 6. `com.trading.model.User`
- **User Aggregate**: Encapsulates user ID, username, `Portfolio` reference, and list of `Order` limit orders.
- **Methods**: `placeLimitOrder()`, `checkAndExecuteLimitOrders(market)`.

### 7. `com.trading.engine.MarketSimulator`
- **Engine**: Concurrent registry of exchange-listed stocks with scheduled multi-threaded tick updates.

### 8. `com.trading.persistence.PortfolioPersistence`
- **File I/O**:
  - `saveUserToFile(user, path)`: Binary Object Serialization (`.ser`).
  - `loadUserFromFile(path)`: Binary Object Deserialization.
  - `exportTransactionsToCSV(portfolio, csvPath)`: Structured CSV transaction ledger export.

### 9. `com.trading.Main`
- **Driver**: Complete runnable console simulation demonstrating the end-to-end trading lifecycle.

---

## 🚀 How to Compile and Run in Java

### Using standard `javac` & `java`:
```bash
# Navigate to Java source root
cd src/main/java

# Compile all packages
javac com/trading/model/*.java com/trading/engine/*.java com/trading/persistence/*.java com/trading/*.java

# Run main simulation driver
java com.trading.Main
```
