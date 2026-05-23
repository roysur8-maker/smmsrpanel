import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LogOut, Users, Settings, CreditCard, LayoutDashboard } from "lucide-react";
import AdminOverview from "./admin/AdminOverview";
import AdminUsers from "./admin/AdminUsers";
import AdminFunds from "./admin/AdminFunds";
import AdminSettings from "./admin/AdminSettings";

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex pb-4">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white shadow-xl flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center space-x-2 p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" /> <span>Overview</span>
          </Link>
          <Link to="/admin/users" className="flex items-center space-x-2 p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md font-medium transition-colors">
             <Users className="w-5 h-5" /> <span>Users</span>
          </Link>
          <Link to="/admin/funds" className="flex items-center space-x-2 p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md font-medium transition-colors">
             <CreditCard className="w-5 h-5" /> <span>Fund Requests</span>
          </Link>
          <Link to="/admin/settings" className="flex items-center space-x-2 p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md font-medium transition-colors">
             <Settings className="w-5 h-5" /> <span>Settings & API</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center space-x-2 p-2 w-full text-red-400 hover:bg-gray-800 rounded-md transition-colors">
            <LogOut className="w-5 h-5" /> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/funds" element={<AdminFunds />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
}
