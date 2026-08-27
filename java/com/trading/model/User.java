package com.trading.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

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
}
