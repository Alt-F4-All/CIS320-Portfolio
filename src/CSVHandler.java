import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.apache.commons.csv.*;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class CSVHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if ("POST".equals(exchange.getRequestMethod())) {
            InputStream input = exchange.getRequestBody();

            // Read uploaded CSV file
            BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8));
            CSVParser parser = CSVFormat.DEFAULT
                    .withFirstRecordAsHeader()
                    .parse(reader);

            List<Investment> investments = new ArrayList<>();
            double totalValue = 0;
            double totalProfitLoss = 0;

            List<String> symbols = new ArrayList<>();
            List<CSVRecord> records = new ArrayList<>();

            for (CSVRecord record : parser) {
                symbols.add(record.get("symbol").toUpperCase());
                records.add(record);
            }

            try {
                Map<String, Stock> stockMap = YahooFinance.get(symbols.toArray(new String[0]));

                for (CSVRecord record : records) {
                    String symbol = record.get("symbol").toUpperCase();
                    int qty = Integer.parseInt(record.get("quantity"));
                    double buyPrice = Double.parseDouble(record.get("buyPrice"));
                    String date = record.get("date");

                    double currentPrice;
                    try {
                        Stock stock = stockMap.get(symbol);
                        BigDecimal price = (stock != null && stock.getQuote().getPrice() != null)
                                ? stock.getQuote().getPrice()
                                : null;
                        currentPrice = (price != null) ? price.doubleValue() : buyPrice;
                    } catch (Exception e) {
                        currentPrice = buyPrice;
                    }

                    Investment inv = new Investment(symbol, qty, buyPrice, currentPrice, date);
                    investments.add(inv);
                    totalValue += inv.quantity * inv.currentPrice;
                    totalProfitLoss += inv.profitLoss;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            // JSON response
            StringBuilder json = new StringBuilder();
            json.append("{\"investments\":[");
            for (int i = 0; i < investments.size(); i++) {
                Investment inv = investments.get(i);
                json.append(String.format(Locale.US,
                        "{\"symbol\":\"%s\",\"quantity\":%d,\"buyPrice\":%.2f,\"currentPrice\":%.2f,\"profitLoss\":%.2f}",
                        inv.symbol, inv.quantity, inv.buyPrice, inv.currentPrice, inv.profitLoss));
                if (i < investments.size() - 1) json.append(",");
            }
            json.append("],");
            json.append(String.format(Locale.US, "\"totalValue\":%.2f,\"totalProfitLoss\":%.2f}", totalValue, totalProfitLoss));

            byte[] response = json.toString().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            OutputStream os = exchange.getResponseBody();
            os.write(response);
            os.close();
        }
    }
}