import React, { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const formatCurrency = (value) => `₹${(value / 1000).toFixed(1)}k`;

export const RevenueChart = ({ data, loading }) => {
  const [metric, setMetric] = useState('revenue');

  if (loading) {
    return <div className="h-72 sm:h-80 bg-surface border border-border rounded-xl animate-pulse"></div>;
  }
  if (!data || data.length === 0) {
    return <div className="h-72 sm:h-80 bg-surface border border-border rounded-xl flex items-center justify-center text-secondary">No data found</div>;
  }

  return (
    <div className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-primary">Revenue & Orders</h3>
        <div className="flex bg-slate-100 rounded-md p-1 self-start sm:self-auto">
          <button
            className={`px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium rounded transition-colors ${metric === 'revenue' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
            onClick={() => setMetric('revenue')}
          >
            Revenue
          </button>
          <button
            className={`px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium rounded transition-colors ${metric === 'orders' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
            onClick={() => setMetric('orders')}
          >
            Orders
          </button>
        </div>
      </div>
      <div className="h-60 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {metric === 'revenue' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
              <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-5} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-5} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [value, 'Orders']}
              />
              <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const CategoryChart = ({ data, loading, onCategoryClick }) => {
  if (loading) {
    return <div className="h-72 sm:h-80 bg-surface border border-border rounded-xl animate-pulse"></div>;
  }
  if (!data || data.length === 0) {
    return <div className="h-72 sm:h-80 bg-surface border border-border rounded-xl flex items-center justify-center text-secondary">No data found</div>;
  }

  return (
    <div className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm">
      <h3 className="text-base sm:text-lg font-semibold text-primary mb-4 sm:mb-6">Revenue by Category</h3>
      <div className="h-60 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#0f172a' }} width={75} />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
            />
            <Bar
              dataKey="revenue"
              fill="#6366f1"
              radius={[0, 4, 4, 0]}
              onClick={(data) => onCategoryClick && onCategoryClick(data)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DeliveryChart = ({ data, loading }) => {
  if (loading) {
    return <div className="h-72 sm:h-80 bg-surface border border-border rounded-xl animate-pulse"></div>;
  }
  if (!data) {
    return <div className="h-72 sm:h-80 bg-surface border border-border rounded-xl flex items-center justify-center text-secondary">No data found</div>;
  }

  const chartData = [
    { name: 'Delivered', value: data.delivered, color: '#22c55e' },
    { name: 'Delayed', value: data.delayed, color: '#f59e0b' },
    { name: 'Unknown', value: data.unknown, color: '#94a3b8' },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm flex flex-col">
      <h3 className="text-base sm:text-lg font-semibold text-primary mb-4 sm:mb-6">Delivery Performance</h3>
      <div className="h-56 sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              itemStyle={{ color: '#0f172a' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
