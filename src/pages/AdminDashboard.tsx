import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Package, Settings, LogOut, TrendingUp, Shield, ExternalLink, ChevronLeft, Menu, X } from 'lucide-react';
import { isAdminLoggedIn, adminLogin, adminLogout } from '../store';

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await adminLogin(password);
    if (ok) onLogin();
    else setError('Invalid password. Hint: admin123');
  };
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8"><div className="w-16 h-16 bg-rs-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-rs-blue" /></div><h1 className="text-2xl font-bold text-white">FXEA Admin</h1><p className="text-gray-400 text-sm mt-2">Restricted access.</p></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Enter password" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rs-blue" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-rs-blue hover:bg-rs-blue-dark text-white font-semibold py-3 rounded-lg transition-colors">Login</button>
        </form>
        <p className="text-gray-600 text-xs text-center mt-6"><Link to="/" className="text-gray-500 hover:text-gray-300 flex items-center gap-1 justify-center"><ChevronLeft className="w-3 h-3" /> Back to Store</Link></p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { isAdminLoggedIn().then(ok => { setLoggedIn(ok); setChecking(false); }); }, []);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogin = () => { setLoggedIn(true); navigate('/admin'); };
  const handleLogout = () => { adminLogout(); setLoggedIn(false); };

  if (checking) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Checking auth...</div>;
  if (!loggedIn) return <AdminLogin onLogin={handleLogin} />;

  const tabs = [
    { to:'/admin', icon:LayoutDashboard, label:'Dashboard', exact:true },
    { to:'/admin/upload', icon:PlusCircle, label:'Add EA' },
    { to:'/admin/orders', icon:Package, label:'Orders' },
    { to:'/admin/settings', icon:Settings, label:'Settings' },
  ];
  const isActive = (t: typeof tabs[0]) => t.exact ? location.pathname === '/admin' : location.pathname.startsWith(t.to);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-gray-900 border-b border-gray-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-8 h-8 bg-rs-blue rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white" /></div><span className="text-white font-bold text-sm">FXEA Admin</span></div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900/95 backdrop-blur border-r border-gray-800 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-800"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-rs-blue rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-white" /></div><div><h1 className="text-lg font-bold text-white">FXEA Admin</h1><p className="text-gray-500 text-xs">Management Panel</p></div></div></div>
        <nav className="flex-1 p-3 space-y-1">{tabs.map(t => <Link key={t.to} to={t.to} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(t) ? 'bg-rs-blue/10 text-rs-blue border border-rs-blue/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}><t.icon className="w-4 h-4" />{t.label}</Link>)}</nav>
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800/50"><ExternalLink className="w-4 h-4" />View Store</Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 text-left"><LogOut className="w-4 h-4" />Logout</button>
        </div>
      </aside>
      <main className="lg:ml-64 pt-14 lg:pt-0"><div className="max-w-5xl mx-auto px-4 sm:px-6 py-8"><Outlet /></div></main>
    </div>
  );
}
