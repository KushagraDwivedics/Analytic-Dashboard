import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, BarChart2, Truck, Layers, Settings } from 'lucide-react';

const Sidebar = ({ currentRoute, setCurrentRoute }) => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', icon: <ShoppingCart size={20} /> },
    { name: 'Products', icon: <Package size={20} /> },
    { name: 'Analytics', icon: <BarChart2 size={20} /> },
    { name: 'Delivery', icon: <Truck size={20} /> },
    { name: 'Pipeline', icon: <Layers size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border h-full">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary tracking-tight">Analytics Pro</h1>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentRoute(item.name)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              currentRoute === item.name
                ? 'bg-accent/10 text-accent'
                : 'text-secondary hover:bg-slate-50 hover:text-primary'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
