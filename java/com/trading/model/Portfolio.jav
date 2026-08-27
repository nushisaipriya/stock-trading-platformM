package com.trading.model;

import java.io.Serializable;
import java.util.*;

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
}
