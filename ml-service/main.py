from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import yfinance as yf
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "ML service is running"}

@app.post("/predict")
def predict(symbol: str, period: str = "6mo"):
    try:
        # Always train on 1 year of data
        data = yf.download(symbol, period="1y", interval="1d")

        if data is None or data.empty:
            return {"error": "No data available"}

        closes = data["Close"]

        # Handle MultiIndex
        if hasattr(closes, "columns"):
            closes = closes[symbol]

        closes = closes.dropna()

        if len(closes) < 50:
            return {"error": "Insufficient data"}

        closing_prices = closes.values.reshape(-1, 1)

        X = np.arange(len(closing_prices)).reshape(-1, 1)
        y = closing_prices

        model = LinearRegression()
        model.fit(X, y)

        # Prediction horizon mapping
        horizon_map = {
            "1mo": 22,
            "3mo": 66,
            "6mo": 132,
            "1y": 252
        }

        future_days = horizon_map.get(period, 132)

        next_day = np.array([[len(closing_prices) + future_days]])
        predicted_price = model.predict(next_day)[0][0]

        current_price = closing_prices[-1][0]

        signal = "BUY" if predicted_price > current_price else "SELL"
        expected_change = predicted_price - current_price

        return {
            "symbol": symbol,
            "current_price": round(float(current_price), 2),
            "predicted_price": round(float(predicted_price), 2),
            "signal": signal,
            "expected_change": round(float(expected_change), 2),
            "prediction_period": period,
            "training_data": "1 year"
        }

    except Exception as e:
        print("Prediction error:", str(e))
        return {"error": "Prediction failed"}

@app.get("/history")
def history(symbol: str, period: str = "6mo"):
    try:
        data = yf.download(symbol, period=period, interval="1d")

        if data is None or data.empty:
            return []

        if hasattr(data.columns, "levels"):
            closes = data["Close"][symbol].dropna().tolist()
        else:
            closes = data["Close"].dropna().tolist()

        result = []
        for i, price in enumerate(closes):
            result.append({
                "date": i + 1,
                "price": float(price)
            })

        return result

    except Exception as e:
        print("History error:", str(e))
        return []

