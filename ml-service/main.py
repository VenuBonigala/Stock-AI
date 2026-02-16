import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import yfinance as yf
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI()
model = joblib.load("models/intraday_model.pkl")
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
        # intraday intervals → use 5 days for stability
        if interval in ["1m", "5m", "15m"]:
            period = "1d"

        data = yf.download(symbol, period=period, interval=interval)

        if data is None or data.empty:
            return []

        # Handle multi-index
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)

        data = data.dropna()

        result = []
        for i, row in enumerate(data.itertuples()):
            result.append({
                "date": i + 1,
                "price": float(row.Close),
                "open": float(row.Open),
                "high": float(row.High),
                "low": float(row.Low),
                "close": float(row.Close)
            })

        return result

    except Exception as e:
        print("History error:", str(e))
        return []


@app.get("/intraday")
def intraday(symbol: str):
    try:
        data = yf.download(symbol, period="1d", interval="5m")

        if data is None or data.empty:
            return {"error": "No intraday data available"}

        df = data.dropna()

        if len(df) < 30:
            return {"error": "Not enough intraday data"}

        close = df["Close"]
        high = df["High"]
        low = df["Low"]
        volume = df["Volume"]

        if hasattr(close, "columns"):
            close = close.iloc[:, 0]
            high = high.iloc[:, 0]
            low = low.iloc[:, 0]
            volume = volume.iloc[:, 0]

        df = pd.DataFrame({
            "Close": close,
            "High": high,
            "Low": low,
            "Volume": volume
        })

        # Feature engineering (same as training)
        df["return_1"] = df["Close"].pct_change(1)
        df["return_3"] = df["Close"].pct_change(3)
        df["return_5"] = df["Close"].pct_change(5)

        df["ema_9"] = df["Close"].ewm(span=9).mean()
        df["ema_21"] = df["Close"].ewm(span=21).mean()

        # RSI
        delta = df["Close"].diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.rolling(14).mean()
        avg_loss = loss.rolling(14).mean() + 1e-6
        rs = avg_gain / avg_loss
        df["rsi"] = 100 - (100 / (1 + rs))

        # MACD
        ema12 = df["Close"].ewm(span=12).mean()
        ema26 = df["Close"].ewm(span=26).mean()
        df["macd"] = ema12 - ema26

        # ATR
        high_low = df["High"] - df["Low"]
        high_close = (df["High"] - df["Close"].shift()).abs()
        low_close = (df["Low"] - df["Close"].shift()).abs()
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        df["atr"] = tr.rolling(14).mean()

        df = df.dropna()

        latest = df.iloc[-1]

        features = [
            "Close",
            "Volume",
            "return_1",
            "return_3",
            "return_5",
            "ema_9",
            "ema_21",
            "rsi",
            "macd",
            "atr"
        ]

        X = pd.DataFrame([latest[features]])

        # Predict probabilities
        probs = model.predict_proba(X)[0]
        classes = model.classes_

        prob_map = dict(zip(classes, probs))

        buy_prob = prob_map.get(1, 0)
        sell_prob = prob_map.get(-1, 0)

        if buy_prob > sell_prob:
            signal = "BUY"
            confidence = buy_prob
        else:
            signal = "SELL"
            confidence = sell_prob

        entry = float(latest["Close"])
        atr = float(latest["atr"])

        if signal == "BUY":
            target = entry + atr * 1.5
            stop = entry - atr
        else:
            target = entry - atr * 1.5
            stop = entry + atr

        return {
            "symbol": symbol,
            "entry": round(entry, 2),
            "signal": signal,
            "confidence": round(confidence * 100, 1),
            "target": round(target, 2),
            "stop": round(stop, 2)
        }

    except Exception as e:
        print("Intraday error:", str(e))
        return {"error": "Intraday prediction failed"}
