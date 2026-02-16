import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PriceChart from "../components/PriceChart";

function StockPage() {
  const [chartType, setChartType] = useState("line");
  const [intradayInterval, setIntradayInterval] = useState("5m");
  const [chartRange, setChartRange] = useState("6mo");
  const [predictionRange, setPredictionRange] = useState("6mo");
  const [isIntraday, setIsIntraday] = useState(false);
  const [targetProfit, setTargetProfit] = useState(1);

  const [error, setError] = useState("");
  const { symbol } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // active trade state
  const [activeTrade, setActiveTrade] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [viewMode, setViewMode] = useState("new"); // new | active
  const [marketStatus, setMarketStatus] = useState("Unknown");

  function getMarketStatus(symbol) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const time = hours + minutes / 60;

    // India
    if (symbol.endsWith(".NS") || symbol === "NIFTY50" || symbol === "SENSEX") {
      return time >= 9.25 && time <= 15.5 ? "Open" : "Closed";
    }

    // UK / EU
    if (
      symbol.endsWith(".L") ||
      symbol.endsWith(".DE") ||
      symbol.endsWith(".PA")
    ) {
      return time >= 13.5 && time <= 22 ? "Open" : "Closed";
    }

    // US default
    return (time >= 19 && time <= 24) || time <= 1.5 ? "Open" : "Closed";
  }

  useEffect(() => {
    setMarketStatus(getMarketStatus(symbol));
  }, [symbol]);


  useEffect(() => {
    let intervalId;
    let ignore = false;

    const fetchData = async () => {
      try {
        if (isIntraday) {
          const res = await fetch(
            `http://localhost:8081/api/stocks/intraday/${symbol}`,
          );
          const data = await res.json();

          if (!ignore) {
            if (!data || data.error || data.entry === undefined) {
              throw new Error(data?.error || "Invalid intraday data");
            }
            setPrediction(data);
          }

          const histRes = await fetch(
            `http://localhost:8081/api/stocks/history/${symbol}?period=1d&interval=${intradayInterval}`,
          );
          const histData = await histRes.json();

          if (!ignore) setHistory(histData);
        } else {
          const predRes = await fetch(
            `http://localhost:8081/api/stocks/predict/${symbol}?period=${predictionRange}`,
          );
          const predData = await predRes.json();

          if (!ignore) {
            if (
              !predData ||
              predData.current_price === undefined ||
              predData.predicted_price === undefined
            ) {
              throw new Error("Invalid prediction data");
            }
            setPrediction(predData);
          }

          const histRes = await fetch(
            `http://localhost:8081/api/stocks/history/${symbol}?period=${chartRange}&interval=1d`,
          );
          const histData = await histRes.json();

          if (!ignore) setHistory(histData);
        }

        if (!ignore) setError("");
      } catch (err) {
        console.error("Error:", err);
        if (!ignore) setError("Unable to load stock data");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();

    if (isIntraday) {
      intervalId = setInterval(fetchData, 1000);
    }

    return () => {
      ignore = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [symbol, chartRange, predictionRange, isIntraday, intradayInterval]);


  useEffect(() => {
    if (!activeTrade || !prediction?.entry) return;

    const currentPrice = prediction.entry;
    const entry = Number(activeTrade.entry);
    const target = Number(activeTrade.target);
    const stop = Number(activeTrade.stop);

    let outcome = null;
    let status = "Failed";

    // BUY logic
    if (activeTrade.signal === "BUY") {
      if (currentPrice >= target) {
        outcome = "Target Hit";
        status = "Success";
      } else if (currentPrice <= stop) {
        outcome = "Stop Hit";
        status = "Failed";
      }
    }

    // SELL logic
    if (activeTrade.signal === "SELL") {
      if (currentPrice <= target) {
        outcome = "Target Hit";
        status = "Success";
      } else if (currentPrice >= stop) {
        outcome = "Stop Hit";
        status = "Failed";
      }
    }

    // Time expiry (5 minutes)
    const tradeDuration = Date.now() - activeTrade.startTime;
    const maxDuration = 5 * 60 * 1000;

    if (!outcome && tradeDuration > maxDuration) {
      outcome = "Time Expiry";
      status = "Failed";
    }

    if (outcome) {
      const finishedTrade = {
        ...activeTrade,
        outcome,
        status,
        timePeriod: "Intraday",
      };

      setTradeHistory((prev) => [finishedTrade, ...prev]);
      setActiveTrade(null);
      setViewMode("new");
    }
  }, [prediction]);



  if (loading) return <div className="p-10 text-xl">Loading...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  // --- trade calculations ---
  let entry = prediction?.entry || 0;

  const newTrade = {
    entry: entry.toFixed(2),
    target: prediction?.target?.toFixed(2) || "0.00",
    stop: prediction?.stop?.toFixed(2) || "0.00",
    confidence: prediction?.confidence || 0,
    signal: prediction?.signal || "BUY",
  };


  const tradeToShow =
    viewMode === "active" && activeTrade ? activeTrade : newTrade;

  return (
    <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">
        Stock: {prediction.symbol}
        <span className="ml-4 text-sm px-3 py-1 rounded bg-slate-800 text-gray-300">
          {isIntraday ? "Intraday Mode" : "Long-term Mode"}
        </span>
        <span
          className={`ml-3 text-sm px-3 py-1 rounded ${
            marketStatus === "Open"
              ? "bg-green-700 text-white"
              : "bg-red-700 text-white"
          }`}
        >
          Market {marketStatus}
        </span>
      </h1>

      {/* controls */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <label className="text-gray-400 mr-2">Chart:</label>
          <select
            value={chartRange}
            onChange={(e) => setChartRange(e.target.value)}
            className="bg-slate-800 text-white px-2 py-1 rounded"
            disabled={isIntraday}
          >
            <option value="1mo">1M</option>
            <option value="3mo">3M</option>
            <option value="6mo">6M</option>
            <option value="1y">1Y</option>
          </select>
        </div>

        <div>
          <label className="text-gray-400 mr-2">Prediction:</label>
          <select
            value={predictionRange}
            onChange={(e) => setPredictionRange(e.target.value)}
            className="bg-slate-800 text-white px-2 py-1 rounded"
            disabled={isIntraday}
          >
            <option value="1mo">1M</option>
            <option value="3mo">3M</option>
            <option value="6mo">6M</option>
            <option value="1y">1Y</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-6">
          <label className="text-gray-400">Intraday:</label>
          <button
            onClick={() => setIsIntraday(!isIntraday)}
            className={`px-4 py-1 rounded-full font-semibold transition ${
              isIntraday
                ? "bg-green-600 text-white"
                : "bg-slate-700 text-gray-300"
            }`}
          >
            {isIntraday ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {isIntraday && (
        <div className="mb-4 flex gap-4 items-center">
          <div>
            <label className="text-gray-400 mr-2">Interval:</label>
            <select
              value={intradayInterval}
              onChange={(e) => setIntradayInterval(e.target.value)}
              className="bg-slate-800 text-white px-2 py-1 rounded"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 mr-2">Chart:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="bg-slate-800 text-white px-2 py-1 rounded"
            >
              <option value="line">Line</option>
              <option value="candle">Candlestick</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6 items-start">
        <div className="col-span-3">
          <PriceChart data={history} type={chartType} />
        </div>

        {/* right panel */}
        <div className="bg-slate-900 shadow-lg rounded-xl p-6 border border-slate-800 space-y-6">
          {isIntraday ? (
            <>
              <div className="relative flex items-center border border-slate-600 rounded-2xl p-1 h-12 w-full bg-slate-900 overflow-hidden">
                {/* Sliding background */}
                <div
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-green-500 transition-transform duration-300 ease-in-out ${
                    viewMode === "active" ? "translate-x-0" : "translate-x-full"
                  }`}
                />

                {/* Buttons */}
                <button
                  onClick={() => setViewMode("active")}
                  className={`relative z-10 flex-1 text-sm font-semibold ${
                    viewMode === "active" ? "text-white" : "text-gray-300"
                  }`}
                >
                  Active
                </button>

                <button
                  onClick={() => setViewMode("new")}
                  className={`relative z-10 flex-1 text-sm font-semibold ${
                    viewMode === "new" ? "text-white" : "text-gray-300"
                  }`}
                >
                  New
                </button>
              </div>

              {/* trade details */}
              <div className="space-y-3 text-lg">
                <p className="text-gray-300">
                  Entry :{" "}
                  <span className="font-semibold text-white">
                    {tradeToShow.entry}
                  </span>
                </p>

                <p className="text-gray-300">
                  Target :{" "}
                  <span className="font-semibold text-green-400">
                    {tradeToShow.target}
                  </span>
                </p>

                <p className="text-gray-300">
                  Stop :{" "}
                  <span className="font-semibold text-red-500">
                    {tradeToShow.stop}
                  </span>
                </p>

                <p className="text-gray-300">
                  Confidence :{" "}
                  <span className="font-semibold">
                    {tradeToShow.confidence}%
                  </span>
                </p>
              </div>

              {/* action buttons */}
              <div className="flex gap-3">
                <div
                  className={`flex-1 text-center py-3 rounded-lg text-lg font-bold ${
                    tradeToShow.signal === "BUY" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {tradeToShow.signal}
                </div>

                {viewMode === "new" ? (
                  <button
                    onClick={() => {
                      setActiveTrade({
                        ...newTrade,
                        startTime: Date.now(),
                        status: "Active",
                      });
                      setViewMode("active");
                    }}
                    className="px-4 py-3 border border-slate-500 rounded-lg text-white"
                  >
                    Pin
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTrade(null)}
                    className="px-4 py-3 border border-slate-500 rounded-lg text-white"
                  >
                    🗑
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white">Prediction</h2>

              <p className="text-gray-400">
                Current Price:
                <span className="ml-2 text-white font-semibold">
                  ${prediction.current_price}
                </span>
              </p>

              <p className="text-gray-400">
                Predicted Price:
                <span className="ml-2 text-white font-semibold">
                  ${prediction.predicted_price}
                </span>
              </p>

              <p className="text-gray-400">
                Expected Change:
                <span
                  className={`ml-2 font-semibold ${
                    prediction.expected_change >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {prediction.expected_change >= 0 ? "+" : ""}
                  {prediction.expected_change}
                </span>
              </p>

              <div
                className={`w-full text-center py-3 rounded-lg text-lg font-bold ${
                  prediction.signal === "BUY" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {prediction.signal}
              </div>
            </>
          )}
        </div>
      </div>
      {tradeHistory.length >= 0 && (
        <div className="mt-8 bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h2 className="text-2xl text-white mb-4">History</h2>

          <div className="grid grid-cols-7 text-gray-400 border-b border-slate-700 pb-2 mb-2">
            <div>Trade</div>
            <div>Time</div>
            <div>Entry</div>
            <div>Target</div>
            <div>Stop</div>
            <div>Outcome</div>
            <div>Status</div>
          </div>

          {tradeHistory.map((trade, index) => (
            <div
              key={index}
              className="grid grid-cols-7 py-2 border-b border-slate-800 text-white"
            >
              <div>Trade {index + 1}</div>
              <div>{trade.timePeriod}</div>
              <div>{trade.entry}</div>
              <div className="text-green-400">{trade.target}</div>
              <div className="text-red-500">{trade.stop}</div>
              <div>{trade.outcome}</div>
              <div>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    trade.status === "Success"
                      ? "bg-green-500"
                      : trade.outcome === "Time Expiry"
                        ? "bg-yellow-400 text-black"
                        : "bg-red-500"
                  }`}
                >
                  {trade.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StockPage;
