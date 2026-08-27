package com.trading.model;

import java.io.Serializable;

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
}
