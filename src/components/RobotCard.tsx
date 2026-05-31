import { Star, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Robot } from '../types';

interface Props { robot: Robot; }

export default function RobotCard({ robot }: Props) {
  const stars = Math.round(robot.win_rate / 20);
  return (
    <div className="group bg-white border border-rs-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3] bg-rs-gray-100">
        <img src={robot.image} alt={robot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#f3f4f6"><rect width="400" height="300"/><text x="200" y="150" fill="#1a56db" font-size="48" text-anchor="middle" dominant-baseline="middle">📊</text></svg>'); }} />
        {robot.featured && <span className="absolute top-2 left-2 bg-rs-orange text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Best Seller</span>}
        <span className="absolute top-2 right-2 bg-white/90 text-rs-gray-600 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm">{robot.category}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-rs-gray-400 font-mono mb-1">SKU: {robot.id.toUpperCase()}</p>
        <Link to={`/ea/${robot.id}`} className="text-sm font-semibold text-rs-gray-800 hover:text-rs-blue transition-colors line-clamp-2 mb-1.5 leading-snug">{robot.name}</Link>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">{[1,2,3,4,5].map(s=><Star key={s} className={`w-3 h-3 ${s<=stars?'text-rs-orange fill-rs-orange':'text-rs-gray-300'}`} />)}</div>
          <span className="text-[10px] text-rs-gray-400">({Math.floor(Math.random()*80)+12})</span>
        </div>
        <div className="flex items-center gap-3 mb-3 text-[10px] text-rs-gray-500">
          <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3 text-rs-green" />{robot.win_rate}%</span>
          <span className="flex items-center gap-0.5"><BarChart3 className="w-3 h-3 text-rs-orange" />{robot.drawdown}% DD</span>
          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-rs-blue" />{robot.timeframe}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {robot.pairs.slice(0,3).map(p=><span key={p} className="bg-rs-gray-100 text-rs-gray-600 text-[10px] font-mono px-1.5 py-0.5 rounded">{p}</span>)}
          {robot.pairs.length>3&&<span className="text-rs-gray-400 text-[10px] px-1">+{robot.pairs.length-3}</span>}
        </div>
        <div className="mt-auto pt-3 border-t border-rs-gray-100 flex items-center justify-between">
          <span className="text-lg font-bold text-rs-gray-900">${robot.price}</span>
          {robot.in_stock ? <Link to={`/ea/${robot.id}`} className="bg-rs-blue hover:bg-rs-blue-dark text-white text-xs font-semibold px-4 py-2 rounded transition-colors">View Details</Link>
           : <span className="text-rs-gray-400 text-xs font-medium">Out of Stock</span>}
        </div>
      </div>
    </div>
  );
}
