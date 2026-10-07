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
    <div className="bg-surface p-4 sm:p-5 md:p-6 rounded-xl border border-border flex items-center gap-3.5 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-secondary truncate">{title}</p>
        {loading ? (
          <div className="h-6 sm:h-7 w-20 sm:w-24 bg-slate-200 animate-pulse rounded mt-1"></div>
        ) : (
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate" title={value}>{value}</p>
        )}
      </div>
    </div>
  );
};

const KpiCards = ({ summary, loading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
      <KpiCard
        title="TOTAL ORDERS"
        value={summary ? formatNumber(summary.totalOrders) : '-'}
        icon={<ShoppingBag size={20} className="sm:w-6 sm:h-6" />}
        loading={loading}
      />
      <KpiCard
        title="TOTAL REVENUE"
        value={summary ? formatCurrency(summary.totalRevenue) : '-'}
        icon={<DollarSign size={20} className="sm:w-6 sm:h-6" />}
        loading={loading}
      />
      <KpiCard
        title="DELAYED ORDERS"
        value={summary ? formatNumber(summary.delayedOrders) : '-'}
        icon={<Clock size={20} className="sm:w-6 sm:h-6 text-warning" />}
        loading={loading}
      />
      <KpiCard
        title="AVG ORDER VALUE"
        value={summary ? formatCurrency(summary.averageOrderValue) : '-'}
        icon={<TrendingUp size={20} className="sm:w-6 sm:h-6" />}
        loading={loading}
      />
    </div>
  );
};

export default KpiCards;
