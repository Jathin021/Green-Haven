import React from 'react';

const OrdersModal = ({ show, onClose, orders }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">My Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found</p>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.order_id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg">Order #{order.order_id.substring(0, 8)}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${order.order_status === 'delivered' ? 'bg-green-100 text-green-700' : order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}</span>
                </div>
                <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-600">
                  <span><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</span>
                  <span><strong>Total:</strong> ${order.total_amount}</span>
                  <span><strong>Items:</strong> {order.items?.length || 0} items</span>
                </div>
                <div className="flex flex-col gap-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.unit_amount * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersModal; 