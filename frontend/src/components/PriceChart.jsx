import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function PriceChart({ data }) {
  console.log("Chart data:", data);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-500">No chart data available.</p>
      </div>
    );
  }

  const labels = data.map((item) => item.date);
  const prices = data.map((item) => Number(item.price));

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Price",
        data: prices,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: "#cbd5f5",
      },
    },
  },
  scales: {
    x: {
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


  return (
    <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 h-[400px]">

      <Line data={chartData} options={{ ...options, maintainAspectRatio: false }} />

    </div>
  );
}

export default PriceChart;
