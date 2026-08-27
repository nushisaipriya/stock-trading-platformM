package com.trading.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

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
}
