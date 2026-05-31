import { useState, useEffect } from 'react';
import { Package, RefreshCw, CheckCircle, XCircle, Send } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../store';
import { Order } from '../types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = () => { setLoading(true); getOrders().then(o => { setOrders([...o].reverse()); setLoading(false); }).catch(() => setLoading(false)); };

  const handleStatus = (id: string, status: string) => { updateOrderStatus(id, status).then(loadOrders); };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts: Record<string, number> = { all: orders.length, pending: orders.filter(o => o.status === 'pending').length, paid: orders.filter(o => o.status === 'paid').length, completed: orders.filter(o => o.status === 'completed').length, failed: orders.filter(o => o.status === 'failed').length };

  if (loading) return <div className="text-gray-400 text-center py-20">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-rs-blue" />Orders ({orders.length})</h2><button onClick={loadOrders} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm"><RefreshCw className="w-4 h-4" />Refresh</button></div>
      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 flex items-center gap-2"><Send className="w-4 h-4 text-green-400 flex-shrink-0" /><p className="text-green-300 text-xs">Orders auto-approved via Snippe webhooks. Manual approval also available.</p></div>
      <div className="flex flex-wrap gap-2">{Object.entries(counts).map(([k, c]) => <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter===k?'bg-rs-blue/10 text-rs-blue border border-rs-blue/30':'text-gray-400 bg-gray-900 border border-gray-800 hover:text-white'}`}>{k} ({c})</button>)}</div>
      {filtered.length === 0 ? <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-12 text-center"><Package className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500">No orders found</p></div> : (
        <div className="space-y-3">{filtered.map(o => (
          <div key={o.id} className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 hover:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-xs font-mono text-rs-blue bg-rs-blue/10 px-2 py-0.5 rounded">{o.id.substring(0,20)}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status==='paid'||o.status==='completed'?'bg-green-500/10 text-green-400 border border-green-500/30':o.status==='pending'?'bg-amber-500/10 text-amber-400 border border-amber-500/30':'bg-red-500/10 text-red-400 border border-red-500/30'}`}>{o.status}</span>
                </div>
                <h3 className="text-white font-medium">{o.product_name || o.robotName}</h3>
                <p className="text-gray-500 text-sm mt-1">{o.customer_name || o.customerName} • {o.customer_phone || o.customerPhone}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xl font-bold text-rs-blue">${o.amount}</span>
                <div className="flex gap-2">
                  {o.status === 'pending' && <><button onClick={() => handleStatus(o.id, 'paid')} className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Mark Paid</button><button onClick={() => handleStatus(o.id, 'failed')} className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 flex items-center gap-1"><XCircle className="w-3 h-3" />Failed</button></>}
                  {o.status === 'paid' && <button onClick={() => handleStatus(o.id, 'completed')} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Complete</button>}
                </div>
              </div>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
