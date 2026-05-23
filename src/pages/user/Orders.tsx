import { useState, useEffect } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/user/orders").then(res => setOrders(res.data));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 border-b pb-2">Order History</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {orders.map(o => (
               <tr key={o.id}>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.id}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 truncate max-w-xs "><a href={o.link} target="_blank" rel="noreferrer">{o.link}</a></td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$\${o.charge.toFixed(4)}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                     ${o.status === 'completed' ? 'bg-green-100 text-green-800' : 
                       o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-blue-100 text-blue-800'}`}>
                     {o.status}
                   </span>
                 </td>
               </tr>
             ))}
             {orders.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No orders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
