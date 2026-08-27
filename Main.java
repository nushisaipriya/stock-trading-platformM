package com.trading;

import com.trading.engine.MarketSimulator;
import com.trading.model.Stock;
import com.trading.model.Transaction;
import com.trading.model.User;
import com.trading.persistence.PortfolioPersistence;

/**
 * Driver application showcasing full Stock Trading Platform lifecycle in Java.
 * Demonstrates:
 * - OOP Domain Architecture (Stock, User, Portfolio, Position, Transaction, Order)
 * - Encapsulation, State Mutation, and Aggregation
 * - Buy / Sell Operations and Cash Balance Updates
 * - Portfolio Valuation and Realized / Unrealized Profit & Loss calculations
 * - Limit Order State Machine
 * - File I/O Persistence (Binary Serialization & CSV Ledger Export)
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("     JAVA OBJECT-ORIENTED STOCK TRADING PLATFORM   ");
        System.out.println("==================================================");

        // 1. Initialize Market Simulator Engine
        MarketSimulator market = new MarketSimulator();
        System.out.println("Market Engine initialized with 8 exchange equities.\n");

        // 2. Create User Account with $100,000 Starting Capital
        User user = new User("USR-101", "Alex Trader", 100_000.00);
        System.out.println("Created Account: " + user);

        // 3. Display Initial Stock Quotes
        System.out.println("\n--- CURRENT MARKET QUOTES ---");
        for (Stock stock : market.getAllStocks().values()) {
            System.out.println(stock);
        }

        // 4. Execute Buy Orders
        System.out.println("\n--- EXECUTING TRADES ---");
        Stock aapl = market.getStock("AAPL");
        Stock nvda = market.getStock("NVDA");

        Transaction tx1 = user.getPortfolio().buyStock(aapl, 50, Transaction.ExecutionType.MARKET, null);
        System.out.println("Executed: " + tx1);

        Transaction tx2 = user.getPortfolio().buyStock(nvda, 100, Transaction.ExecutionType.MARKET, null);
        System.out.println("Executed: " + tx2);

        // 5. Place a Limit Order
        System.out.println("\n--- PLACING LIMIT ORDER ---");
        user.placeLimitOrder("TSLA", Transaction.Type.BUY, 240.00, 40);
        System.out.println("Active Limit Orders: " + user.getLimitOrders().size());

        // 6. Simulate Market Ticks & Price Shifts
        System.out.println("\n--- SIMULATING 5 MARKET TICKS ---");
        for (int i = 1; i <= 5; i++) {
            for (Stock s : market.getAllStocks().values()) {
                s.tick(1.5);
            }
            user.checkAndExecuteLimitOrders(market.getAllStocks());
            user.getPortfolio().recordPerformanceSnapshot(market.getAllStocks());
            System.out.printf("Tick #%d - Total Portfolio Net Worth: $%.2f%n",
                    i, user.getPortfolio().calculateTotalValue(market.getAllStocks()));
        }

        // 7. Execute a Partial Sell Order (Calculating Realized Profit/Loss)
        System.out.println("\n--- SELLING ASSETS ---");
        Transaction tx3 = user.getPortfolio().sellStock(aapl, 20, Transaction.ExecutionType.MARKET, null);
        System.out.println("Executed: " + tx3);

        // 8. Performance and Holdings Summary
        System.out.println("\n================ PORTFOLIO SUMMARY ================");
        System.out.printf("Cash Balance:     $%.2f%n", user.getPortfolio().getCashBalance());
        System.out.printf("Total Net Worth:  $%.2f%n", user.getPortfolio().calculateTotalValue(market.getAllStocks()));
        System.out.printf("Total Return:     $%.2f (%+.2f%%)%n",
                user.getPortfolio().calculateTotalProfitLoss(market.getAllStocks()),
                user.getPortfolio().calculateTotalReturnPercent(market.getAllStocks()));

        System.out.println("\nActive Holdings:");
        user.getPortfolio().getPositions().values().forEach(System.out::println);

        // 9. File I/O Persistence
        System.out.println("\n--- PERSISTING PORTFOLIO DATA (FILE I/O) ---");
        try {
            PortfolioPersistence.saveUserToFile(user, "portfolio_data.ser");
            PortfolioPersistence.exportTransactionsToCSV(user.getPortfolio(), "transactions_audit.csv");
            System.out.println("Persistence checks completed successfully.");
        } catch (Exception e) {
            System.err.println("File I/O Error: " + e.getMessage());
        }

        System.out.println("\nTrading platform simulation completed successfully.");
    }
}
