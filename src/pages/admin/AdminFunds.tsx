import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminFunds() {
  const [funds, setFunds] = useState<any[]>([]);

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = () => {
    axios.get("/api/admin/funds").then(res => setFunds(res.data));
  };

  const handleStatus = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await axios.post(`/api/admin/funds/${id}/status`, { status });
      fetchFunds();
    } catch (e) {
      alert("Error updating status");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 border-b pb-2">Fund Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {funds.map(f => (
               <tr key={f.id}>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(f.created_at).toLocaleString()}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.email}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">$\${f.amount.toFixed(2)}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{f.utr}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                       ${f.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                         f.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                         'bg-red-100 text-red-800'}`}>
                       {f.status}
                     </span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                   {f.status === 'pending' && (
                     <div className="flex space-x-2">
                       <button onClick={() => handleStatus(f.id, 'accepted')} className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded">Accept</button>
                       <button onClick={() => handleStatus(f.id, 'rejected')} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">Reject</button>
                     </div>
                   )}
                 </td>
               </tr>
             ))}
             {funds.length === 0 && <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No requests</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
