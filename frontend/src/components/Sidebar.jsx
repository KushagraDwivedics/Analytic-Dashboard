import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, BarChart2, Truck, Layers, Settings, X, Activity } from 'lucide-react';

const Sidebar = ({ currentRoute, setCurrentRoute, mobileMenuOpen, setMobileMenuOpen }) => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', icon: <ShoppingCart size={20} /> },
    { name: 'Products', icon: <Package size={20} /> },
    { name: 'Analytics', icon: <BarChart2 size={20} /> },
    { name: 'Delivery', icon: <Truck size={20} /> },
    { name: 'Pipeline', icon: <Layers size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleSelectRoute = (name) => {
    setCurrentRoute(name);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const navContent = (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold">
            <Activity size={18} />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">Analytics Pro</h1>
        </div>
        {/* Mobile close button */}
        {setMobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <button
              key={item.name}
              onClick={() => handleSelectRoute(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-secondary hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <span className={isActive ? 'text-accent' : 'text-secondary'}>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-[11px] text-secondary text-center">
          Order Pipeline & Analytics v1.0
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border h-full shrink-0">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-surface h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

