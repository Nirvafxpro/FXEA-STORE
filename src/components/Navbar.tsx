import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const categories = [
    { name: 'All EAs', path: '/' },
    { name: 'Scalpers', path: '/?cat=Scalper' },
    { name: 'Trend Following', path: '/?cat=Trend+Following' },
    { name: 'Grid Systems', path: '/?cat=Grid' },
    { name: 'Breakout', path: '/?cat=Breakout' },
    { name: 'New Arrivals', path: '/?sort=new' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Announcement bar */}
      <div className="bg-rs-blue text-white text-xs text-center py-1.5 px-4 font-medium">
        🔔 Secure payments via M-Pesa • Airtel Money • Visa • Mastercard — Powered by Snippe
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="FX Robot Hub" className="h-10 w-auto" />
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Expert Advisors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-rs-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-rs-gray-800 placeholder-rs-gray-400 focus:outline-none focus:border-rs-blue focus:ring-1 focus:ring-rs-blue"
              />
              <button className="absolute right-0 top-0 h-full px-3 text-rs-gray-400 hover:text-rs-blue">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <Link to="/checkout" className="hidden sm:flex items-center gap-1.5 text-rs-gray-600 hover:text-rs-blue text-sm font-medium transition-colors">
              <User className="w-5 h-5" />
              <span className="hidden lg:inline">Account</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-rs-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Category nav - desktop */}
      <div className="hidden md:block border-t border-rs-gray-200 bg-rs-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-10 overflow-x-auto">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors rounded ${
                  location.pathname + location.search === cat.path
                    ? 'text-rs-blue bg-rs-blue-light'
                    : 'text-rs-gray-600 hover:text-rs-blue hover:bg-rs-blue-light'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-rs-gray-200 bg-white">
          <div className="p-4">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search Expert Advisors..."
                className="w-full border border-rs-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm text-rs-gray-800 placeholder-rs-gray-400 focus:outline-none focus:border-rs-blue"
              />
              <Search className="w-4 h-4 text-rs-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <nav className="space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-rs-gray-700 hover:bg-rs-gray-50 hover:text-rs-blue rounded"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
