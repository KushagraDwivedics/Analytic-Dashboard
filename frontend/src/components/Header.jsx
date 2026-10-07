import React from 'react';

const subtitles = {
  Dashboard: 'Monitor revenue, orders, categories and delivery performance.',
  Orders: 'View and manage all customer orders.',
  Products: 'Browse and manage the product catalog.',
  Analytics: 'Deep-dive into business performance metrics.',
  Delivery: 'Monitor shipment and delivery performance.',
  Pipeline: 'Ingest multi-format data (JSON, CSV, XML) and run transformation pipeline.',
  Settings: 'Manage your application preferences and data source.',
};

const Header = ({ currentRoute }) => {
  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between flex-shrink-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-primary tracking-tight">{currentRoute}</h2>
        <p className="text-xs text-secondary hidden sm:block">
          {subtitles[currentRoute] || 'Overview and key metrics.'}
        </p>
      </div>
    </header>
  );
};

export default Header;
