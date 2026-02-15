import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PriceChart from "../components/PriceChart";

function StockPage() {
  const [chartRange, setChartRange] = useState("6mo");
const [predictionRange, setPredictionRange] = useState("6mo");

  const [error, setError] = useState("");
  const { symbol } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
  try {
    const predRes = await fetch(
      `http://localhost:8081/api/stocks/predict/${symbol}?period=${predictionRange}`
    );
    const predData = await predRes.json();

    if (predData.error) {
      throw new Error(predData.error);
    }

    setPrediction(predData);

    // Only fetch history if prediction succeeds
    const histRes = await fetch(
      `http://localhost:8081/api/stocks/history/${symbol}?period=${chartRange}`
    );
    const histData = await histRes.json();
    setHistory(histData);

  } catch (err) {
    console.error("Error:", err);
    setError("Unable to load stock data");
  } finally {
    setLoading(false);
  }
};


    fetchData();
}, [symbol, chartRange, predictionRange]);

  if (loading) {
    return <div className="p-10 text-xl">Loading...</div>;
  }
  if (error) {
  return <div className="p-10 text-red-500">{error}</div>;
}


  return (
  <div className="p-6 h-[calc(100vh-80px)] overflow-hidden">
    <h1 className="text-3xl font-bold mb-4 text-white">
      Stock: {prediction.symbol}
    </h1>
    <div className="flex gap-6 mb-4">
  <div>
    <label className="text-gray-400 mr-2">Chart:</label>
    <select
      value={chartRange}
      onChange={(e) => setChartRange(e.target.value)}
      className="bg-slate-800 text-white px-2 py-1 rounded"
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
    >
      <option value="1mo">1M</option>
      <option value="3mo">3M</option>
      <option value="6mo">6M</option>
      <option value="1y">1Y</option>
    </select>
  </div>
</div>

    <div className="grid grid-cols-4 gap-6 h-full">
      {/* Chart Section */}
      <div className="col-span-3 h-full">
        <PriceChart data={history} />
      </div>

      {/* Prediction Card */}
      <div className="bg-slate-900 shadow-lg rounded-xl p-6 border border-slate-800 self-start">
  <h2 className="text-xl font-semibold text-white mb-4">
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

  <div className="mt-6">
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

    </div>
  </div>
);


}

export default StockPage;
