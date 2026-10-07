import React from 'react';

const OrdersTable = ({ data, loading, onOrderClick }) => {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="h-6 w-32 bg-slate-200 animate-pulse rounded"></div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-slate-100 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="text-secondary mb-2">No orders found</div>
        <p className="text-sm text-slate-400">Try changing your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Recent Orders</h3>
      </div>
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
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {data.map((order) => (
              <tr
                key={order.orderId}
                onClick={() => onOrderClick && onOrderClick(order)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="p-4 font-medium text-primary">{order.orderId}</td>
                <td className="p-4">{order.customer}</td>
                <td className="p-4">{order.date}</td>
                <td className="p-4">{order.items}</td>
                <td className="p-4 font-medium">₹{order.amount.toLocaleString()}</td>
                <td className="p-4">{order.category}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.deliveryStatus === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.deliveryStatus === 'Delayed'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {order.deliveryStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
