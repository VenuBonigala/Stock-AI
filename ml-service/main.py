from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import yfinance as yf
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        data = yf.download(symbol, period="1y", interval="1d")

        if data is None or data.empty:
            return {"error": "No data available"}

        closes = data["Close"]

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
def history(symbol: str, period: str = "6mo", interval: str = "1d"):
    try:
        # Intraday handling
        if interval in ["1m", "5m", "10m", "15m"]:
            period = "1d"   # force today’s data

        data = yf.download(symbol, period=period, interval=interval)

        if data is None or data.empty:
            return []

        closes = data["Close"]

        if hasattr(closes, "columns"):
            closes = closes[symbol]

        closes = closes.dropna()

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


@app.get("/intraday")
def intraday(symbol: str):
    try:
        # Fetch 5 days of 5-minute data
        data = yf.download(symbol, period="5d", interval="5m")

        if data is None or data.empty:
            return {"error": "No intraday data available"}

        close = data["Close"]

        if hasattr(close, "columns"):
            close = close[symbol]

        close = close.dropna()

        if len(close) < 50:
            return {"error": "Not enough intraday data"}

        prices = close.values

        # --- EMA ---
        ema_period = 20
        ema = np.convolve(
            prices,
            np.ones(ema_period) / ema_period,
            mode="valid"
        )[-1]

        current_price = prices[-1]

        # --- RSI ---
        delta = np.diff(prices)
        gain = np.maximum(delta, 0)
        loss = np.abs(np.minimum(delta, 0))

        avg_gain = np.mean(gain[-14:])
        avg_loss = np.mean(loss[-14:]) + 1e-6

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))

        # --- Signal logic ---
        score = 0

        if current_price > ema:
            score += 1
        else:
            score -= 1

        if rsi < 35:
            score += 1
        elif rsi > 65:
            score -= 1

        if score > 0:
            signal = "BUY"
        else:
            signal = "SELL"

        confidence = min(90, 50 + abs(score) * 20)

        day_high = float(np.max(prices[-78:]))  # last trading day approx
        day_low = float(np.min(prices[-78:]))

        return {
            "symbol": symbol,
            "price": round(float(current_price), 2),
            "day_high": round(day_high, 2),
            "day_low": round(day_low, 2),
            "signal": signal,
            "confidence": confidence,
            "rsi": round(float(rsi), 2)
        }

    except Exception as e:
        print("Intraday error:", str(e))
        return {"error": "Intraday prediction failed"}
