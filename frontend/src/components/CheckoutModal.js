import React from 'react';
import PayPalCheckout from '../PayPalCheckout';

const CheckoutModal = ({
  show,
  onClose,
  cart,
  shippingInfo,
  setShippingInfo,
  discountCode,
  setDiscountCode,
  validateDiscountCode,
  orderTotal,
  handlePaymentSuccess,
  handlePaymentError
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-6 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-green-700">Checkout</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Shipping Info */}
          <div className="flex-1">
            <h3 className="font-bold mb-2">Shipping Information</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Address"
                value={shippingInfo.address}
                onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                type="text"
                placeholder="City"
                value={shippingInfo.city}
                onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                type="text"
                placeholder="State"
                value={shippingInfo.state}
                onChange={e => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={shippingInfo.zip_code}
                onChange={e => setShippingInfo({ ...shippingInfo, zip_code: e.target.value })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <h3 className="font-bold mt-4 mb-2">Discount Code</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter discount code"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={validateDiscountCode}
              >
                Apply
              </button>
            </div>
          </div>
          {/* Order Summary & Payment */}
          <div className="flex-1">
            <h3 className="font-bold mb-2">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {orderTotal && (
              <div className="space-y-1 mb-4">
                <div className="flex justify-between"><span>Subtotal:</span><span>${orderTotal.subtotal}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>${orderTotal.tax_amount}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span>${orderTotal.shipping_cost}</span></div>
                {orderTotal.discount_amount > 0 && (
                  <div className="flex justify-between text-green-700"><span>Discount:</span><span>-${orderTotal.discount_amount}</span></div>
                )}
                <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${orderTotal.total}</span></div>
              </div>
            )}
            <PayPalCheckout
              cart={cart}
              total={orderTotal?.total || 0}
              shippingInfo={shippingInfo}
              discountCode={discountCode}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal; 