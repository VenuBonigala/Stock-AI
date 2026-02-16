import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PriceChart from "../components/PriceChart";

function StockPage() {
  
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

  useEffect(() => {
  let intervalId;

  const fetchData = async () => {
    try {
      if (isIntraday) {
        const res = await fetch(
          `http://localhost:8081/api/stocks/intraday/${symbol}`
        );
        const data = await res.json();

        if (!data || data.error || data.price === undefined) {
          throw new Error("Invalid intraday data");
        }

        setPrediction(data);

        const histRes = await fetch(
          `http://localhost:8081/api/stocks/history/${symbol}?period=1d&interval=${intradayInterval}`
        );
        const histData = await histRes.json();
        setHistory(histData);

      } else {
        const predRes = await fetch(
          `http://localhost:8081/api/stocks/predict/${symbol}?period=${predictionRange}`
        );
        const predData = await predRes.json();

        if (
          !predData ||
          predData.current_price === undefined ||
          predData.predicted_price === undefined
        ) {
          throw new Error("Invalid prediction data");
        }

        setPrediction(predData);

        const histRes = await fetch(
          `http://localhost:8081/api/stocks/history/${symbol}?period=${chartRange}&interval=1d`
        );
        const histData = await histRes.json();
        setHistory(histData);
      }

      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Unable to load stock data");
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  // auto-refresh every 10 seconds in intraday mode
  if (isIntraday) {
    intervalId = setInterval(fetchData, 1000);
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [symbol, chartRange, predictionRange, isIntraday, intradayInterval]);


  if (loading) {
    return <div className="p-10 text-xl">Loading...</div>;
  }
  if (error) {
    return <div className="p-10 text-red-500">{error}</div>;
  }

  let adjustedConfidence = prediction?.confidence || 0;

  if (isIntraday && prediction) {
    const riskFactor = targetProfit * 5;
    adjustedConfidence = Math.max(
      10,
      Math.min(95, prediction.confidence - riskFactor)
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">
        Stock: {prediction.symbol}
        <span className="ml-4 text-sm px-3 py-1 rounded bg-slate-800 text-gray-300">
          {isIntraday ? "Intraday Mode" : "Long-term Mode"}
        </span>
      </h1>

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
        <div className="mb-4">
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
      )}

      <div className="grid grid-cols-4 gap-6 items-start">
        <div className="col-span-3 h-full">
          <PriceChart data={history} />
        </div>

        {isIntraday ? (
  <div className="bg-slate-900 shadow-lg rounded-xl p-6 border border-slate-800 self-start space-y-6">
    <h2 className="text-xl font-semibold text-white">
      Intraday Signal
    </h2>

    <div className="space-y-3">
      <p className="text-gray-400">
        Current Price:
        <span className="font-semibold ml-2 text-white">
          ${prediction.price}
        </span>
      </p>

      <p className="text-gray-400">
        Day High:
        <span className="font-semibold ml-2 text-green-400">
          ${prediction.day_high}
        </span>
      </p>

      <p className="text-gray-400">
        Day Low:
        <span className="font-semibold ml-2 text-red-400">
          ${prediction.day_low}
        </span>
      </p>
    </div>

    {/* Confidence Meter */}
    <div>
      <p className="text-gray-400 mb-2">
        Confidence:
        <span className="ml-2 text-blue-400 font-semibold">
          {adjustedConfidence}%
        </span>
      </p>

      <div className="w-full bg-slate-700 rounded-full h-3">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all"
          style={{ width: `${adjustedConfidence}%` }}
        />
      </div>
    </div>

    {/* Inputs */}
    <div className="space-y-4">
      <div>
        <label className="text-gray-400 text-sm">
          Target Profit (%)
        </label>
        <input
          type="number"
          value={targetProfit}
          onChange={(e) => setTargetProfit(Number(e.target.value))}
          className="w-full mt-1 px-3 py-2 bg-slate-800 text-white rounded border border-slate-700"
        />
      </div>
    </div>

    {/* Signal Button */}
    <div>
      <div
        className={`w-full text-center py-3 rounded-lg text-lg font-bold ${
          prediction.signal === "BUY"
            ? "bg-green-600"
            : "bg-red-600"
        }`}
      >
        {prediction.signal}
      </div>
    </div>
  </div>
) : (
  <div className="bg-slate-900 shadow-lg rounded-xl p-6 border border-slate-800 self-start space-y-6">
    <h2 className="text-xl font-semibold text-white">
      Prediction
    </h2>

    <div className="space-y-3">
      <p className="text-gray-400">
        Current Price:
        <span className="font-semibold ml-2 text-white">
          ${prediction.current_price}
        </span>
      </p>

      <p className="text-gray-400">
        Predicted Price:
        <span className="font-semibold ml-2 text-white">
          ${prediction.predicted_price}
        </span>
      </p>

      <p className="text-gray-400">
        Expected Change:
        <span
          className={`font-semibold ml-2 ${
            prediction.expected_change >= 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {prediction.expected_change >= 0 ? "+" : ""}
          {prediction.expected_change}
        </span>
      </p>
    </div>

    {/* BUY / SELL button */}
    <div>
      <div
        className={`w-full text-center py-3 rounded-lg text-lg font-bold ${
          prediction.signal === "BUY"
            ? "bg-green-600"
            : "bg-red-600"
        }`}
      >
        {prediction.signal}
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}

export default StockPage;
