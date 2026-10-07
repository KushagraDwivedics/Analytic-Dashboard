import React, { useEffect, useState } from 'react';
import { X, Package } from 'lucide-react';
import { getProducts } from '../services/api';

export const CategoryDrawer = ({ categoryData, onClose }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryData) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Here we could filter by category via API
        const data = await getProducts({ category: categoryData.category });
        setProducts(data.filter(p => p.category === categoryData.category));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryData]);

  if (!categoryData) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={onClose}></div>
      <div className="relative w-full sm:max-w-md bg-surface h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200">
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-primary uppercase">{categoryData.category} DETAILS</h2>
          <button onClick={onClose} className="p-2 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-border">
              <p className="text-xs font-medium text-secondary mb-1">REVENUE</p>
              <p className="text-lg sm:text-xl font-semibold text-primary">₹{categoryData.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-border">
              <p className="text-xs font-medium text-secondary mb-1">ORDERS</p>
              <p className="text-lg sm:text-xl font-semibold text-primary">{categoryData.orders.toLocaleString()}</p>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Package size={16} /> Products in Category
          </h3>
          
          {loading ? (
            <div className="space-y-3">
              <div className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
              <div className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="p-3.5 sm:p-4 rounded-lg border border-border flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-medium text-primary text-sm sm:text-base">{product.name}</p>
                    <p className="text-xs text-secondary">ID: {product.id}</p>
                  </div>
                  <p className="font-semibold text-primary text-sm sm:text-base">₹{product.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-secondary bg-slate-50 rounded-lg border border-border text-sm">
              No product-level information available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const OrderDrawer = ({ orderData, onClose }) => {
  if (!orderData) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={onClose}></div>
      <div className="relative w-full sm:max-w-md bg-surface h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200">
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-primary">Order {orderData.orderId}</h2>
          <button onClick={onClose} className="p-2 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-xs font-medium text-secondary mb-1">CUSTOMER</p>
              <p className="text-sm font-medium text-primary">{orderData.customer}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary mb-1">ORDER DATE</p>
              <p className="text-sm font-medium text-primary">{orderData.date}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary mb-1">TOTAL ITEMS</p>
              <p className="text-sm font-medium text-primary">{orderData.items}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary mb-1">ORDER VALUE</p>
              <p className="text-sm font-medium text-primary text-accent font-semibold">₹{orderData.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary mb-1">SHIPMENT STATUS</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  orderData.deliveryStatus === 'Delivered'
                    ? 'bg-green-100 text-green-800'
                    : orderData.deliveryStatus === 'Delayed'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {orderData.deliveryStatus}
              </span>
            </div>
          </div>
          
          <hr className="border-border" />
          
          <h3 className="text-sm font-semibold text-primary mb-2">Order Products</h3>
          <div className="p-6 text-center text-secondary bg-slate-50 rounded-lg border border-border">
            <p>Product details not available in this summary.</p>
            <p className="text-xs mt-1">Make API request for /orders/{orderData.orderId} to get items.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
