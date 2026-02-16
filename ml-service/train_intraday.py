import yfinance as yf
import pandas as pd
import numpy as np
import lightgbm as lgb
import joblib
import os

SYMBOLS = [
    "AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "NVDA",
    "JPM", "BAC", "WFC",
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS"
]

INTERVAL = "5m"
PERIOD = "60d"
FUTURE_STEPS = 3

def compute_rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(period).mean()
    avg_loss = loss.rolling(period).mean() + 1e-6

    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def add_features(df):
    df["return_1"] = df["Close"].pct_change(1)
    df["return_3"] = df["Close"].pct_change(3)
    df["return_5"] = df["Close"].pct_change(5)

    df["ema_9"] = df["Close"].ewm(span=9).mean()
    df["ema_21"] = df["Close"].ewm(span=21).mean()

    df["rsi"] = compute_rsi(df["Close"])

    ema12 = df["Close"].ewm(span=12).mean()
    ema26 = df["Close"].ewm(span=26).mean()
    df["macd"] = ema12 - ema26

    high_low = df["High"] - df["Low"]
    high_close = np.abs(df["High"] - df["Close"].shift())
    low_close = np.abs(df["Low"] - df["Close"].shift())

    tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    df["atr"] = tr.rolling(14).mean()

    return df


def create_target(df):
    future_price = df["Close"].shift(-FUTURE_STEPS)
    future_return = (future_price - df["Close"]) / df["Close"]

    conditions = [
        future_return > 0.003,
        future_return < -0.003
    ]
    choices = [1, -1]

    df["target"] = np.select(conditions, choices, default=0)
    return df


all_data = []

for symbol in SYMBOLS:
    print("Downloading:", symbol)
    df = yf.download(symbol, period=PERIOD, interval=INTERVAL)
    # Fix multi-column structure
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)


    if df is None or df.empty:
        continue

    df = df.dropna()
    df = add_features(df)
    df = create_target(df)
    df["symbol"] = symbol

    df = df.dropna()
    all_data.append(df)

dataset = pd.concat(all_data)

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

X = dataset[features].copy()
y = dataset["target"]
clean_columns = []
for c in X.columns:
    if isinstance(c, tuple):
        c = "_".join([str(i) for i in c])
    c = str(c).replace(".", "_").replace("-", "_").replace(" ", "_")
    clean_columns.append(c)

X.columns = clean_columns

model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=6
)

model.fit(X, y)

os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/intraday_model.pkl")

print("Model trained and saved to models/intraday_model.pkl")
