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
    <div className="product-card">
      <div className="product-image">
        <img
          src={plant.image_url}
          alt={plant.name}
          className="w-full h-full object-cover"
        />
        <div className="product-overlay">
          <div className="product-actions">
            <button
              className="product-btn primary"
              onClick={() => onViewDetails(plant)}
            >
              👁️ View Details
            </button>
            <button
              className="product-btn secondary"
              onClick={() => onAddToCart(plant)}
            >
              🛒 Add to Cart
            </button>
            <button
              className={`product-btn secondary ${isInWishlist(plant.id) ? 'bg-pink-100 text-pink-600' : ''}`}
              onClick={() => onToggleWishlist(plant)}
            >
              {isInWishlist(plant.id) ? '💖 Remove from Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{plant.name}</h3>
        <div className="product-rating">
          <div className="stars">
            {renderStars(plant.average_rating)}
          </div>
          <span className="rating-count">({plant.total_reviews})</span>
        </div>
        <p className="product-price">${plant.price}</p>
        <p className="product-category">{plant.category}</p>
        <p className="product-description">{plant.description}</p>
      </div>
      
      {plant.stock_quantity === 0 && (
        <span className="out-of-stock">Out of Stock</span>
      )}
    </div>
  );
};

export default ProductCard; 