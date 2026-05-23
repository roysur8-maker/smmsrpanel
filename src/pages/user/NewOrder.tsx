import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../lib/AuthContext";

export default function NewOrder() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    axios.get("/api/services").then(res => {
      setServices(res.data);
      const cats = [...new Set(res.data.map((s: any) => s.category))] as string[];
      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0]);
    });
  }, []);

  const filteredServices = services.filter(s => s.category === selectedCategory);
  
  // Update selected service when category changes
  useEffect(() => {
    if (filteredServices.length > 0 && !filteredServices.find(s => s.id.toString() === selectedService)) {
      setSelectedService(filteredServices[0].id.toString());
    }
  }, [selectedCategory, filteredServices]);

  const activeServiceInfo = services.find(s => s.id.toString() === selectedService);
  const charge = activeServiceInfo && quantity ? (activeServiceInfo.rate / 1000) * parseInt(quantity || "0") : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const res = await axios.post("/api/user/orders", {
        service_id: selectedService, link, quantity: parseInt(quantity)
      });
      setMessage("Order placed successfully! Order ID: " + res.data.order_id);
      refreshUser();
      setLink(""); setQuantity("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error placing order");
    }
  };

  return (
    <div className="max-w-2xl bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 border-b pb-2">New Order</h2>
      
      {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 border">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 border">
             {filteredServices.map(s => <option key={s.id} value={s.id}>{s.name} - $\${s.rate.toFixed(2)} per 1000</option>)}
          </select>
        </div>

        {activeServiceInfo && (
           <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
              Min: {activeServiceInfo.min} / Max: {activeServiceInfo.max}
           </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
          <input type="text" required value={link} onChange={e => setLink(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" placeholder="https://..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" />
        </div>

        <div className="pt-2 border-t flex justify-between items-center">
            <div className="text-lg">
                Charge: <span className="font-bold text-blue-600">$\${charge.toFixed(4)}</span>
            </div>
            <button type="submit" disabled={charge > (user?.balance || 0)} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Order
            </button>
        </div>
        {charge > (user?.balance || 0) && <p className="text-red-500 text-sm text-right mt-1">Insufficient balance</p>}
      </form>
    </div>
  );
}
