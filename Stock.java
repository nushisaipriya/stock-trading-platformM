package com.trading.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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
}
