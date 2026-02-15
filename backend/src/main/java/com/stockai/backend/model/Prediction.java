package com.stockai.backend.model;

public class Prediction {

    private String symbol;
    private double current_price;
    private double predicted_price;
    private String signal;
    private double expected_change;

    public Prediction() {}

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public double getCurrent_price() {
        return current_price;
    }

    public void setCurrent_price(double current_price) {
        this.current_price = current_price;
    }

    public double getPredicted_price() {
        return predicted_price;
    }

    public void setPredicted_price(double predicted_price) {
        this.predicted_price = predicted_price;
    }

    public String getSignal() {
        return signal;
    }

    public void setSignal(String signal) {
        this.signal = signal;
    }

    public double getExpected_change() {
        return expected_change;
    }

    public void setExpected_change(double expected_change) {
        this.expected_change = expected_change;
    }
}
