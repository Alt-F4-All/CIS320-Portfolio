public class Investment {
    public String symbol;
    public int quantity;
    public double buyPrice;
    public double currentPrice;
    public double profitLoss;
    public String date;

    public Investment(String symbol, int quantity, double buyPrice, double currentPrice, String date) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.currentPrice = currentPrice;
        this.date = date;
        this.profitLoss = (currentPrice - buyPrice) * quantity;
    }
}