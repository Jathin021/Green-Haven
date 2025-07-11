import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Enhanced Header Component with animations
const Header = ({ cartCount, wishlistCount, onOpenCart, onOpenWishlist, onOpenProfile, onOpenAuth, isLoggedIn, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <a href="#" className="logo">
          <span className="logo-icon">🌱</span>
          <span>Green Haven</span>
        </a>
        <div className="nav-actions">
          <button className="nav-btn secondary" onClick={onOpenWishlist}>
            <span>❤️</span>
            Wishlist
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </button>
          <button className="nav-btn secondary" onClick={onOpenCart}>
            <span>🛒</span>
            Cart
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
          {isLoggedIn ? (
            <>
              <button className="nav-btn secondary" onClick={onOpenProfile}>
                <span>👤</span>
                Profile
              </button>
              <button className="nav-btn danger" onClick={onLogout}>
                <span>🚪</span>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-btn primary" onClick={onOpenAuth}>
              <span>🔐</span>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// Enhanced Product Card with advanced animations
const ProductCard = ({ product, onAddToCart, onAddToWishlist, onViewDetails, isInWishlist }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">⭐</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">⭐</span>);
      } else {
        stars.push(<span key={i} className="star empty">⭐</span>);
      }
    }
    return stars;
  };

  return (
    <div 
      className={`product-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {product.stock_quantity === 0 && (
        <div className="out-of-stock">Out of Stock</div>
      )}
      <div className="product-image">
        <img 
          src={product.image_url} 
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        <div className="product-overlay">
          <div className="product-actions">
            <button 
              className="product-btn primary"
              onClick={() => onAddToCart(product)}
              disabled={product.stock_quantity === 0}
            >
              🛒 Add to Cart
            </button>
            <button 
              className="product-btn secondary"
              onClick={() => onAddToWishlist(product)}
            >
              {isInWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
            </button>
            <button 
              className="product-btn secondary"
              onClick={() => onViewDetails(product)}
            >
              👁️ View Details
            </button>
          </div>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-rating">
          <div className="stars">
            {renderStars(product.average_rating)}
          </div>
          <span className="rating-count">({product.total_reviews})</span>
        </div>
        <div className="product-price">${product.price.toFixed(2)}</div>
        <div className="product-category">{product.category}</div>
        <p className="product-description">{product.description}</p>
      </div>
    </div>
  );
};

// Enhanced Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
    </div>
  );
};

// Enhanced Loading Component
const Loading = ({ message = "Loading..." }) => (
  <div className="loading">
    <div className="loading-spinner"></div>
    <p>{message}</p>
  </div>
);

// Enhanced Empty State Component
const EmptyState = ({ icon, title, description, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-description">{description}</p>
    {action && action}
  </div>
);

function App() {
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Enhanced API calls with better error handling
  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (sortBy) params.append('sort_by', sortBy);

      const response = await fetch(`http://localhost:8001/api/plants?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPlants(data);
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError('Failed to load plants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, minPrice, maxPrice, sortBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Enhanced cart operations
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.plant_id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.plant_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { plant_id: product.id, quantity: 1 }];
    });
    showToast('Added to cart!', 'success');
  };

  const removeFromCart = (plantId) => {
    setCart(prevCart => prevCart.filter(item => item.plant_id !== plantId));
    showToast('Removed from cart!', 'success');
  };

  const updateCartQuantity = (plantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(plantId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.plant_id === plantId ? { ...item, quantity } : item
      )
    );
  };

  // Enhanced wishlist operations
  const addToWishlist = (product) => {
    const isInWishlist = wishlist.some(item => item.plant_id === product.id);
    if (isInWishlist) {
      setWishlist(prev => prev.filter(item => item.plant_id !== product.id));
      showToast('Removed from wishlist!', 'success');
    } else {
      setWishlist(prev => [...prev, { plant_id: product.id }]);
      showToast('Added to wishlist!', 'success');
    }
  };

  // Enhanced toast system
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Enhanced authentication
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setIsLoggedIn(true);
      setShowAuth(false);
      showToast('Login successful!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    showToast('Logged out successfully!', 'success');
  };

  // Enhanced search and filter
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPlants();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
  };

  // Calculate totals
  const cartTotal = cart.reduce((total, item) => {
    const product = plants.find(p => p.id === item.plant_id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Filtered plants
  const filteredPlants = plants.filter(plant => {
    if (selectedCategory && plant.category !== selectedCategory) return false;
    if (searchTerm && !plant.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (minPrice && plant.price < parseFloat(minPrice)) return false;
    if (maxPrice && plant.price > parseFloat(maxPrice)) return false;
    return true;
  });

  // Sort plants
  const sortedPlants = [...filteredPlants].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating':
        return b.average_rating - a.average_rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Effects
  useEffect(() => {
    fetchPlants();
    fetchCategories();
  }, [fetchPlants, fetchCategories]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Enhanced error handling
  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="empty-state-title">Oops! Something went wrong</h3>
        <p className="empty-state-description">{error}</p>
        <button className="btn btn-primary" onClick={fetchPlants}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenCart={() => setShowCart(true)}
        onOpenWishlist={() => setShowWishlist(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenAuth={() => setShowAuth(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <section className="hero">
        <div className="hero-content">
          <h2>Welcome to Green Haven Nursery</h2>
          <p>Discover beautiful plants for your home and garden. From succulents to herbs, we have everything you need to create your perfect green space.</p>
        </div>
      </section>

      <section className="search-filter">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="price-filter">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-input"
              min="0"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-input"
              min="0"
              step="0.01"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="">Sort by</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
          </select>
          <button type="submit" className="btn btn-primary">
            🔍 Search
          </button>
          <button type="button" className="btn btn-secondary" onClick={clearFilters}>
            🗑️ Clear
          </button>
        </form>
      </section>

      <section className="plants-section">
        <div className="container">
          {loading ? (
            <Loading message="Loading beautiful plants..." />
          ) : sortedPlants.length === 0 ? (
            <EmptyState
              icon="🌿"
              title="No plants found"
              description="Try adjusting your search criteria or browse all categories to find the perfect plant for your space."
              action={
                <button className="btn btn-primary" onClick={clearFilters}>
                  🌱 Browse All Plants
                </button>
              }
            />
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>
                  Found {sortedPlants.length} beautiful plant{sortedPlants.length !== 1 ? 's' : ''}
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Discover your perfect green companion
                </p>
              </div>
              <div className="plants-grid">
                {sortedPlants.map(plant => (
                  <ProductCard
                    key={plant.id}
                    product={plant}
                    onAddToCart={addToCart}
                    onAddToWishlist={addToWishlist}
                    onViewDetails={(product) => {
                      showToast(`Viewing details for ${product.name}`, 'success');
                    }}
                    isInWishlist={wishlist.some(item => item.plant_id === plant.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Enhanced Modals */}
      <Modal isOpen={showCart} onClose={() => setShowCart(false)} title="Shopping Cart">
        {cart.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            description="Add some beautiful plants to get started!"
            action={
              <button className="btn btn-primary" onClick={() => setShowCart(false)}>
                🌱 Browse Plants
              </button>
            }
          />
        ) : (
          <div>
            {cart.map(item => {
              const product = plants.find(p => p.id === item.plant_id);
              if (!product) return null;
              
              return (
                <div key={item.plant_id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                }}>
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, marginLeft: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{product.name}</h4>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>${product.price.toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => updateCartQuantity(item.plant_id, item.quantity - 1)}
                      style={{ padding: '0.5rem', fontSize: '1.25rem' }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: '600' }}>
                      {item.quantity}
                    </span>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => updateCartQuantity(item.plant_id, item.quantity + 1)}
                      style={{ padding: '0.5rem', fontSize: '1.25rem' }}
                    >
                      +
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => removeFromCart(item.plant_id)}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
            <div style={{ 
              borderTop: '2px solid #e5e7eb', 
              paddingTop: '1rem', 
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
                Total: ${cartTotal.toFixed(2)}
              </h3>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(true);
                }}
                style={{ marginRight: '0.5rem' }}
              >
                💳 Proceed to Checkout
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCart(false)}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showWishlist} onClose={() => setShowWishlist(false)} title="My Wishlist">
        {wishlist.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            description="Save your favorite plants for later!"
            action={
              <button className="btn btn-primary" onClick={() => setShowWishlist(false)}>
                🌱 Browse Plants
              </button>
            }
          />
        ) : (
          <div className="plants-grid">
            {wishlist.map(item => {
              const product = plants.find(p => p.id === item.plant_id);
              if (!product) return null;
              
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onAddToWishlist={addToWishlist}
                  onViewDetails={(product) => {
                    showToast(`Viewing details for ${product.name}`, 'success');
                  }}
                  isInWishlist={true}
                />
              );
            })}
          </div>
        )}
      </Modal>

      <Modal isOpen={showAuth} onClose={() => setShowAuth(false)} title="Login">
        <AuthForm onLogin={handleLogin} onClose={() => setShowAuth(false)} />
      </Modal>

      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title="My Profile">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Welcome back!</h3>
          <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
            Manage your account and view your order history.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowProfile(false);
                setShowOrders(true);
              }}
            >
              📦 My Orders
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowProfile(false);
                setShowReviews(true);
              }}
            >
              ⭐ My Reviews
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Checkout">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💳</div>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Complete Your Purchase</h3>
          <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
            Total: ${cartTotal.toFixed(2)}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              showToast('Payment processing... (Demo mode)', 'success');
              setShowCheckout(false);
              setCart([]);
            }}
            style={{ marginRight: '0.5rem' }}
          >
            💳 Pay with PayPal
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCheckout(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Modal isOpen={showOrders} onClose={() => setShowOrders(false)} title="My Orders">
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="Your order history will appear here once you make your first purchase."
          action={
            <button className="btn btn-primary" onClick={() => setShowOrders(false)}>
              🌱 Start Shopping
            </button>
          }
        />
      </Modal>

      <Modal isOpen={showReviews} onClose={() => setShowReviews(false)} title="My Reviews">
        <EmptyState
          icon="⭐"
          title="No reviews yet"
          description="Share your experience with the plants you've purchased."
          action={
            <button className="btn btn-primary" onClick={() => setShowReviews(false)}>
              🌱 Browse Plants
            </button>
          }
        />
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Green Haven Nursery. Made with ❤️ for plant lovers everywhere.</p>
          <p>
            <a href="#" onClick={(e) => { e.preventDefault(); showToast('Privacy Policy clicked!', 'success'); }}>
              Privacy Policy
            </a> | 
            <a href="#" onClick={(e) => { e.preventDefault(); showToast('Terms of Service clicked!', 'success'); }}>
              Terms of Service
            </a> | 
            <a href="#" onClick={(e) => { e.preventDefault(); showToast('Contact us at info@greenhaven.com', 'success'); }}>
              Contact Us
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Enhanced Auth Form Component
const AuthForm = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? '🔄 Logging in...' : '🔐 Login'}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Demo: Use any email/password to login
        </p>
      </div>
    </form>
  );
};

export default App;