import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

import { Line, Chart } from "react-chartjs-2";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";

import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
  CandlestickController,
  CandlestickElement,
);

function PriceChart({ data, type = "line" }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
        <p className="text-gray-500">No chart data available.</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#cbd5f5",
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        ticks: {
          color: "#94a3b8",
        },
        grid: {
          color: "#1e293b",
        },
      },
      y: {
        ticks: {
          color: "#94a3b8",
        },
        grid: {
          color: "#1e293b",
        },
      },
    },
  };


  // LINE CHART (existing behavior)
  if (type === "line") {
    const labels = data.map((item) => item.date);
    const prices = data.map((item) => Number(item.price));

    const chartData = {
      labels,
      datasets: [
        {
          label: "Price",
          data: prices,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.1)",
          tension: 0.3,
          fill: true,
          pointRadius: 0,
        },
      ],
    };

    return (
      <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    );
  }

  // CANDLESTICK CHART
  const candleData = {
    datasets: [
      {
        label: "Candlestick",
        data: data.map((d, i) => ({
          x: i,
          o: d.open,
          h: d.high,
          l: d.low,
          c: d.close,
        })),
      },
    ],
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 h-[400px]">
      <Chart type="candlestick" data={candleData} options={options} />
    </div>
  );

}

export default PriceChart;
