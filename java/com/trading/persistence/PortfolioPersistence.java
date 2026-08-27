package com.trading.persistence;

import com.trading.model.Portfolio;
import com.trading.model.Position;
import com.trading.model.Transaction;
import com.trading.model.User;

import java.io.*;

public class PortfolioPersistence {

    public static void saveUserToFile(User user, String filePath) throws IOException {
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new BufferedOutputStream(new FileOutputStream(filePath)))) {
            oos.writeObject(user);
            System.out.println("Portfolio serialized successfully to " + filePath);
        }
    }

    public static User loadUserFromFile(String filePath) throws IOException, ClassNotFoundException {
        try (ObjectInputStream ois = new ObjectInputStream(
                new BufferedInputStream(new FileInputStream(filePath)))) {
            User user = (User) ois.readObject();
            System.out.println("Portfolio deserialized successfully from " + filePath);
            return user;
        }
    }

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
}
