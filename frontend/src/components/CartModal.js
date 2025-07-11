import React from 'react';

const CartModal = ({ cart, show, onClose, updateQuantity, removeFromCart, getSubtotal, onCheckout }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-green-700">Shopping Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-3">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-green-700 font-bold">${item.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span className="px-2">{item.quantity}</span>
                    <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button
                  className="ml-2 text-red-500 hover:text-red-700 text-sm font-semibold"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4">
              <h3 className="text-lg font-bold">Subtotal:</h3>
              <span className="text-xl font-bold text-green-700">${getSubtotal().toFixed(2)}</span>
            </div>
            <button
              className="w-full mt-4 py-3 rounded bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition shadow"
              onClick={onCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal; 