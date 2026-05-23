import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/admin/users").then(res => setUsers(res.data));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 border-b pb-2">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {users.map(u => (
               <tr key={u.id}>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.id}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">$\${u.balance.toFixed(2)}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">{u.api_key}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
