import React, { useState, useEffect, useCallback } from 'react';
import FilterBar from './FilterBar';
import KpiCards from './KpiCards';
import { RevenueChart, CategoryChart, DeliveryChart } from './Charts';
import OrdersTable from './OrdersTable';
import { CategoryDrawer, OrderDrawer } from './Drawers';
import { getSummary, getRevenue, getCategories, getDelivery, getOrders } from '../services/api';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    deliveryStatus: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({});

  const [loading, setLoading] = useState({
    summary: true,
    revenue: true,
    categories: true,
    delivery: true,
    orders: true
  });

  const [error, setError] = useState(null);

  const [data, setData] = useState({
    summary: null,
    revenue: null,
    categories: null,
    delivery: null,
    orders: null
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = useCallback(async (currentFilters) => {
    setLoading({
      summary: true,
      revenue: true,
      categories: true,
      delivery: true,
      orders: true
    });
    setError(null);

    try {
      const [summary, revenue, categories, delivery, orders] = await Promise.all([
        getSummary(currentFilters),
        getRevenue(currentFilters),
        getCategories(currentFilters),
        getDelivery(currentFilters),
        getOrders(currentFilters)
      ]);

      setData({
        summary,
        revenue,
        categories,
        delivery,
        orders
      });
    } catch (err) {
      console.error(err);
      setError('Unable to load analytics. Please try again.');
    } finally {
      setLoading({
        summary: false,
        revenue: false,
        categories: false,
        delivery: false,
        orders: false
      });
    }
  }, []);

  useEffect(() => {
    fetchData(appliedFilters);

    const onDataUpdated = () => fetchData(appliedFilters);
    window.addEventListener('mock_dataset_updated', onDataUpdated);
    return () => window.removeEventListener('mock_dataset_updated', onDataUpdated);
  }, [fetchData, appliedFilters]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters && newFilters.startDate !== undefined ? { ...newFilters } : { ...filters });
  };

  const handleResetFilters = () => {
    const emptyFilters = { startDate: '', endDate: '', category: '', deliveryStatus: '' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">Unable to load analytics</h3>
        <p className="text-secondary mb-6">{error}</p>
        <button
          onClick={() => fetchData(appliedFilters)}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-slate-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      
      <KpiCards summary={data.summary} loading={loading.summary} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data.revenue} loading={loading.revenue} />
        </div>
        <div>
          <DeliveryChart data={data.delivery} loading={loading.delivery} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <CategoryChart 
            data={data.categories} 
            loading={loading.categories} 
            onCategoryClick={(data) => setSelectedCategory(data)} 
          />
        </div>
        <div className="lg:col-span-2">
          <OrdersTable 
            data={data.orders} 
            loading={loading.orders}
            onOrderClick={(order) => setSelectedOrder(order)}
          />
        </div>
      </div>

      <CategoryDrawer categoryData={selectedCategory} onClose={() => setSelectedCategory(null)} />
      <OrderDrawer orderData={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default Dashboard;
