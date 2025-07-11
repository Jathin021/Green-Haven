import React from 'react';

const WishlistModal = ({ show, onClose, wishlist, addToCart, removeFromWishlist }) => {
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
        <h2 className="text-2xl font-bold mb-4 text-pink-600">My Wishlist</h2>
        {wishlist.length === 0 ? (
          <p className="text-gray-500">Your wishlist is empty</p>
        ) : (
          <div className="space-y-4">
            {wishlist.map(item => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-3">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-green-700 font-bold">${item.price}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-pink-100 text-pink-600 font-semibold hover:bg-pink-200 transition"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistModal; 