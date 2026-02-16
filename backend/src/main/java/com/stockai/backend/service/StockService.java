package com.stockai.backend.service;

import java.util.*;
import com.stockai.backend.model.Prediction;
import com.stockai.backend.model.Stock;
import com.stockai.backend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class StockService {

    private final StockRepository stockRepository;
    private final RestTemplate restTemplate;

    @Value("${alphavantage.api.key}")
    private String apiKey;

    public StockService(StockRepository stockRepository, RestTemplate restTemplate) {
        this.stockRepository = stockRepository;
        this.restTemplate = restTemplate;
    }

    public Stock saveStock(Stock stock) {
        return stockRepository.save(stock);
    }

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Stock fetchAndSaveStock(String symbol) {
        String url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="
                + symbol + "&apikey=" + apiKey;

        Map response = restTemplate.getForObject(url, Map.class);

        if (response == null || !response.containsKey("Global Quote")) {
            throw new RuntimeException("Invalid API response");
        }

        Map quote = (Map) response.get("Global Quote");

        String priceStr = (String) quote.get("05. price");
        double price = Double.parseDouble(priceStr);

        Stock stock = new Stock();
        stock.setSymbol(symbol);
        stock.setName(symbol);
        stock.setLastPrice(price);

        return stockRepository.save(stock);
    }

    public Prediction getPrediction(String symbol, String period) {
        String normalized = normalizeSymbol(symbol);
        String url = "http://127.0.0.1:8000/predict?symbol=" + normalized + "&period=" + period;
        return restTemplate.postForObject(url, null, Prediction.class);
    }

    public List<Map<String, Object>> getStockHistory(String symbol, String period, String interval) {
        String normalized = normalizeSymbol(symbol);
        String url = "http://127.0.0.1:8000/history?symbol="
                + normalized + "&period=" + period + "&interval=" + interval;

        try {
            List<Map<String, Object>> response
                    = restTemplate.getForObject(url, List.class);

            return response != null ? response : new ArrayList<>();
        } catch (Exception e) {
            System.out.println("History fetch failed: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private String normalizeSymbol(String symbol) {
        symbol = symbol.toUpperCase().trim();

        // Index mappings
        if (symbol.equals("NIFTY50") || symbol.equals("NIFTY")) {
            return "^NSEI";
        }
        if (symbol.equals("SENSEX")) {
            return "^BSESN";
        }

        // Otherwise, use symbol as-is
        return symbol;
    }

    public Map<String, Object> getIntraday(String symbol) {
        String normalized = normalizeSymbol(symbol);
        String url = "http://127.0.0.1:8000/intraday?symbol=" + normalized;

        try {
            Map<String, Object> response
                    = restTemplate.getForObject(url, Map.class);
            return response;
        } catch (Exception e) {
            System.out.println("Intraday fetch failed: " + e.getMessage());
            return new HashMap<>();
        }
    }

}
