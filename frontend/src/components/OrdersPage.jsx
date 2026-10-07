import React, { useState, useEffect, useCallback } from 'react';
import { getOrders } from '../services/api';
import { OrderDrawer } from './Drawers';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter) filters.deliveryStatus = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      const data = await getOrders(filters);
      setOrders(data);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    fetchOrders();

    window.addEventListener('mock_dataset_updated', fetchOrders);
    return () => window.removeEventListener('mock_dataset_updated', fetchOrders);
  }, [fetchOrders]);

  const filtered = orders.filter(o =>
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Orders</h2>
        <p className="text-sm text-secondary mt-1">View and manage all customer orders.</p>
      </div>

      {/* Filters */}
      <div className="bg-surface p-3 sm:p-4 rounded-xl border border-border shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="flex-1 sm:flex-initial px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Toys">Toys</option>
            <option value="Books">Books</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="flex-1 sm:flex-initial px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent"
          >
            <option value="">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center shadow-sm">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchOrders} className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-slate-800">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center shadow-sm">
          <p className="text-secondary mb-1">No orders found</p>
          <p className="text-sm text-slate-400">Try changing your filters or search term.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wider text-secondary border-b border-border">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Delivery</th>
                  <th className="p-4 font-medium">Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {paginated.map(order => (
                  <tr key={order.orderId} onClick={() => setSelectedOrder(order)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="p-4 font-medium text-accent">{order.orderId}</td>
                    <td className="p-4 text-primary">{order.customer}</td>
                    <td className="p-4 text-secondary">{order.date}</td>
                    <td className="p-4">{order.items}</td>
                    <td className="p-4 font-medium">₹{order.amount.toLocaleString()}</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">{order.category}</span></td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{order.deliveryStatus}</span>
                    </td>
                    <td className="p-4 text-secondary">{order.deliveryDays || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <p className="text-secondary text-center sm:text-left">Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} orders</p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-border rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
                <span className="text-xs text-secondary font-medium px-1">Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-border rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      <OrderDrawer orderData={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default OrdersPage;
