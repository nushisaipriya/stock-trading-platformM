package com.trading.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

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
}
