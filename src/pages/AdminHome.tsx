import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, ShoppingBag, DollarSign, BarChart3, FileCheck, FileX } from 'lucide-react';
import { getRobots, getOrders, formatPrice, getEAFile } from '../store';

export default function AdminHome() {
  const [robots, setRobots] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRobots(), getOrders()]).then(([r, o]) => {
      setRobots(r); setOrders(o); setLoading(false);
      // Check file status for each robot
      r.forEach((robot: any) => {
        getEAFile(robot.id).then((info: any) => setFileStatuses(prev => ({ ...prev, [robot.id]: info }))).catch(() => {});
      });
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-20">Loading data from server...</div>;

  const totalRevenue = orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + o.amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const stats = [
    { label: 'Total EAs', value: robots.length, icon: TrendingUp, color: 'text-rs-blue', bg: 'bg-rs-blue/10' },
    { label: 'Orders', value: orders.length, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-rs-green', bg: 'bg-rs-green/10' },
    { label: 'Pending', value: pendingOrders, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(s => <div key={s.label} className="bg-gray-900/80 border border-gray-800 rounded-xl p-5"><div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div><p className="text-gray-400 text-sm">{s.label}</p><p className="text-white text-2xl font-bold mt-1">{s.value}</p></div>)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/upload" className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 hover:border-rs-blue/50 transition-colors group"><h3 className="text-white font-semibold mb-2 group-hover:text-rs-blue">Upload New EA</h3><p className="text-gray-500 text-sm">Upload .ex5/.ex4 file</p></Link>
        <Link to="/admin/orders" className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 hover:border-rs-blue/50 transition-colors group"><h3 className="text-white font-semibold mb-2 group-hover:text-rs-blue">Manage Orders</h3><p className="text-gray-500 text-sm">{pendingOrders > 0 ? `${pendingOrders} pending` : 'No pending orders'}</p></Link>
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-rs-blue" /> Recent Orders</h2>
        {orders.length === 0 ? <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-8 text-center"><p className="text-gray-500">No orders yet.</p></div> : (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-800"><th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Order</th><th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Customer</th><th className="text-left text-gray-400 text-xs font-medium px-4 py-3">EA</th><th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Amount</th><th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Status</th></tr></thead>
          <tbody>{[...orders].reverse().slice(0,5).map((o: any) => <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30"><td className="px-4 py-3 text-sm font-mono text-rs-blue">{o.id.substring(0,12)}...</td><td className="px-4 py-3 text-sm text-white">{o.customer_name}</td><td className="px-4 py-3 text-sm text-gray-300">{o.product_name}</td><td className="px-4 py-3 text-sm text-white">${o.amount}</td><td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status==='paid'||o.status==='completed'?'bg-green-500/10 text-green-400 border border-green-500/30':o.status==='pending'?'bg-amber-500/10 text-amber-400 border border-amber-500/30':'bg-gray-500/10 text-gray-400 border border-gray-500/30'}`}>{o.status}</span></td></tr>)}</tbody></table></div></div>
        )}
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-rs-blue" /> EA Inventory</h2>
        <div className="space-y-3">{robots.map((ea: any) => {
          const fileInfo = fileStatuses[ea.id];
          return <div key={ea.id} className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <img src={ea.image} alt={ea.name} className="w-14 h-14 rounded-lg object-cover" onError={e => {(e.target as HTMLImageElement).src = 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="#111827"><rect width="56" height="56"/><text x="28" y="28" fill="#1a56db" font-size="20" text-anchor="middle" dominant-baseline="middle">📊</text></svg>')}} />
            <div className="flex-1 min-w-0"><h3 className="text-white font-medium text-sm">{ea.name} <span className="text-gray-600 text-xs">{ea.version}</span></h3><div className="flex items-center gap-3 mt-1 text-xs"><span className="text-rs-blue font-semibold">${ea.price}</span><span className={ea.in_stock ? 'text-green-400' : 'text-red-400'}>{ea.in_stock ? '● Active' : '● Inactive'}</span></div></div>
            <div className="flex items-center gap-3">
              {fileInfo?.hasFile ? <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20"><FileCheck className="w-3 h-3" />{fileInfo.fileName}</span>
               : <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"><FileX className="w-3 h-3" />No file</span>}
              <Link to={`/admin/upload?id=${ea.id}`} className="text-rs-blue hover:text-rs-blue-dark text-xs font-medium">Edit</Link>
            </div>
          </div>;
        })}</div>
      </div>
    </div>
  );
}
