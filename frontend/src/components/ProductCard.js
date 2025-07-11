import React from 'react';

const ProductCard = ({
  plant,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  renderStars
}) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col h-full relative group">
      <div className="relative mb-3 overflow-hidden rounded-lg aspect-w-1 aspect-h-1">
        <img
          src={plant.image_url}
          alt={plant.name}
          className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/60 to-transparent p-2 gap-2">
          <button
            className="w-full py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            onClick={() => onViewDetails(plant)}
          >
            View Details
          </button>
          <button
            className="w-full py-1 rounded bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition"
            onClick={() => onAddToCart(plant)}
          >
            Add to Cart
          </button>
          <button
            className={`w-full py-1 rounded font-semibold transition ${isInWishlist(plant.id) ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => onToggleWishlist(plant)}
          >
            {isInWishlist(plant.id) ? '💖 Remove from Wishlist' : '🤍 Add to Wishlist'}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{plant.name}</h3>
          <div className="flex items-center gap-1 mb-1">
            {renderStars(plant.average_rating)}
            <span className="text-xs text-gray-500 ml-1">({plant.total_reviews})</span>
          </div>
          <p className="text-green-700 font-bold text-xl mb-1">${plant.price}</p>
          <p className="text-xs text-gray-500 mb-2">{plant.category}</p>
          <p className="text-gray-700 text-sm line-clamp-2">{plant.description.substring(0, 100)}...</p>
        </div>
      </div>
      {plant.stock_quantity === 0 && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</span>
      )}
    </div>
  );
};

export default ProductCard; 