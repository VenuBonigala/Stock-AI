package com.stockai.backend.controller;

import java.util.*;
import com.stockai.backend.model.Prediction;
import com.stockai.backend.model.Stock;
import com.stockai.backend.service.StockService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping
    public Stock addStock(@RequestBody Stock stock) {
        return stockService.saveStock(stock);
    }

    @GetMapping
    public List<Stock> getStocks() {
        return stockService.getAllStocks();
    }

    @GetMapping("/fetch/{symbol}")
    public Stock fetchStock(@PathVariable String symbol) {
        return stockService.fetchAndSaveStock(symbol);
    }

    @GetMapping("/predict/{symbol}")
public Prediction predict(
        @PathVariable String symbol,
        @RequestParam(defaultValue = "6mo") String period) {
    return stockService.getPrediction(symbol, period);
}


    @GetMapping("/history/{symbol}")
public List<Map<String, Object>> getHistory(
        @PathVariable String symbol,
        @RequestParam(defaultValue = "6mo") String period) {
    return stockService.getStockHistory(symbol, period);
}



}
