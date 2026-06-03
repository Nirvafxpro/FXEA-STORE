import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Check, Star, TrendingUp, Clock, Activity, ShieldCheck } from 'lucide-react';
import { getRobot } from '../store';
import { Robot } from '../types';

export default function RobotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [robot, setRobot] = useState<Robot | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (id) getRobot(id).then(found => { if (found) setRobot(found); });
  }, [id]);

  if (!robot) return <div className="min-h-screen bg-rs-gray-50 flex items-center justify-center"><div className="text-center"><p className="text-rs-gray-500 text-lg mb-4">Loading...</p><Link to="/" className="text-rs-blue hover:underline">Back to Shop</Link></div></div>;

  const stars = Math.round(robot.winRate / 20);
  return (
    <div className="min-h-screen bg-rs-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1 text-xs text-rs-gray-500 mb-6"><Link to="/" className="hover:text-rs-blue">Home</Link><ChevronRight className="w-3 h-3" /><span className="text-rs-gray-400">EAs</span><ChevronRight className="w-3 h-3" /><span className="text-rs-gray-800 font-medium">{robot.name}</span></nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white border border-rs-gray-200 rounded-lg overflow-hidden">
            {!imgError ? <img src={robot.image} alt={robot.name} className="w-full h-[400px] lg:h-[480px] object-cover" onError={() => setImgError(true)} /> : <div className="w-full h-[400px] lg:h-[480px] flex items-center justify-center bg-rs-gray-100"><span className="text-8xl">📊</span></div>}
          </div>
          <div>
            <p className="text-xs text-rs-gray-400 font-mono mb-1">SKU: {robot.id.toUpperCase()}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-rs-gray-900 mb-2">{robot.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= stars ? 'text-rs-orange fill-rs-orange' : 'text-rs-gray-300'}`} />)}</div>
              <span className="text-xs bg-rs-gray-100 text-rs-gray-600 px-2 py-0.5 rounded">{robot.category}</span>
              <span className="text-xs text-rs-gray-400">{robot.version}</span>
            </div>
            <p className="text-rs-gray-600 text-sm leading-relaxed mb-6">{robot.description}</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white border border-rs-gray-200 rounded-lg p-3 text-center"><TrendingUp className="w-4 h-4 text-rs-green mx-auto mb-1" /><p className="text-lg font-bold text-rs-green">{robot.winRate}%</p><p className="text-[10px] text-rs-gray-500">Win Rate</p></div>
              <div className="bg-white border border-rs-gray-200 rounded-lg p-3 text-center"><Activity className="w-4 h-4 text-rs-orange mx-auto mb-1" /><p className="text-lg font-bold text-rs-orange">{robot.drawdown}%</p><p className="text-[10px] text-rs-gray-500">Max Drawdown</p></div>
              <div className="bg-white border border-rs-gray-200 rounded-lg p-3 text-center"><Clock className="w-4 h-4 text-rs-blue mx-auto mb-1" /><p className="text-lg font-bold text-rs-blue">{robot.timeframe}</p><p className="text-[10px] text-rs-gray-500">Timeframe</p></div>
            </div>
            <div className="bg-rs-gray-100 rounded-lg p-3 mb-4"><p className="text-[10px] text-rs-gray-500 uppercase font-semibold mb-0.5">Strategy</p><p className="text-sm text-rs-gray-700">{robot.strategy}</p></div>
            <div className="mb-4"><p className="text-[10px] text-rs-gray-500 uppercase font-semibold mb-1.5">Supported Pairs</p><div className="flex flex-wrap gap-1.5">{robot.pairs.map(p => <span key={p} className="bg-white border border-rs-gray-200 text-rs-gray-700 text-xs font-mono px-2.5 py-1 rounded">{p}</span>)}</div></div>
            <div className="mb-4"><p className="text-[10px] text-rs-gray-500 uppercase font-semibold mb-1.5">Features</p><div className="grid grid-cols-1 gap-1">{robot.specs.map(s => <div key={s} className="flex items-center gap-1.5 text-rs-gray-600 text-xs"><Check className="w-3.5 h-3.5 text-rs-green flex-shrink-0" />{s}</div>)}</div></div>
            <div className="flex items-center gap-3 mb-6"><span className="flex items-center gap-1 text-xs text-rs-gray-500"><ShieldCheck className="w-3.5 h-3.5 text-rs-green" />MT4</span><span className="flex items-center gap-1 text-xs text-rs-gray-500"><ShieldCheck className="w-3.5 h-3.5 text-rs-green" />MT5</span></div>
            <div className="bg-white border border-rs-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3"><span className="text-3xl font-bold text-rs-gray-900">${robot.price}</span><span className="text-xs text-rs-gray-500">One-time • Lifetime license</span></div>
              {robot.in_stock ? <button onClick={() => { sessionStorage.setItem('checkout_robot_id', robot.id); navigate('/checkout'); }} className="w-full bg-rs-blue hover:bg-rs-blue-dark text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2 text-sm"><ShoppingCart className="w-4 h-4" />Buy Now</button>
               : <button disabled className="w-full bg-rs-gray-200 text-rs-gray-400 font-semibold py-3 rounded cursor-not-allowed text-sm">Unavailable</button>}
              <p className="text-[10px] text-rs-gray-400 text-center mt-2">Secure payment via Snippe — M-Pesa, Airtel Money, Visa, Mastercard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
