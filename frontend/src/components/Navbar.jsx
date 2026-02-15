import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex gap-15 items-center">
      <Link to="/" className="text-2xl font-bold text-blue-500">
        <img src={logo} alt="StockAI Logo" className="h-12" />
      </Link>

      <div className="space-x-6">
        <Link to="/" className="text-gray-300 hover:text-blue-400 font-bold">
          Home
        </Link>
        <Link to="/" className="text-gray-300 hover:text-blue-400 font-bold">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
