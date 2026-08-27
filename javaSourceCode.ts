export interface JavaFile {
  name: string;
  category: 'Model' | 'Engine' | 'Persistence' | 'Main';
  description: string;
  code: string;
}

export const JAVA_SOURCE_FILES: JavaFile[] = [
  {
    name: 'Stock.java',
    category: 'Model',
    description: 'Encapsulates stock symbol, name, sector, price history, volatility, and tick simulation.',
    code: `package com.trading.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Stock entity representing an exchange-traded asset.
 * Demonstrates encapsulation, immutability of identifiers, and state mutation through tick().
 */
public class Stock implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String symbol;
    private final String name;
    private final String sector;
    private double currentPrice;
    private double previousClose;
    private double dayHigh;
    private double dayLow;
    private long volume;
    private final double volatility;
    private final double dividendYield;
    private final List<Double> priceHistory;

    public Stock(String symbol, String name, String sector, double initialPrice, double volatility, double dividendYield) {
        if (symbol == null || symbol.trim().isEmpty()) {
            throw new IllegalArgumentException("Stock symbol cannot be empty");
        }
        if (initialPrice <= 0) {
            throw new IllegalArgumentException("Initial price must be strictly positive");
        }
        this.symbol = symbol.toUpperCase();
        this.name = name;
        this.sector = sector;
        this.currentPrice = initialPrice;
        this.previousClose = initialPrice;
        this.dayHigh = initialPrice;
        this.dayLow = initialPrice;
        this.volume = 100_000;
        this.volatility = volatility;
        this.dividendYield = dividendYield;
        this.priceHistory = new ArrayList<>();
        this.priceHistory.add(initialPrice);
    }

    public String getSymbol() { return symbol; }
    public String getName() { return name; }
    public String getSector() { return sector; }
    public synchronized double getCurrentPrice() { return currentPrice; }
    public double getPreviousClose() { return previousClose; }
    public double getDayHigh() { return dayHigh; }
    public double getDayLow() { return dayLow; }
    public long getVolume() { return volume; }
    public double getVolatility() { return volatility; }
    public double getDividendYield() { return dividendYield; }
    public synchronized List<Double> getPriceHistory() { return Collections.unmodifiableList(priceHistory); }

    public double getChange() {
        return Math.round((currentPrice - previousClose) * 100.0) / 100.0;
    }

    public double getChangePercent() {
        if (previousClose == 0) return 0.0;
        return Math.round(((currentPrice - previousClose) / previousClose) * 10000.0) / 100.0;
    }

    public double getBidPrice() {
        return Math.round(currentPrice * 0.9995 * 100.0) / 100.0;
    }

    public double getAskPrice() {
        return Math.round(currentPrice * 1.0005 * 100.0) / 100.0;
    }

    /**
     * Simulates market price movement with random walk & volatility
     */
    public synchronized void tick(double marketMultiplier) {
        double deltaPercent = (Math.random() - 0.49) * 2 * this.volatility * marketMultiplier;
        double newPrice = Math.max(0.5, this.currentPrice * (1.0 + deltaPercent));
        newPrice = Math.round(newPrice * 100.0) / 100.0;

        this.currentPrice = newPrice;
        this.dayHigh = Math.max(this.dayHigh, newPrice);
        this.dayLow = Math.min(this.dayLow, newPrice);
        this.volume += (long) (1000 + Math.random() * 5000);
        this.priceHistory.add(newPrice);

        if (this.priceHistory.size() > 100) {
            this.priceHistory.remove(0);
        }
    }

    @Override
    public String toString() {
        return String.format("%s (%s): $%.2f [%+.2f (%.2f%%)]", symbol, name, currentPrice, getChange(), getChangePercent());
    }
}`,
  },
  {
    name: 'Position.java',
    category: 'Model',
    description: 'Tracks owned shares of a specific stock, cost basis, and calculates unrealized profit/loss.',
    code: `package com.trading.model;

import java.io.Serializable;

/**
 * Encapsulates an active asset position within a portfolio.
 * Computes average cost basis and real-time unrealized capital gains.
 */
public class Position implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String symbol;
    private int shares;
    private double totalInvested;

    public Position(String symbol, int shares, double totalInvested) {
        if (shares < 0 || totalInvested < 0) {
            throw new IllegalArgumentException("Shares and total invested must be non-negative");
        }
        this.symbol = symbol.toUpperCase();
        this.shares = shares;
        this.totalInvested = totalInvested;
    }

    public String getSymbol() { return symbol; }
    public int getShares() { return shares; }
    public double getTotalInvested() { return totalInvested; }

    public double getAverageBuyPrice() {
        if (shares == 0) return 0.0;
        return Math.round((totalInvested / shares) * 100.0) / 100.0;
    }

    public void addShares(int count, double pricePerShare) {
        if (count <= 0) throw new IllegalArgumentException("Share count must be positive");
        this.shares += count;
        this.totalInvested += (count * pricePerShare);
    }

    public double removeShares(int count) {
        if (count <= 0) throw new IllegalArgumentException("Share count must be positive");
        if (count > this.shares) throw new IllegalArgumentException("Cannot sell more shares than currently owned");

        double costBasisRemoved = getAverageBuyPrice() * count;
        this.shares -= count;
        this.totalInvested = Math.max(0.0, this.totalInvested - costBasisRemoved);
        return costBasisRemoved;
    }

    public double calculateMarketValue(double currentPrice) {
        return Math.round(shares * currentPrice * 100.0) / 100.0;
    }

    public double calculateUnrealizedPnL(double currentPrice) {
        return Math.round((calculateMarketValue(currentPrice) - totalInvested) * 100.0) / 100.0;
    }

    public double calculateUnrealizedPnLPercent(double currentPrice) {
        if (totalInvested == 0) return 0.0;
        return Math.round((calculateUnrealizedPnL(currentPrice) / totalInvested) * 10000.0) / 100.0;
    }

    @Override
    public String toString() {
        return String.format("%s: %d shares @ Avg $%.2f | Invested: $%.2f",
                symbol, shares, getAverageBuyPrice(), totalInvested);
    }
}`,
  },
  {
    name: 'Transaction.java',
    category: 'Model',
    description: 'Immutable record of an executed buy or sell operation with timestamps and fees.',
    code: `package com.trading.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Immutable Transaction audit record.
 */
public class Transaction implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Type { BUY, SELL, DIVIDEND }
    public enum ExecutionType { MARKET, LIMIT }

    private final String id;
    private final LocalDateTime timestamp;
    private final String symbol;
    private final String stockName;
    private final Type type;
    private final ExecutionType executionType;
    private final int shares;
    private final double price;
    private final double totalAmount;
    private final double fees;
    private final Double realizedPnL;

    public Transaction(String symbol, String stockName, Type type, ExecutionType executionType,
                       int shares, double price, double fees, Double realizedPnL) {
        this.id = "TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.timestamp = LocalDateTime.now();
        this.symbol = symbol.toUpperCase();
        this.stockName = stockName;
        this.type = type;
        this.executionType = executionType;
        this.shares = shares;
        this.price = price;
        this.fees = fees;
        this.totalAmount = (shares * price) + (type == Type.BUY ? fees : -fees);
        this.realizedPnL = realizedPnL;
    }

    public String getId() { return id; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getFormattedDate() {
        return timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
    public String getSymbol() { return symbol; }
    public String getStockName() { return stockName; }
    public Type getType() { return type; }
    public ExecutionType getExecutionType() { return executionType; }
    public int getShares() { return shares; }
    public double getPrice() { return price; }
    public double getTotalAmount() { return totalAmount; }
    public double getFees() { return fees; }
    public Double getRealizedPnL() { return realizedPnL; }

    @Override
    public String toString() {
        String pnlStr = (realizedPnL != null) ? String.format(" [Realized P&L: %+.2f]", realizedPnL) : "";
        return String.format("[%s] %s %d %s @ $%.2f | Total: $%.2f%s",
                getFormattedDate(), type, shares, symbol, price, totalAmount, pnlStr);
    }
}`,
  },
  {
    name: 'Order.java',
    category: 'Model',
    description: 'Encapsulates Limit Order lifecycle (PENDING, EXECUTED, CANCELLED).',
    code: `package com.trading.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a Limit Order awaiting a price trigger.
 */
public class Order implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Status { PENDING, EXECUTED, CANCELLED }

    private final String id;
    private final LocalDateTime createdAt;
    private final String symbol;
    private final Transaction.Type type;
    private final double targetPrice;
    private final int shares;
    private Status status;

    public Order(String symbol, Transaction.Type type, double targetPrice, int shares) {
        this.id = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.createdAt = LocalDateTime.now();
        this.symbol = symbol.toUpperCase();
        this.type = type;
        this.targetPrice = targetPrice;
        this.shares = shares;
        this.status = Status.PENDING;
    }

    public String getId() { return id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getSymbol() { return symbol; }
    public Transaction.Type getType() { return type; }
    public double getTargetPrice() { return targetPrice; }
    public int getShares() { return shares; }
    public Status getStatus() { return status; }

    public void cancel() {
        if (this.status == Status.PENDING) {
            this.status = Status.CANCELLED;
        }
    }

    public void execute() {
        if (this.status == Status.PENDING) {
            this.status = Status.EXECUTED;
        }
    }

    public boolean shouldExecute(double currentPrice) {
        if (this.status != Status.PENDING) return false;
        if (this.type == Transaction.Type.BUY) {
            return currentPrice <= this.targetPrice;
        } else {
            return currentPrice >= this.targetPrice;
        }
    }

    @Override
    public String toString() {
        return String.format("Order [%s] %s %d %s when price hits $%.2f (Status: %s)",
                id, type, shares, symbol, targetPrice, status);
    }
}`,
  },
  {
    name: 'Portfolio.java',
    category: 'Model',
    description: 'Manages user positions, cash balance, order execution, and portfolio performance history.',
    code: `package com.trading.model;

import java.io.Serializable;
import java.util.*;

/**
 * Core Portfolio aggregate managing cash, position mappings, and performance metrics.
 */
public class Portfolio implements Serializable {
    private static final long serialVersionUID = 1L;

    private final double initialDeposit;
    private double cashBalance;
    private final Map<String, Position> positions;
    private final List<Transaction> transactions;
    private final List<Double> equityHistory;

    public Portfolio(double initialDeposit) {
        if (initialDeposit <= 0) {
            throw new IllegalArgumentException("Initial deposit must be positive");
        }
        this.initialDeposit = initialDeposit;
        this.cashBalance = initialDeposit;
        this.positions = new HashMap<>();
        this.transactions = new ArrayList<>();
        this.equityHistory = new ArrayList<>();
        this.equityHistory.add(initialDeposit);
    }

    public double getInitialDeposit() { return initialDeposit; }
    public double getCashBalance() { return Math.round(cashBalance * 100.0) / 100.0; }
    public Map<String, Position> getPositions() { return Collections.unmodifiableMap(positions); }
    public List<Transaction> getTransactions() { return Collections.unmodifiableList(transactions); }
    public List<Double> getEquityHistory() { return Collections.unmodifiableList(equityHistory); }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit must be positive");
        this.cashBalance += amount;
    }

    public boolean withdraw(double amount) {
        if (amount <= 0 || amount > this.cashBalance) return false;
        this.cashBalance -= amount;
        return true;
    }

    /**
     * Executes a BUY operation for the given stock
     */
    public synchronized Transaction buyStock(Stock stock, int shares, Transaction.ExecutionType execType, Double customPrice) {
        if (shares <= 0) throw new IllegalArgumentException("Shares must be positive");
        double executionPrice = (customPrice != null) ? customPrice : stock.getAskPrice();
        double totalCost = Math.round(shares * executionPrice * 100.0) / 100.0;

        if (totalCost > this.cashBalance) {
            throw new IllegalStateException(String.format("Insufficient funds. Needed: $%.2f, Available: $%.2f", totalCost, this.cashBalance));
        }

        this.cashBalance -= totalCost;
        Position pos = positions.computeIfAbsent(stock.getSymbol(), s -> new Position(s, 0, 0));
        pos.addShares(shares, executionPrice);

        Transaction tx = new Transaction(stock.getSymbol(), stock.getName(), Transaction.Type.BUY,
                execType, shares, executionPrice, 0.0, null);
        transactions.add(0, tx);
        return tx;
    }

    /**
     * Executes a SELL operation for the given stock
     */
    public synchronized Transaction sellStock(Stock stock, int shares, Transaction.ExecutionType execType, Double customPrice) {
        if (shares <= 0) throw new IllegalArgumentException("Shares must be positive");
        Position pos = positions.get(stock.getSymbol());

        if (pos == null || pos.getShares() < shares) {
            int owned = (pos != null) ? pos.getShares() : 0;
            throw new IllegalStateException(String.format("Insufficient shares. Owned: %d, Requested: %d", owned, shares));
        }

        double executionPrice = (customPrice != null) ? customPrice : stock.getBidPrice();
        double grossProceeds = Math.round(shares * executionPrice * 100.0) / 100.0;
        double costBasisRemoved = pos.removeShares(shares);
        double realizedPnL = Math.round((grossProceeds - costBasisRemoved) * 100.0) / 100.0;

        if (pos.getShares() == 0) {
            positions.remove(stock.getSymbol());
        }

        this.cashBalance += grossProceeds;
        Transaction tx = new Transaction(stock.getSymbol(), stock.getName(), Transaction.Type.SELL,
                execType, shares, executionPrice, 0.0, realizedPnL);
        transactions.add(0, tx);
        return tx;
    }

    /**
     * Calculates total net worth (Cash + current market value of all held stocks)
     */
    public double calculateTotalValue(Map<String, Stock> marketStocks) {
        double stockValue = 0.0;
        for (Position pos : positions.values()) {
            Stock stock = marketStocks.get(pos.getSymbol());
            double price = (stock != null) ? stock.getCurrentPrice() : pos.getAverageBuyPrice();
            stockValue += pos.calculateMarketValue(price);
        }
        return Math.round((cashBalance + stockValue) * 100.0) / 100.0;
    }

    public double calculateTotalProfitLoss(Map<String, Stock> marketStocks) {
        return Math.round((calculateTotalValue(marketStocks) - initialDeposit) * 100.0) / 100.0;
    }

    public double calculateTotalReturnPercent(Map<String, Stock> marketStocks) {
        if (initialDeposit == 0) return 0.0;
        return Math.round((calculateTotalProfitLoss(marketStocks) / initialDeposit) * 10000.0) / 100.0;
    }

    public void recordPerformanceSnapshot(Map<String, Stock> marketStocks) {
        this.equityHistory.add(calculateTotalValue(marketStocks));
    }
}`,
  },
  {
    name: 'User.java',
    category: 'Model',
    description: 'Encapsulates investor identity, portfolio, limit orders, and order matching logic.',
    code: `package com.trading.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * User Account aggregate containing authentication details, portfolio, and active orders.
 */
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String userId;
    private String username;
    private final Portfolio portfolio;
    private final List<Order> limitOrders;

    public User(String userId, String username, double startingCapital) {
        this.userId = userId;
        this.username = username;
        this.portfolio = new Portfolio(startingCapital);
        this.limitOrders = new ArrayList<>();
    }

    public String getUserId() { return userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Portfolio getPortfolio() { return portfolio; }
    public List<Order> getLimitOrders() { return Collections.unmodifiableList(limitOrders); }

    public Order placeLimitOrder(String symbol, Transaction.Type type, double targetPrice, int shares) {
        Order order = new Order(symbol, type, targetPrice, shares);
        this.limitOrders.add(0, order);
        return order;
    }

    public void checkAndExecuteLimitOrders(Map<String, Stock> market) {
        for (Order order : limitOrders) {
            if (order.getStatus() != Order.Status.PENDING) continue;
            Stock stock = market.get(order.getSymbol());
            if (stock == null) continue;

            if (order.shouldExecute(stock.getCurrentPrice())) {
                try {
                    if (order.getType() == Transaction.Type.BUY) {
                        portfolio.buyStock(stock, order.getShares(), Transaction.ExecutionType.LIMIT, order.getTargetPrice());
                    } else {
                        portfolio.sellStock(stock, order.getShares(), Transaction.ExecutionType.LIMIT, order.getTargetPrice());
                    }
                    order.execute();
                    System.out.println(">>> LIMIT ORDER EXECUTED: " + order);
                } catch (Exception e) {
                    System.err.println("Failed to execute limit order: " + e.getMessage());
                }
            }
        }
    }

    @Override
    public String toString() {
        return String.format("User[%s, %s] | Cash: $%.2f", userId, username, portfolio.getCashBalance());
    }
}`,
  },
  {
    name: 'MarketSimulator.java',
    category: 'Engine',
    description: 'Manages registry of stocks, multi-threaded market tick loop, and price broadcasts.',
    code: `package com.trading.engine;

import com.trading.model.Stock;
import java.util.*;
import java.util.concurrent.*;

/**
 * Market Simulation Engine running real-time price updates across all listed equities.
 */
public class MarketSimulator {
    private final Map<String, Stock> stockRegistry;
    private final ScheduledExecutorService scheduler;
    private volatile boolean isRunning;
    private double marketMultiplier = 1.0;

    public MarketSimulator() {
        this.stockRegistry = new ConcurrentHashMap<>();
        this.scheduler = Executors.newSingleThreadScheduledExecutor();
        this.isRunning = false;
        initializeStocks();
    }

    private void initializeStocks() {
        registerStock(new Stock("AAPL", "Apple Inc.", "Technology", 228.45, 0.012, 0.44));
        registerStock(new Stock("NVDA", "NVIDIA Corporation", "Technology", 124.80, 0.025, 0.03));
        registerStock(new Stock("MSFT", "Microsoft Corporation", "Technology", 442.15, 0.011, 0.68));
        registerStock(new Stock("TSLA", "Tesla, Inc.", "Automotive", 248.90, 0.032, 0.00));
        registerStock(new Stock("AMZN", "Amazon.com, Inc.", "Consumer", 186.75, 0.016, 0.00));
        registerStock(new Stock("GOOGL", "Alphabet Inc.", "Technology", 168.30, 0.014, 0.48));
        registerStock(new Stock("JPM", "JPMorgan Chase & Co.", "Financials", 214.60, 0.010, 2.15));
        registerStock(new Stock("XOM", "Exxon Mobil Corp.", "Energy", 118.20, 0.015, 3.22));
    }

    public void registerStock(Stock stock) {
        stockRegistry.put(stock.getSymbol(), stock);
    }

    public Stock getStock(String symbol) {
        return stockRegistry.get(symbol.toUpperCase());
    }

    public Map<String, Stock> getAllStocks() {
        return Collections.unmodifiableMap(stockRegistry);
    }

    public void startSimulation(long tickIntervalMs) {
        this.isRunning = true;
        scheduler.scheduleAtFixedRate(() -> {
            if (isRunning) {
                for (Stock stock : stockRegistry.values()) {
                    stock.tick(marketMultiplier);
                }
            }
        }, 0, tickIntervalMs, TimeUnit.MILLISECONDS);
    }

    public void stopSimulation() {
        this.isRunning = false;
        scheduler.shutdown();
    }

    public void setMarketMultiplier(double multiplier) {
        this.marketMultiplier = multiplier;
    }
}`,
  },
  {
    name: 'PortfolioPersistence.java',
    category: 'Persistence',
    description: 'File I/O manager saving and loading portfolio state via Binary Serialization and CSV files.',
    code: `package com.trading.persistence;

import com.trading.model.Portfolio;
import com.trading.model.Position;
import com.trading.model.Transaction;
import com.trading.model.User;

import java.io.*;

/**
 * File I/O Persistence Utility implementing:
 * 1. Java Object Serialization (.dat / .ser)
 * 2. Formatted CSV Export for transactions ledger
 * 3. Text file snapshot saver/loader
 */
public class PortfolioPersistence {

    /**
     * Persists a User object and full Portfolio graph to disk using Java Object Serialization.
     */
    public static void saveUserToFile(User user, String filePath) throws IOException {
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new BufferedOutputStream(new FileOutputStream(filePath)))) {
            oos.writeObject(user);
            System.out.println("Portfolio serialized successfully to " + filePath);
        }
    }

    /**
     * Loads a User object and full Portfolio graph from disk using Java Object Deserialization.
     */
    public static User loadUserFromFile(String filePath) throws IOException, ClassNotFoundException {
        try (ObjectInputStream ois = new ObjectInputStream(
                new BufferedInputStream(new FileInputStream(filePath)))) {
            User user = (User) ois.readObject();
            System.out.println("Portfolio deserialized successfully from " + filePath);
            return user;
        }
    }

    /**
     * Exports transactions ledger into a structured CSV file.
     */
    public static void exportTransactionsToCSV(Portfolio portfolio, String csvFilePath) throws IOException {
        try (PrintWriter writer = new PrintWriter(new BufferedWriter(new FileWriter(csvFilePath)))) {
            writer.println("ID,Timestamp,Symbol,Type,Shares,Price,TotalAmount,RealizedPnL");
            for (Transaction tx : portfolio.getTransactions()) {
                writer.printf("%s,%s,%s,%s,%d,%.2f,%.2f,%s%n",
                        tx.getId(),
                        tx.getFormattedDate(),
                        tx.getSymbol(),
                        tx.getType(),
                        tx.getShares(),
                        tx.getPrice(),
                        tx.getTotalAmount(),
                        tx.getRealizedPnL() != null ? String.format("%.2f", tx.getRealizedPnL()) : "0.00"
                );
            }
            System.out.println("Transactions ledger exported to CSV: " + csvFilePath);
        }
    }
}`,
  },
  {
    name: 'Main.java',
    category: 'Main',
    description: 'Executable test driver demonstrating OOP stock trading, limit orders, and file persistence in action.',
    code: `package com.trading;

import com.trading.engine.MarketSimulator;
import com.trading.model.Stock;
import com.trading.model.Transaction;
import com.trading.model.User;
import com.trading.persistence.PortfolioPersistence;

/**
 * Driver application showcasing full Stock Trading Platform lifecycle in Java.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("     JAVA OBJECT-ORIENTED STOCK TRADING PLATFORM   ");
        System.out.println("==================================================");

        // 1. Initialize Market Simulator Engine
        MarketSimulator market = new MarketSimulator();
        System.out.println("Market Engine initialized with 8 exchange equities.\\n");

        // 2. Create User Account with $100,000 Starting Balance
        User user = new User("USR-101", "Alex Trader", 100_000.00);
        System.out.println("Created Account: " + user);

        // 3. Display Initial Stock Quotes
        System.out.println("\\n--- CURRENT MARKET QUOTES ---");
        for (Stock stock : market.getAllStocks().values()) {
            System.out.println(stock);
        }

        // 4. Execute Buy Orders
        System.out.println("\\n--- EXECUTING TRADES ---");
        Stock aapl = market.getStock("AAPL");
        Stock nvda = market.getStock("NVDA");

        Transaction tx1 = user.getPortfolio().buyStock(aapl, 50, Transaction.ExecutionType.MARKET, null);
        System.out.println("Executed: " + tx1);

        Transaction tx2 = user.getPortfolio().buyStock(nvda, 100, Transaction.ExecutionType.MARKET, null);
        System.out.println("Executed: " + tx2);

        // 5. Place a Limit Order
        System.out.println("\\n--- PLACING LIMIT ORDER ---");
        user.placeLimitOrder("TSLA", Transaction.Type.BUY, 240.00, 40);
        System.out.println("Active Limit Orders: " + user.getLimitOrders().size());

        // 6. Simulate Market Ticks & Price Shifts
        System.out.println("\\n--- SIMULATING 5 MARKET TICKS ---");
        for (int i = 1; i <= 5; i++) {
            for (Stock s : market.getAllStocks().values()) {
                s.tick(1.5);
            }
            user.checkAndExecuteLimitOrders(market.getAllStocks());
            user.getPortfolio().recordPerformanceSnapshot(market.getAllStocks());
            System.out.printf("Tick #%d - Total Portfolio Net Worth: $%.2f%n",
                    i, user.getPortfolio().calculateTotalValue(market.getAllStocks()));
        }

        // 7. Execute a Partial Sell Order
        System.out.println("\\n--- SELLING ASSETS ---");
        Transaction tx3 = user.getPortfolio().sellStock(aapl, 20, Transaction.ExecutionType.MARKET, null);
        System.out.println("Executed: " + tx3);

        // 8. Performance and Holdings Summary
        System.out.println("\\n================ PORTFOLIO SUMMARY ================");
        System.out.printf("Cash Balance:     $%.2f%n", user.getPortfolio().getCashBalance());
        System.out.printf("Total Net Worth:  $%.2f%n", user.getPortfolio().calculateTotalValue(market.getAllStocks()));
        System.out.printf("Total Return:     $%.2f (%+.2f%%)%n",
                user.getPortfolio().calculateTotalProfitLoss(market.getAllStocks()),
                user.getPortfolio().calculateTotalReturnPercent(market.getAllStocks()));

        System.out.println("\\nActive Holdings:");
        user.getPortfolio().getPositions().values().forEach(System.out::println);

        // 9. File I/O Persistence
        System.out.println("\\n--- PERSISTING PORTFOLIO DATA (FILE I/O) ---");
        try {
            PortfolioPersistence.saveUserToFile(user, "portfolio_data.ser");
            PortfolioPersistence.exportTransactionsToCSV(user.getPortfolio(), "transactions_audit.csv");
            System.out.println("Persistence checks completed successfully.");
        } catch (Exception e) {
            System.err.println("File I/O Error: " + e.getMessage());
        }

        System.out.println("\\nTrading platform simulation completed.");
    }
}`,
  },
];
