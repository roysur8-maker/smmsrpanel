import { useState, useEffect } from "react";
import axios from "axios";

export default function AddFunds() {
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [funds, setFunds] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchHistory();
    axios.get("/api/settings").then(res => setSettings(res.data));
  }, []);

  const fetchHistory = () => {
    axios.get("/api/user/funds").then(res => setFunds(res.data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      await axios.post("/api/user/funds", { amount: parseFloat(amount), utr });
      setMessage("Fund request submitted! Waiting for admin approval.");
      setAmount(""); setUtr("");
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error submitting request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Add Funds Manually</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">Payment Instructions</h3>
          <p className="text-sm text-blue-700 whitespace-pre-wrap">
            {settings.payment_instructions || 'Please transfer the amount to the provided details and enter UTR to claim your funds.'}
          </p>
        </div>

        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid ($)</label>
            <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (UTR)</label>
            <input type="text" required value={utr} onChange={e => setUtr(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 w-full mt-2 font-medium shadow-sm">
            Submit Payment Request
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Fund Requests History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
               {funds.map(f => (
                 <tr key={f.id}>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(f.created_at).toLocaleString()}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$\${f.amount.toFixed(2)}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.utr}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                       ${f.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                         f.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                         'bg-red-100 text-red-800'}`}>
                       {f.status}
                     </span>
                   </td>
                 </tr>
               ))}
               {funds.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No requests yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
