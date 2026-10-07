import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import OrdersPage from './components/OrdersPage';
import ProductsPage from './components/ProductsPage';
import AnalyticsPage from './components/AnalyticsPage';
import DeliveryPage from './components/DeliveryPage';
import PipelinePage from './components/PipelinePage';
import SettingsPage from './components/SettingsPage';

function App() {
  const [currentRoute, setCurrentRoute] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentRoute) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Orders':
        return <OrdersPage />;
      case 'Products':
        return <ProductsPage />;
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Delivery':
        return <DeliveryPage />;
      case 'Pipeline':
        return <PipelinePage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      <Sidebar 
        currentRoute={currentRoute} 
        setCurrentRoute={setCurrentRoute} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          currentRoute={currentRoute} 
          onNavigate={setCurrentRoute}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
