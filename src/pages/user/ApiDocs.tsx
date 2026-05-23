import { useAuth } from "../../lib/AuthContext";

export default function ApiDocs() {
  const { user } = useAuth();
  
  const baseUrl = window.location.origin + "/api/v1";

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6 border-b pb-2">API API Documentation</h2>
      
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
         <p className="text-sm font-bold text-gray-700">Your API Key:</p>
         <code className="text-sm text-blue-600 block mt-1 bg-white p-2 border rounded select-all">{user?.api_key}</code>
         <p className="text-xs text-gray-500 mt-2">Do not share your API key with anyone.</p>
      </div>

      <div className="space-y-8">
         <section>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-3">Service List</h3>
            <p className="text-sm text-gray-600 mb-2">Method: <span className="font-mono bg-gray-100 px-1">POST</span> | Endpoint: <span className="font-mono text-blue-600">{baseUrl}</span></p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
{`{
  "key": "YOUR_API_KEY",
  "action": "services"
}`}
            </div>
         </section>

         <section>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-3">Add Order</h3>
            <p className="text-sm text-gray-600 mb-2">Method: <span className="font-mono bg-gray-100 px-1">POST</span> | Endpoint: <span className="font-mono text-blue-600">{baseUrl}</span></p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
{`{
  "key": "YOUR_API_KEY",
  "action": "add",
  "service": 1,
  "link": "https://instagram.com/p/...",
  "quantity": 1000
}`}
            </div>
         </section>

         <section>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-3">Check Balance</h3>
             <p className="text-sm text-gray-600 mb-2">Method: <span className="font-mono bg-gray-100 px-1">POST</span> | Endpoint: <span className="font-mono text-blue-600">{baseUrl}</span></p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
{`{
  "key": "YOUR_API_KEY",
  "action": "balance"
}`}
            </div>
         </section>

         <section>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-3">Order Status</h3>
            <p className="text-sm text-gray-600 mb-2">Method: <span className="font-mono bg-gray-100 px-1">POST</span> | Endpoint: <span className="font-mono text-blue-600">{baseUrl}</span></p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
{`{
  "key": "YOUR_API_KEY",
  "action": "status",
  "order": 12345
}`}
            </div>
         </section>
      </div>
    </div>
  );
}
