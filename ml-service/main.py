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
        # intraday intervals → force only today’s data
        if interval in ["1m", "5m", "15m"]:
            period = "1d"

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
        data = yf.download(symbol, period="1d", interval="5m")

        if data is None or data.empty:
            return {"error": "No intraday data available"}

        df = data.dropna()

        if len(df) < 20:
            return {"error": "Not enough intraday data"}

        close = df["Close"]
        high = df["High"]
        low = df["Low"]
        volume = df["Volume"]

# Handle multi-column case (like AAPL in certain responses)
        if hasattr(close, "columns"):
            close = close.iloc[:, 0]
            high = high.iloc[:, 0]
            low = low.iloc[:, 0]
            volume = volume.iloc[:, 0]

        close = close.values
        high = high.values
        low = low.values
        volume = volume.values


        current_price = close[-1]

        # -----------------------
        # EMA 20 & EMA 50
        # -----------------------
        def ema(prices, period):
            alpha = 2 / (period + 1)
            ema_val = prices[0]
            for price in prices[1:]:
                ema_val = alpha * price + (1 - alpha) * ema_val
            return ema_val


        ema20 = ema(close, min(20, len(close)))
        ema50 = ema(close, min(50, len(close)))

        # -----------------------
        # RSI (14)
        # -----------------------
        delta = np.diff(close)
        gain = np.maximum(delta, 0)
        loss = np.abs(np.minimum(delta, 0))

        avg_gain = np.mean(gain[-14:])
        avg_loss = np.mean(loss[-14:]) + 1e-6

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))

        # -----------------------
        # MACD
        # -----------------------
        def ema_series(prices, period):
            alpha = 2 / (period + 1)
            ema_vals = [prices[0]]
            for price in prices[1:]:
                ema_vals.append(alpha * price + (1 - alpha) * ema_vals[-1])
            return np.array(ema_vals)

        ema12 = ema_series(close, 12)
        ema26 = ema_series(close, 26)
        macd_line = ema12 - ema26
        signal_line = ema_series(macd_line, 9)

        macd = macd_line[-1]
        macd_signal = signal_line[-1]

        # -----------------------
        # VWAP
        # -----------------------
        typical_price = (high + low + close) / 3
        vwap = np.sum(typical_price * volume) / np.sum(volume)

        # -----------------------
        # ATR (14)
        # -----------------------
        tr = np.maximum(
            high[1:] - low[1:],
            np.maximum(
                abs(high[1:] - close[:-1]),
                abs(low[1:] - close[:-1])
            )
        )
        atr = np.mean(tr[-14:])

        # -----------------------
        # Signal scoring
        # -----------------------
        score = 0
        total = 5

        # EMA trend
        score += 1 if ema20 > ema50 else -1

        # RSI
        if rsi < 35:
            score += 1
        elif rsi > 65:
            score -= 1

        # MACD
        score += 1 if macd > macd_signal else -1

        # VWAP
        score += 1 if current_price > vwap else -1

        # Price vs EMA20
        score += 1 if current_price > ema20 else -1

        # -----------------------
        # Final signal
        # -----------------------
        signal = "BUY" if score > 0 else "SELL"

        confidence = int(50 + (abs(score) / total) * 50)
        confidence = min(95, max(35, confidence))

        # -----------------------
        # ATR-based targets
        # -----------------------
        if signal == "BUY":
            target = current_price + atr * 1.5
            stop = current_price - atr
        else:
            target = current_price - atr * 1.5
            stop = current_price + atr

        return {
            "symbol": symbol,
            "price": round(float(current_price), 2),
            "signal": signal,
            "confidence": confidence,
            "target": round(float(target), 2),
            "stop": round(float(stop), 2),
            "rsi": round(float(rsi), 2),
            "atr": round(float(atr), 2)
        }

    except Exception as e:
        print("Intraday error:", str(e))
        return {"error": "Intraday prediction failed"}
