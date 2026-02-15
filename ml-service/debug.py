import yfinance as yf

data = yf.download("AAPL", period="1mo", interval="1d")

print("\nDATA TYPE:")
print(type(data))

print("\nCOLUMNS:")
print(data.columns)

print("\nHEAD:")
print(data.head())

print("\nCLOSE COLUMN:")
try:
    print(data["Close"].head())
except Exception as e:
    print("Error accessing Close:", e)
