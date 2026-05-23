import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminSettings() {
  const [settings, setSettings] = useState({ provider_url: "", provider_key: "", commission_percent: "10", payment_instructions: "" });
  const [message, setMessage] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    axios.get("/api/admin/settings").then(res => {
       setSettings({
         provider_url: res.data.provider_url || "",
         provider_key: res.data.provider_key || "",
         commission_percent: res.data.commission_percent || "10",
         payment_instructions: res.data.payment_instructions || "",
       });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/settings", settings);
      setMessage("Settings saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      alert("Error saving settings");
    }
  };

  const handleSync = async () => {
    setSyncMessage("Syncing...");
    try {
      const res = await axios.post("/api/admin/provider/sync");
      setSyncMessage(`Success: Sync complete. Imported ${res.data.count} services.`);
    } catch (e: any) {
      setSyncMessage("Error: " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Provider API Settings</h2>
        
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">{message}</div>}
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider API URL</label>
            <input type="url" value={settings.provider_url} onChange={e => setSettings({...settings, provider_url: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" placeholder="https://provider.com/api/v2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider API Key</label>
            <input type="password" value={settings.provider_key} onChange={e => setSettings({...settings, provider_key: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission % (Added to Provider Prices)</label>
            <input type="number" value={settings.commission_percent} onChange={e => setSettings({...settings, commission_percent: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Instructions (Text/URL for QR)</label>
            <textarea value={settings.payment_instructions} onChange={e => setSettings({...settings, payment_instructions: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" rows={3} placeholder="UPI ID / QR Code Link..."></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Save Settings
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
         <h2 className="text-xl font-semibold mb-4 border-b pb-2">Sync Services</h2>
         <p className="text-gray-600 text-sm mb-4">Fetch the latest services from the provider. Your commission percentage will be applied automatically.</p>
         
         <button onClick={handleSync} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
            Fetch & Sync Services
         </button>

         {syncMessage && <div className="mt-4 p-3 bg-gray-50 text-gray-800 rounded border text-sm font-mono">{syncMessage}</div>}
      </div>
    </div>
  );
}
