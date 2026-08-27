package com.trading.engine;

import com.trading.model.Stock;
import java.util.*;
import java.util.concurrent.*;

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
}
