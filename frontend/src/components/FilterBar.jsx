import React from 'react';
import { Calendar, RotateCcw, Filter } from 'lucide-react';

const FilterBar = ({ filters, setFilters, onApply, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyPreset = (startDate, endDate) => {
    const nextFilters = { ...filters, startDate, endDate };
    setFilters(nextFilters);
    if (onApply) {
      setTimeout(() => onApply(nextFilters), 0);
    }
  };

  return (
    <div className="bg-surface p-3 sm:p-4 rounded-xl border border-border flex flex-col gap-3 mb-6 shadow-sm">
      {/* Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5 text-xs text-secondary font-medium shrink-0">
          <Calendar size={14} className="text-accent" />
          <span>Quick Ranges:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => applyPreset('2024-01-01', '2024-01-07')}
            className="px-2.5 py-1 text-xs rounded-full border border-border hover:border-accent hover:text-accent bg-slate-50 transition-colors whitespace-nowrap"
          >
            Jan 1 - 7 (Week 1)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('2024-01-08', '2024-01-14')}
            className="px-2.5 py-1 text-xs rounded-full border border-border hover:border-accent hover:text-accent bg-slate-50 transition-colors whitespace-nowrap"
          >
            Jan 8 - 14 (Week 2)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('2024-01-01', '2024-01-14')}
            className="px-2.5 py-1 text-xs rounded-full border border-border hover:border-accent hover:text-accent bg-slate-50 transition-colors whitespace-nowrap"
          >
            Full Dataset (Jan 1-14)
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-2.5 py-1 text-xs rounded-full border border-border hover:bg-slate-100 text-secondary transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Toys">Toys</option>
              <option value="Books">Books</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Delivery Status</label>
            <select
              name="deliveryStatus"
              value={filters.deliveryStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent"
            >
              <option value="">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
        </div>
        <div className="flex flex-row items-stretch sm:items-end gap-2 shrink-0 pt-1 md:pt-0">
          <button
            onClick={() => onApply && onApply(filters)}
            className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Filter size={14} />
            Apply Filters
          </button>
          <button
            onClick={onReset}
            className="px-3.5 py-2 bg-slate-100 text-primary rounded-md text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 shrink-0"
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            <span className="sm:hidden text-xs">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
