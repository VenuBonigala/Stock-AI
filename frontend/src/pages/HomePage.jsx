import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { stocks } from "../data/stocks";

function HomePage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleChange = (value) => {
    setQuery(value);

    if (value.length === 0) {
      setSuggestions([]);
      return;
    }

    const filtered = stocks.filter((stock) =>
      stock.name.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);
  };

  const selectStock = (symbol) => {
    setQuery("");
    setSuggestions([]);
    navigate(`/stock/${symbol}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <h1 className="text-5xl font-bold text-white mb-6">
        AI Stock Predictor
      </h1>

      <p className="text-gray-400 mb-8">
        Search by stock name
      </p>

      <div className="relative w-80">
        <input
          type="text"
          placeholder="Search stock..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg"
        />

        {suggestions.length > 0 && (
          <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-lg mt-2 max-h-60 overflow-y-auto">
            {suggestions.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => selectStock(stock.symbol)}
                className="px-4 py-2 cursor-pointer hover:bg-slate-800"
              >
                {stock.name} ({stock.symbol})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
