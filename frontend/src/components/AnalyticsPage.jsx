import React, { useState, useEffect } from 'react';
import { getSummary, getRevenue, getCategories } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Clock, PackageCheck } from 'lucide-react';

const formatCurrency = (value) => `₹${(value / 1000).toFixed(1)}k`;

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, r, c] = await Promise.all([
          getSummary(),
          getRevenue(),
          getCategories()
        ]);
        setSummary(s);
        setRevenue(r);
        setCategories(c);
      } catch (err) {
        console.error('Analytics load error:', err);
        setError('Unable to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    window.addEventListener('mock_dataset_updated', fetchAll);
    return () => window.removeEventListener('mock_dataset_updated', fetchAll);
  }, []);

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
        <h2 className="text-2xl font-bold text-primary">Analytics</h2>
        <p className="text-sm text-secondary mt-1">Deep-dive into business performance metrics.</p>
      </div>
      {/* Extended KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {loading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border animate-pulse h-24"></div>
          ))
        ) : summary ? (
          <>
            <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={14} className="text-accent" />
                <p className="text-xs font-medium text-secondary truncate">Total Orders</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary truncate">{summary.totalOrders.toLocaleString()}</p>
            </div>
            <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-green-600" />
                <p className="text-xs font-medium text-secondary truncate">Revenue</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary truncate">₹{summary.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-accent" />
                <p className="text-xs font-medium text-secondary truncate">Avg Order</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary truncate">₹{Math.round(summary.averageOrderValue).toLocaleString()}</p>
            </div>
            <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PackageCheck size={14} className="text-green-600" />
                <p className="text-xs font-medium text-secondary truncate">Delivered</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary truncate">{summary.deliveredOrders.toLocaleString()}</p>
            </div>
            <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-yellow-600" />
                <p className="text-xs font-medium text-secondary truncate">Delayed</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary truncate">{summary.delayedOrders.toLocaleString()}</p>
            </div>
            <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} className="text-secondary" />
                <p className="text-xs font-medium text-secondary truncate">Avg Days</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary truncate">{summary.averageDeliveryDays}</p>
            </div>
          </>
        ) : null}
      </div>

      {/* Revenue trend full width */}
      <div className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Revenue Trend</h3>
        {loading ? (
          <div className="h-64 sm:h-72 bg-slate-100 animate-pulse rounded"></div>
        ) : (
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-5} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gradRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Two columns: Orders trend + Category comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Orders Trend</h3>
          {loading ? (
            <div className="h-64 bg-slate-100 animate-pulse rounded"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(v) => [v, 'Orders']} />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-primary mb-4">Revenue by Category</h3>
          {loading ? (
            <div className="h-64 bg-slate-100 animate-pulse rounded"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-primary">Category Breakdown</h3>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded"></div>)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wider text-secondary border-b border-border">
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Revenue</th>
                  <th className="p-4 font-medium">Orders</th>
                  <th className="p-4 font-medium">Avg Order Value</th>
                  <th className="p-4 font-medium">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map(c => {
                  const totalRev = categories.reduce((sum, cat) => sum + cat.revenue, 0);
                  const share = ((c.revenue / totalRev) * 100).toFixed(1);
                  return (
                    <tr key={c.category} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-primary">{c.category}</td>
                      <td className="p-4 font-medium">₹{c.revenue.toLocaleString()}</td>
                      <td className="p-4">{c.orders.toLocaleString()}</td>
                      <td className="p-4">₹{Math.round(c.revenue / c.orders).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${share}%` }}></div>
                          </div>
                          <span className="text-xs text-secondary">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
