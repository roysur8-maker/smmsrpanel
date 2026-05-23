import { useState, useEffect } from "react";
import axios from "axios";
import { Users, FileText, DollarSign } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({ usersCount: 0, ordersCount: 0, totalFunds: 0 });

  useEffect(() => {
    axios.get("/api/admin/stats").then(res => setStats(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
           <div className="p-4 rounded-full bg-blue-100 text-blue-600 mr-4">
             <Users className="w-8 h-8" />
           </div>
           <div>
             <p className="text-sm font-medium text-gray-500">Total Users</p>
             <p className="text-2xl font-bold text-gray-900">{stats.usersCount}</p>
           </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
           <div className="p-4 rounded-full bg-green-100 text-green-600 mr-4">
             <FileText className="w-8 h-8" />
           </div>
           <div>
             <p className="text-sm font-medium text-gray-500">Total Orders</p>
             <p className="text-2xl font-bold text-gray-900">{stats.ordersCount}</p>
           </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
           <div className="p-4 rounded-full bg-purple-100 text-purple-600 mr-4">
             <DollarSign className="w-8 h-8" />
           </div>
           <div>
             <p className="text-sm font-medium text-gray-500">Total Funds Added</p>
             <p className="text-2xl font-bold text-gray-900">$\${stats.totalFunds.toFixed(2)}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
