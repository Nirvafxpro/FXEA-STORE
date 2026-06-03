import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3, Shield, Truck, Star, ChevronRight } from 'lucide-react';
import { getRobots } from '../store';
import { Robot } from '../types';
import RobotCard from '../components/RobotCard';

export default function Home() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getRobots().then(r => { setRobots(r); setLoading(false); }).catch(() => setLoading(false));
    const catParam = searchParams.get('cat');
    if (catParam) setCategory(catParam);
  }, [searchParams]);

  const categories = ['all', ...new Set(robots.map((r) => r.category))];
  const filtered = robots.filter((r) => {
    const ms = r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return (category === 'all' || r.category === category) && ms;
  });
  const featured = robots.filter((r) => r.featured && r.in_stock);

  if (loading) return <div className="min-h-screen bg-rs-gray-50 flex items-center justify-center"><div className="text-rs-gray-400">Loading products...</div></div>;

  return (
    <div className="min-h-screen bg-rs-gray-50">
      <section className="relative bg-rs-gray-900 overflow-hidden">
        <div className="absolute inset-0"><img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-40" /><div className="absolute inset-0 bg-gradient-to-r from-rs-gray-900/95 via-rs-gray-900/80 to-rs-gray-900/60" /></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">Premium Forex<br /><span className="text-rs-blue">Expert Advisors</span></h1>
            <p className="text-rs-gray-300 text-base sm:text-lg mb-8 max-w-lg">Automate your forex trading with battle-tested EAs. Verified performance, instant download, and secure payments.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/#products" className="bg-rs-blue hover:bg-rs-blue-dark text-white font-semibold px-6 py-3 rounded transition-colors text-sm">Browse All EAs</Link>
              <Link to="/#featured" className="border border-white/30 hover:border-white text-white font-medium px-6 py-3 rounded transition-colors text-sm">Featured Picks</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white border-b border-rs-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[{ i: BarChart3, l: 'Backtested EAs', v: '10+ Years Data' },{ i: Shield, l: 'Secure Payment', v: 'M-Pesa & Card' },{ i: Truck, l: 'Instant Delivery', v: 'Download Immediately' },{ i: Star, l: 'Traded by', v: '500+ Traders' }].map((f) => (
              <div key={f.l} className="flex items-center justify-center gap-2"><f.i className="w-5 h-5 text-rs-blue flex-shrink-0" /><div className="text-left"><p className="text-xs font-semibold text-rs-gray-800">{f.l}</p><p className="text-[10px] text-rs-gray-500">{f.v}</p></div></div>
            ))}
          </div>
        </div>
      </section>
      {featured.length > 0 && (
        <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-rs-gray-900">Featured Expert Advisors</h2><p className="text-rs-gray-500 text-sm">Our most popular and highest-rated trading robots</p></div><Link to="/#products" className="text-rs-blue hover:text-rs-blue-dark text-sm font-medium flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{featured.map((r) => <RobotCard key={r.id} robot={r} />)}</div>
        </section>
      )}
      <section id="products" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div><h2 className="text-xl font-bold text-rs-gray-900">All Expert Advisors</h2><p className="text-rs-gray-500 text-sm">{filtered.length} products</p></div>
            <div className="flex gap-3">
              <div className="relative"><Search className="w-4 h-4 text-rs-gray-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border border-rs-gray-300 rounded pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-rs-blue w-full sm:w-56" /></div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-rs-gray-300 rounded px-3 py-2 text-sm text-rs-gray-700 focus:outline-none focus:border-rs-blue">{categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Strategies' : c}</option>)}</select>
            </div>
          </div>
          {filtered.length === 0 ? <div className="text-center py-16"><BarChart3 className="w-12 h-12 text-rs-gray-300 mx-auto mb-3" /><p className="text-rs-gray-500">No Expert Advisors found.</p></div>
           : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{filtered.map((r) => <RobotCard key={r.id} robot={r} />)}</div>}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"><div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-amber-700 text-xs text-center"><strong>Risk Disclaimer:</strong> Forex trading carries a high level of risk. Past performance is not indicative of future results.</p></div></section>
      <footer className="bg-rs-gray-900 text-rs-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-4"><img src="/logo.png" alt="FX Robot Hub" className="h-8 w-auto" /></div><p className="text-sm leading-relaxed">Premium forex Expert Advisors with verified performance.</p></div>
            <div><h4 className="text-white font-semibold text-sm mb-3">Shop</h4><ul className="space-y-2 text-sm"><li><Link to="/" className="hover:text-white">All EAs</Link></li><li><Link to="/?cat=Scalper" className="hover:text-white">Scalpers</Link></li><li><Link to="/?cat=Trend+Following" className="hover:text-white">Trend Following</Link></li></ul></div>
            <div><h4 className="text-white font-semibold text-sm mb-3">Payments</h4><p className="text-sm mb-2">Powered by <a href="https://snippe.sh" target="_blank" className="text-rs-blue hover:text-blue-400">Snippe</a></p><p className="text-xs text-rs-gray-500">M-Pesa • Airtel Money • Visa • Mastercard</p></div>
            <div><h4 className="text-white font-semibold text-sm mb-3">Support</h4><ul className="space-y-2 text-sm"><li className="hover:text-white cursor-pointer">FAQ</li><li className="hover:text-white cursor-pointer">Installation Guide</li></ul></div>
          </div>
          <div className="border-t border-rs-gray-800 pt-6 text-center text-xs text-rs-gray-500">© 2025 FX Robot Hub. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
