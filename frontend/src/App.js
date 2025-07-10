import React, { useState, useEffect } from 'react';
import PayPalCheckout from './PayPalCheckout';
import './App.css';

const App = () => {
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [orderTotal, setOrderTotal] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US'
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchPlants();
    fetchCategories();
    
    // Check for stored user
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      fetchWishlist();
    }
  }, []);

  const fetchPlants = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (sortBy) params.append('sort_by', sortBy);
      
      const response = await fetch(`${BACKEND_URL}/api/plants?${params}`);
      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchWishlist = async () => {
    if (!currentUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchOrders = async () => {
    if (!currentUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchReviews = async (plantId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/plants/${plantId}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Update fetchPlants when filters change
  useEffect(() => {
    fetchPlants();
  }, [selectedCategory, searchTerm, minPrice, maxPrice, sortBy]);

  const filterPlants = () => {
    return plants; // Already filtered by API
  };

  const addToCart = (plant) => {
    const existingItem = cart.find(item => item.id === plant.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === plant.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...plant, quantity: 1 }]);
    }
  };

  const removeFromCart = (plantId) => {
    setCart(cart.filter(item => item.id !== plantId));
  };

  const updateQuantity = (plantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(plantId);
      return;
    }
    setCart(cart.map(item => 
      item.id === plantId 
        ? { ...item, quantity: quantity }
        : item
    ));
  };

  const addToWishlist = async (plant) => {
    if (!currentUser) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/wishlist/${plant.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchWishlist();
        alert('Added to wishlist!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Error adding to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Error adding to wishlist');
    }
  };

  const removeFromWishlist = async (plantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/wishlist/${plantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchWishlist();
        alert('Removed from wishlist!');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAuth = async (formData) => {
    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.access_token);
        setShowAuth(false);
        fetchWishlist();
      } else {
        const error = await response.json();
        alert(error.detail || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setWishlist([]);
    setOrders([]);
    setShowOrders(false);
    setShowProfile(false);
    setShowWishlist(false);
  };

  const calculateOrderTotal = async () => {
    if (cart.length === 0) return;

    const orderData = {
      items: cart.map(item => ({
        plant_id: item.id,
        quantity: item.quantity
      })),
      shipping_info: shippingInfo,
      discount_code: discountCode,
      user_id: currentUser?.id || null
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/calculate-total`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderTotal(data);
      }
    } catch (error) {
      console.error('Error calculating total:', error);
    }
  };

  const validateDiscountCode = async () => {
    if (!discountCode) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/validate-discount?discount_code=${discountCode}`);
      if (response.ok) {
        const data = await response.json();
        alert(data.description);
        calculateOrderTotal();
      } else {
        alert('Invalid discount code');
      }
    } catch (error) {
      console.error('Error validating discount:', error);
    }
  };

  const submitReview = async (plantId) => {
    if (!currentUser) {
      alert('Please login to submit a review');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/plants/${plantId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plant_id: plantId,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews(plantId);
        fetchPlants(); // Refresh to update ratings
      } else {
        const error = await response.json();
        alert(error.detail || 'Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  useEffect(() => {
    if (showCheckout) {
      calculateOrderTotal();
    }
  }, [cart, shippingInfo, discountCode, showCheckout]);

  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    setPaymentSuccess(true);
    setOrderDetails(paymentResult);
    setCart([]); // Clear cart
    setShowCheckout(false);
    alert(`Payment successful! Order ID: ${paymentResult.order_id}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  };

  const resetToShopping = () => {
    setPaymentSuccess(false);
    setOrderDetails(null);
    setShowCart(false);
    setShowCheckout(false);
    setShowOrders(false);
    setShowProfile(false);
    setShowWishlist(false);
  };

  const showPlantDetails = (plant) => {
    setSelectedPlant(plant);
    fetchReviews(plant.id);
    setShowReviews(true);
  };

  const isInWishlist = (plantId) => {
    return wishlist.some(item => item.id === plantId);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  const filteredPlants = filterPlants();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">🌿 Green Haven Nursery</h1>
            <nav className="nav">
              <button 
                className={`nav-btn ${!showCart && !showCheckout && !showOrders && !showProfile && !showWishlist ? 'active' : ''}`}
                onClick={resetToShopping}
              >
                Plants
              </button>
              <button 
                className={`nav-btn cart-btn ${showCart ? 'active' : ''}`}
                onClick={() => { setShowCart(true); setShowCheckout(false); setShowOrders(false); setShowProfile(false); setShowWishlist(false); }}
              >
                Cart ({getTotalItems()})
              </button>
              {currentUser && (
                <>
                  <button 
                    className={`nav-btn ${showWishlist ? 'active' : ''}`}
                    onClick={() => { setShowWishlist(true); setShowCart(false); setShowCheckout(false); setShowOrders(false); setShowProfile(false); fetchWishlist(); }}
                  >
                    Wishlist ({wishlist.length})
                  </button>
                  <button 
                    className={`nav-btn ${showOrders ? 'active' : ''}`}
                    onClick={() => { setShowOrders(true); setShowCart(false); setShowCheckout(false); setShowProfile(false); setShowWishlist(false); fetchOrders(); }}
                  >
                    Orders
                  </button>
                  <button 
                    className={`nav-btn ${showProfile ? 'active' : ''}`}
                    onClick={() => { setShowProfile(true); setShowCart(false); setShowCheckout(false); setShowOrders(false); setShowWishlist(false); }}
                  >
                    Profile
                  </button>
                </>
              )}
              {currentUser ? (
                <div className="user-menu">
                  <span>Hi, {currentUser.first_name}!</span>
                  <button onClick={logout} className="logout-btn">Logout</button>
                </div>
              ) : (
                <button 
                  className="auth-btn"
                  onClick={() => setShowAuth(true)}
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!showCart && !showCheckout && !showOrders && !showProfile && !showWishlist && (
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h2>Transform Your Space with Beautiful Plants</h2>
              <p>Discover our collection of premium houseplants, succulents, and flowering plants</p>
              <div className="search-filter">
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
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="price-filter">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Plant Grid */}
      {!showCart && !showCheckout && !showOrders && !showProfile && !showWishlist && (
        <section className="plants-section">
          <div className="container">
            <div className="plants-grid">
              {filteredPlants.map(plant => (
                <div key={plant.id} className="plant-card">
                  <div className="plant-image">
                    <img src={plant.image_url} alt={plant.name} />
                    <div className="plant-overlay">
                      <button 
                        className="overlay-btn view-btn"
                        onClick={() => showPlantDetails(plant)}
                      >
                        View Details
                      </button>
                      <button 
                        className="overlay-btn add-btn"
                        onClick={() => addToCart(plant)}
                      >
                        Add to Cart
                      </button>
                      <button 
                        className={`overlay-btn wishlist-btn ${isInWishlist(plant.id) ? 'in-wishlist' : ''}`}
                        onClick={() => isInWishlist(plant.id) ? removeFromWishlist(plant.id) : addToWishlist(plant)}
                      >
                        {isInWishlist(plant.id) ? '💖' : '🤍'}
                      </button>
                    </div>
                  </div>
                  <div className="plant-info">
                    <h3>{plant.name}</h3>
                    <div className="plant-rating">
                      {renderStars(plant.average_rating)}
                      <span className="rating-count">({plant.total_reviews})</span>
                    </div>
                    <p className="plant-price">${plant.price}</p>
                    <p className="plant-category">{plant.category}</p>
                    <p className="plant-description">{plant.description.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Plant Details Modal */}
      {showReviews && selectedPlant && (
        <div className="modal-overlay" onClick={() => setShowReviews(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowReviews(false)}>×</button>
            <div className="plant-details">
              <div className="plant-details-left">
                <img src={selectedPlant.image_url} alt={selectedPlant.name} className="plant-detail-image" />
              </div>
              <div className="plant-details-right">
                <h2>{selectedPlant.name}</h2>
                <div className="plant-rating">
                  {renderStars(selectedPlant.average_rating)}
                  <span className="rating-count">({selectedPlant.total_reviews} reviews)</span>
                </div>
                <p className="plant-price">${selectedPlant.price}</p>
                <p className="plant-description">{selectedPlant.description}</p>
                <div className="plant-care">
                  <h4>Care Instructions:</h4>
                  <p>{selectedPlant.care_instructions}</p>
                  <h4>Sunlight Requirements:</h4>
                  <p>{selectedPlant.sunlight_requirements}</p>
                </div>
                <div className="plant-actions">
                  <button className="btn btn-primary" onClick={() => addToCart(selectedPlant)}>
                    Add to Cart
                  </button>
                  <button 
                    className={`btn btn-secondary ${isInWishlist(selectedPlant.id) ? 'in-wishlist' : ''}`}
                    onClick={() => isInWishlist(selectedPlant.id) ? removeFromWishlist(selectedPlant.id) : addToWishlist(selectedPlant)}
                  >
                    {isInWishlist(selectedPlant.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="reviews-section">
              <h3>Customer Reviews</h3>
              
              {/* Add Review Form */}
              {currentUser && (
                <div className="review-form">
                  <h4>Write a Review</h4>
                  <div className="rating-input">
                    <label>Rating:</label>
                    <select 
                      value={reviewForm.rating} 
                      onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                    >
                      {[5,4,3,2,1].map(num => (
                        <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="Share your experience with this plant..."
                    className="review-textarea"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => submitReview(selectedPlant.id)}
                  >
                    Submit Review
                  </button>
                </div>
              )}
              
              {/* Reviews List */}
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <strong>{review.user_name}</strong>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="modal-overlay" onClick={() => setShowCart(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCart(false)}>×</button>
            <h2>Shopping Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image_url} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>${item.price}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Subtotal: ${getSubtotal().toFixed(2)}</h3>
                  <button 
                    className="checkout-btn"
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Modal */}
      {showWishlist && (
        <div className="modal-overlay" onClick={() => setShowWishlist(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowWishlist(false)}>×</button>
            <h2>My Wishlist</h2>
            {wishlist.length === 0 ? (
              <p>Your wishlist is empty</p>
            ) : (
              <div className="wishlist-items">
                {wishlist.map(item => (
                  <div key={item.id} className="wishlist-item">
                    <img src={item.image_url} alt={item.name} className="wishlist-item-image" />
                    <div className="wishlist-item-info">
                      <h4>{item.name}</h4>
                      <p>${item.price}</p>
                      <div className="wishlist-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => addToCart(item)}
                        >
                          Add to Cart
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrders && (
        <div className="modal-overlay" onClick={() => setShowOrders(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowOrders(false)}>×</button>
            <h2>My Orders</h2>
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.order_id} className="order-item">
                    <div className="order-header">
                      <h4>Order #{order.order_id.substring(0, 8)}</h4>
                      <span className={`order-status ${order.order_status}`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </div>
                    <div className="order-details">
                      <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                      <p><strong>Total:</strong> ${order.total_amount}</p>
                      <p><strong>Items:</strong> {order.items?.length || 0} items</p>
                    </div>
                    <div className="order-items">
                      {order.items?.map((item, index) => (
                        <div key={index} className="order-item-detail">
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
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowProfile(false)}>×</button>
            <h2>My Profile</h2>
            <div className="profile-info">
              <div className="profile-field">
                <label>Email:</label>
                <p>{currentUser?.email}</p>
              </div>
              <div className="profile-field">
                <label>Name:</label>
                <p>{currentUser?.first_name} {currentUser?.last_name}</p>
              </div>
              <div className="profile-field">
                <label>Phone:</label>
                <p>{currentUser?.phone || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Address:</label>
                <p>{currentUser?.address || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>City, State:</label>
                <p>{currentUser?.city || 'Not provided'}, {currentUser?.state || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>ZIP Code:</label>
                <p>{currentUser?.zip_code || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCheckout(false)}>×</button>
            <h2>Checkout</h2>
            <div className="checkout-content">
              <div className="checkout-left">
                <h3>Shipping Information</h3>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingInfo.zip_code}
                    onChange={(e) => setShippingInfo({...shippingInfo, zip_code: e.target.value})}
                  />
                </div>
                
                <h3>Discount Code</h3>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <button onClick={validateDiscountCode}>Apply</button>
                </div>
              </div>
              
              <div className="checkout-right">
                <h3>Order Summary</h3>
                {cart.map(item => (
                  <div key={item.id} className="checkout-item">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                {orderTotal && (
                  <div className="order-totals">
                    <div className="total-line">
                      <span>Subtotal:</span>
                      <span>${orderTotal.subtotal}</span>
                    </div>
                    <div className="total-line">
                      <span>Tax:</span>
                      <span>${orderTotal.tax_amount}</span>
                    </div>
                    <div className="total-line">
                      <span>Shipping:</span>
                      <span>${orderTotal.shipping_cost}</span>
                    </div>
                    {orderTotal.discount_amount > 0 && (
                      <div className="total-line discount">
                        <span>Discount:</span>
                        <span>-${orderTotal.discount_amount}</span>
                      </div>
                    )}
                    <div className="total-line final-total">
                      <span>Total:</span>
                      <span>${orderTotal.total}</span>
                    </div>
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
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAuth(false)}>×</button>
            <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData);
              handleAuth(data);
            }}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                />
              </div>
              {authMode === 'register' && (
                <>
                  <div className="form-group">
                    <input
                      type="text"
                      name="first_name"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone (optional)"
                    />
                  </div>
                </>
              )}
              <button type="submit" className="auth-submit-btn">
                {authMode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
            <button 
              className="auth-toggle-btn"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="footer">
        <div>
          &copy; {new Date().getFullYear()} Green Haven Nursery &mdash; Crafted with 🌱 by <a href="mailto:your@email.com">Jathin</a>
          &nbsp;|&nbsp;
          <a href="https://github.com/pjathin021" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default App;