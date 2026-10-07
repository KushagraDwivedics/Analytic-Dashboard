import React, { useState, useEffect } from 'react';
import { getDelivery, getOrders } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Truck, PackageCheck, Clock } from 'lucide-react';

const DeliveryPage = () => {
  const [delivery, setDelivery] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusView, setStatusView] = useState('all');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [d, o] = await Promise.all([
          getDelivery(),
          getOrders()
        ]);
        setDelivery(d);
        setOrders(o);
      } catch (err) {
        console.error('Delivery data load error:', err);
        setError('Unable to load delivery data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    window.addEventListener('mock_dataset_updated', fetchAll);
    return () => window.removeEventListener('mock_dataset_updated', fetchAll);
  }, []);

  const filteredOrders = statusView === 'all'
    ? orders
    : orders.filter(o => o.deliveryStatus === statusView);

  const total = delivery ? delivery.delivered + delivery.delayed + delivery.unknown : 0;

  const pieData = delivery ? [
    { name: 'Delivered', value: delivery.delivered, color: '#22c55e' },
    { name: 'Delayed', value: delivery.delayed, color: '#f59e0b' },
    ...(delivery.unknown > 0 ? [{ name: 'Unknown', value: delivery.unknown, color: '#94a3b8' }] : [])
  ] : [];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface rounded-xl border border-border p-8 text-center shadow-sm">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-md text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Delivery</h2>
        <p className="text-sm text-secondary mt-1">Monitor shipment and delivery performance.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-24 sm:h-28 bg-surface border border-border rounded-xl animate-pulse"></div>)
        ) : (
          <>
            <button
              onClick={() => setStatusView('all')}
              className={`bg-surface p-4 sm:p-5 rounded-xl border shadow-sm text-left transition-all ${statusView === 'all' ? 'border-accent ring-1 ring-accent/20' : 'border-border hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Truck size={20} className="text-accent" /></div>
                <p className="text-xs sm:text-sm font-medium text-secondary truncate">Total Shipments</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-primary">{total.toLocaleString()}</p>
            </button>
            <button
              onClick={() => setStatusView(statusView === 'Delivered' ? 'all' : 'Delivered')}
              className={`bg-surface p-4 sm:p-5 rounded-xl border shadow-sm text-left transition-all ${statusView === 'Delivered' ? 'border-green-500 ring-1 ring-green-500/20' : 'border-border hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0"><PackageCheck size={20} className="text-green-600" /></div>
                <p className="text-xs sm:text-sm font-medium text-secondary truncate">Delivered</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-700">{delivery?.delivered.toLocaleString()}</p>
              <p className="text-xs text-secondary mt-1">{total > 0 ? ((delivery.delivered / total) * 100).toFixed(1) : 0}% of total</p>
            </button>
            <button
              onClick={() => setStatusView(statusView === 'Delayed' ? 'all' : 'Delayed')}
              className={`bg-surface p-4 sm:p-5 rounded-xl border shadow-sm text-left transition-all ${statusView === 'Delayed' ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-border hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0"><Clock size={20} className="text-yellow-600" /></div>
                <p className="text-xs sm:text-sm font-medium text-secondary truncate">Delayed</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-yellow-700">{delivery?.delayed.toLocaleString()}</p>
              <p className="text-xs text-secondary mt-1">{total > 0 ? ((delivery.delayed / total) * 100).toFixed(1) : 0}% of total</p>
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Pie chart */}
        <div className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Delivery Split</h3>
          {loading ? (
            <div className="h-64 bg-slate-100 animate-pulse rounded"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Delivery orders table */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">
              {statusView === 'all' ? 'All Shipments' : `${statusView} Orders`}
            </h3>
            <span className="text-sm text-secondary">{filteredOrders.length} orders</span>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded"></div>)}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-secondary">No orders match this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wider text-secondary border-b border-border">
                    <th className="p-4 font-medium">Order ID</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Days</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map(o => (
                    <tr key={o.orderId} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-accent">{o.orderId}</td>
                      <td className="p-4">{o.customer}</td>
                      <td className="p-4 font-medium">₹{o.amount.toLocaleString()}</td>
                      <td className="p-4 text-secondary">{o.deliveryDays || '-'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          o.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{o.deliveryStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
