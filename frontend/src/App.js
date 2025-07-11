import React, { useState, useEffect } from 'react';
import PayPalCheckout from './PayPalCheckout';
import './App.css';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import WishlistModal from './components/WishlistModal';
import OrdersModal from './components/OrdersModal';
import ProfileModal from './components/ProfileModal';
import ReviewsSection from './components/ReviewsSection';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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
      showToast('Increased quantity in cart!');
    } else {
      setCart([...cart, { ...plant, quantity: 1 }]);
      showToast('Added to cart!');
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

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.access_token);
        setShowAuth(false);
        fetchWishlist();
        
        // Show success message
        showToast(data.message || (authMode === 'login' ? 'Welcome back!' : 'Account created successfully!'));
        
        // If it's a new user, show a welcome message
        if (authMode === 'register') {
          showToast('Welcome to Green Haven Nursery! 🎉', 'success');
        }
      } else {
        // Handle specific error messages from backend
        const errorMessage = data.detail || 'Authentication failed';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showToast('Network error. Please check your connection.', 'error');
      } else {
        showToast(error.message || 'Authentication failed. Please try again.', 'error');
      }
      throw error;
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
    showToast(`Payment successful! Order ID: ${paymentResult.order_id}`);
    alert(`Payment successful! Order ID: ${paymentResult.order_id}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    showToast('Payment failed. Please try again.', 'error');
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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 2500);
  };

  return (
    <div className="app">
      {/* Header */}
      <Header
        currentUser={currentUser}
        showCart={showCart}
        showCheckout={showCheckout}
        showOrders={showOrders}
        showProfile={showProfile}
        showWishlist={showWishlist}
        wishlist={wishlist}
        cart={cart}
        resetToShopping={resetToShopping}
        setShowCart={setShowCart}
        setShowCheckout={setShowCheckout}
        setShowOrders={setShowOrders}
        setShowProfile={setShowProfile}
        setShowWishlist={setShowWishlist}
        fetchWishlist={fetchWishlist}
        fetchOrders={fetchOrders}
        logout={logout}
        setShowAuth={setShowAuth}
      />

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
        <section className="plants-section py-8 bg-gray-50 min-h-[60vh]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPlants.map(plant => (
                <ProductCard
                  key={plant.id}
                  plant={plant}
                  onViewDetails={showPlantDetails}
                  onAddToCart={addToCart}
                  onToggleWishlist={isInWishlist(plant.id) ? removeFromWishlist : addToWishlist}
                  isInWishlist={isInWishlist}
                  renderStars={renderStars}
                />
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
            <ReviewsSection
              reviews={reviews}
              currentUser={currentUser}
              reviewForm={reviewForm}
              setReviewForm={setReviewForm}
              submitReview={submitReview}
              selectedPlant={selectedPlant}
              renderStars={renderStars}
            />
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal
        cart={cart}
        show={showCart}
        onClose={() => setShowCart(false)}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getSubtotal={getSubtotal}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
      />
      {/* Checkout Modal */}
      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        shippingInfo={shippingInfo}
        setShippingInfo={setShippingInfo}
        discountCode={discountCode}
        setDiscountCode={setDiscountCode}
        validateDiscountCode={validateDiscountCode}
        orderTotal={orderTotal}
        handlePaymentSuccess={handlePaymentSuccess}
        handlePaymentError={handlePaymentError}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        show={showWishlist}
        onClose={() => setShowWishlist(false)}
        wishlist={wishlist}
        addToCart={addToCart}
        removeFromWishlist={removeFromWishlist}
      />
      {/* Orders Modal */}
      <OrdersModal
        show={showOrders}
        onClose={() => setShowOrders(false)}
        orders={orders}
      />

      {/* Profile Modal */}
      <ProfileModal
        show={showProfile}
        onClose={() => setShowProfile(false)}
        currentUser={currentUser}
      />

      {/* Auth Modal */}
      <AuthModal
        show={showAuth}
        onClose={() => setShowAuth(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        handleAuth={handleAuth}
      />
      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      {/* Footer */}
      <footer className="footer">
        <div>
          &copy; {new Date().getFullYear()} Green Haven Nursery &mdash; Crafted with 🌱 by <a href="mailto:p.jathin021@gmail.com">Jathin</a>
          &nbsp;|&nbsp;
          <a href="https://github.com/pjathin021" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default App;