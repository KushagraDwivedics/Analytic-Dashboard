import React from 'react';
import { ShoppingBag, DollarSign, Clock, TrendingUp } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN').format(value);
};

const KpiCard = ({ title, value, icon, loading }) => {
  return (
    <div className="bg-surface p-6 rounded-xl border border-border flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-secondary">{title}</p>
        {loading ? (
          <div className="h-7 w-24 bg-slate-200 animate-pulse rounded mt-1"></div>
        ) : (
          <p className="text-2xl font-semibold text-primary">{value}</p>
        )}
      </div>
    </div>
  );
};

const KpiCards = ({ summary, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <KpiCard
        title="TOTAL ORDERS"
        value={summary ? formatNumber(summary.totalOrders) : '-'}
        icon={<ShoppingBag size={24} />}
        loading={loading}
      />
      <KpiCard
        title="TOTAL REVENUE"
        value={summary ? formatCurrency(summary.totalRevenue) : '-'}
        icon={<DollarSign size={24} />}
        loading={loading}
      />
      <KpiCard
        title="DELAYED ORDERS"
        value={summary ? formatNumber(summary.delayedOrders) : '-'}
        icon={<Clock size={24} className="text-warning" />}
        loading={loading}
      />
      <KpiCard
        title="AVG ORDER VALUE"
        value={summary ? formatCurrency(summary.averageOrderValue) : '-'}
        icon={<TrendingUp size={24} />}
        loading={loading}
      />
      {/* Optional KPIs below could be added depending on layout, we'll keep to 4 primary ones here or add 2 more */}
    </div>
  );
};

export default KpiCards;
