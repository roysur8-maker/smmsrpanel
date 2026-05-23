import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LogOut, Home, FileText, CreditCard, Code } from "lucide-react";
import NewOrder from "./user/NewOrder";
import Orders from "./user/Orders";
import AddFunds from "./user/AddFunds";
import ApiDocs from "./user/ApiDocs";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">SMM Panel</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
            Balance: <span className="font-bold text-lg">$\${(user?.balance || 0).toFixed(2)}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center space-x-2 p-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium">
            <Home className="w-5 h-5" /> <span>New Order</span>
          </Link>
          <Link to="/dashboard/orders" className="flex items-center space-x-2 p-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium">
             <FileText className="w-5 h-5" /> <span>Orders History</span>
          </Link>
          <Link to="/dashboard/funds" className="flex items-center space-x-2 p-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium">
             <CreditCard className="w-5 h-5" /> <span>Add Funds</span>
          </Link>
          <Link to="/dashboard/api" className="flex items-center space-x-2 p-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium">
             <Code className="w-5 h-5" /> <span>API Integration</span>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center space-x-2 p-2 w-full text-red-600 hover:bg-red-50 rounded-md">
            <LogOut className="w-5 h-5" /> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<NewOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/funds" element={<AddFunds />} />
          <Route path="/api" element={<ApiDocs />} />
        </Routes>
      </div>
    </div>
  );
}
