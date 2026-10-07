import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../services/api';
import { Search, Package } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (categoryFilter) filters.category = categoryFilter;
      const data = await getProducts(filters);
      setProducts(data);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchProducts();

    window.addEventListener('mock_dataset_updated', fetchProducts);
    return () => window.removeEventListener('mock_dataset_updated', fetchProducts);
  }, [fetchProducts]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category for summary cards
  const categoryGroups = {};
  products.forEach(p => {
    if (!categoryGroups[p.category]) categoryGroups[p.category] = { count: 0, totalPrice: 0 };
    categoryGroups[p.category].count++;
    categoryGroups[p.category].totalPrice += p.price;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Products</h2>
        <p className="text-sm text-secondary mt-1">Browse and manage the product catalog.</p>
      </div>

      {/* Category summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(categoryGroups).map(([cat, info]) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
            className={`bg-surface p-4 rounded-xl border shadow-sm text-left transition-all ${
              categoryFilter === cat ? 'border-accent ring-1 ring-accent/20' : 'border-border hover:border-slate-300'
            }`}
          >
            <p className="text-xs font-medium text-secondary uppercase">{cat}</p>
            <p className="text-xl font-bold text-primary mt-1">{info.count}</p>
            <p className="text-xs text-secondary">products</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search by product name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent"
          />
        </div>
        {categoryFilter && (
          <button onClick={() => setCategoryFilter('')} className="px-4 py-2 bg-slate-100 text-primary rounded-md text-sm hover:bg-slate-200">
            Clear Filter: {categoryFilter}
          </button>
        )}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-36 bg-surface border border-border rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center shadow-sm">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchProducts} className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-slate-800">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center shadow-sm">
          <p className="text-secondary mb-1">No products found</p>
          <p className="text-sm text-slate-400">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-surface p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-secondary">
                  <Package size={20} />
                </div>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-secondary">{product.category}</span>
              </div>
              <h3 className="text-base font-semibold text-primary">{product.name}</h3>
              <p className="text-xs text-secondary mb-3">ID: {product.id}</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</p>
                {product.stock !== undefined && (
                  <p className="text-xs text-secondary">{product.stock} in stock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
