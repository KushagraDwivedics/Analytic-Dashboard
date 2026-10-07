import React from 'react';
import { Menu, Activity } from 'lucide-react';

const subtitles = {
  Dashboard: 'Monitor revenue, orders, categories and delivery performance.',
  Orders: 'View and manage all customer orders.',
  Products: 'Browse and manage the product catalog.',
  Analytics: 'Deep-dive into business performance metrics.',
  Delivery: 'Monitor shipment and delivery performance.',
  Pipeline: 'Ingest multi-format data (JSON, CSV, XML) and run transformation pipeline.',
  Settings: 'Manage your application preferences and data source.',
};

const Header = ({ currentRoute, setMobileMenuOpen }) => {
  return (
    <header className="h-16 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu hamburger button */}
        <button
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
          className="md:hidden p-2 text-secondary hover:text-primary rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Mobile brand indicator */}
        <div className="flex md:hidden items-center gap-1.5 text-accent font-bold text-sm mr-2 border-r border-border pr-3">
          <Activity size={18} />
          <span>Analytics</span>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">{currentRoute}</h2>
          <p className="text-xs text-secondary hidden lg:block truncate max-w-xl">
            {subtitles[currentRoute] || 'Overview and key metrics.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Ready
        </span>
      </div>
    </header>
  );
};

export default Header;
