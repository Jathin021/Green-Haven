import React, { useState, useEffect } from 'react';
import PayPalCheckout from './PayPalCheckout';
import './App.css';

const App = () => {
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [orderTotal, setOrderTotal] = useState(null);
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
    }
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/plants`);
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

  const filterPlants = () => {
    return plants.filter(plant => {
      const matchesCategory = !selectedCategory || plant.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
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
      } else {
        alert('Authentication failed');
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

  useEffect(() => {
    if (showCheckout) {
      calculateOrderTotal();
    }
  }, [cart, shippingInfo, discountCode, showCheckout]);

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
                className={`nav-btn ${!showCart && !showCheckout ? 'active' : ''}`}
                onClick={() => { setShowCart(false); setShowCheckout(false); }}
              >
                Plants
              </button>
              <button 
                className={`nav-btn cart-btn ${showCart ? 'active' : ''}`}
                onClick={() => { setShowCart(true); setShowCheckout(false); }}
              >
                Cart ({getTotalItems()})
              </button>
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
      {!showCart && !showCheckout && (
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
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Plant Grid */}
      {!showCart && !showCheckout && (
        <section className="plants-section">
          <div className="container">
            <div className="plants-grid">
              {filteredPlants.map(plant => (
                <div key={plant.id} className="plant-card">
                  <div className="plant-image">
                    <img src={plant.image_url} alt={plant.name} />
                    <div className="plant-overlay">
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedPlant(plant)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="plant-info">
                    <h3>{plant.name}</h3>
                    <p className="price">${plant.price}</p>
                    <p className="category">{plant.category}</p>
                    <p className="stock">Stock: {plant.stock_quantity}</p>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(plant)}
                      disabled={plant.stock_quantity === 0}
                    >
                      {plant.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cart View */}
      {showCart && !showCheckout && (
        <section className="cart-section">
          <div className="container">
            <h2>Shopping Cart</h2>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <button 
                  className="continue-shopping-btn"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="cart-content">
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image_url} alt={item.name} />
                      <div className="item-details">
                        <h3>{item.name}</h3>
                        <p className="price">${item.price}</p>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <div className="item-total">
                        <p>${(item.price * item.quantity).toFixed(2)}</p>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <h3>Order Summary</h3>
                  <p>Subtotal: ${getSubtotal().toFixed(2)}</p>
                  <p>Shipping: {getSubtotal() > 50 ? 'FREE' : '$8.99'}</p>
                  <hr />
                  <p className="total">Total: ${(getSubtotal() + (getSubtotal() > 50 ? 0 : 8.99)).toFixed(2)}</p>
                  <button 
                    className="checkout-btn"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Checkout View */}
      {showCheckout && (
        <section className="checkout-section">
          <div className="container">
            <h2>Checkout</h2>
            <div className="checkout-content">
              <div className="checkout-form">
                <h3>Shipping Information</h3>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingInfo.zip_code}
                    onChange={(e) => setShippingInfo({...shippingInfo, zip_code: e.target.value})}
                  />
                </div>
                
                <h3>Discount Code</h3>
                <div className="discount-section">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <button onClick={validateDiscountCode}>Apply</button>
                </div>
              </div>
              
              <div className="order-summary">
                <h3>Order Summary</h3>
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {orderTotal && (
                  <div className="totals">
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
                <button 
                  className="payment-btn"
                  onClick={() => alert('Payment integration coming in Phase 2!')}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Plant Detail Modal */}
      {selectedPlant && (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPlant(null)}>×</button>
            <div className="plant-detail">
              <img src={selectedPlant.image_url} alt={selectedPlant.name} />
              <div className="plant-detail-info">
                <h2>{selectedPlant.name}</h2>
                <p className="price">${selectedPlant.price}</p>
                <p className="description">{selectedPlant.description}</p>
                <div className="care-info">
                  <h3>Care Instructions</h3>
                  <p>{selectedPlant.care_instructions}</p>
                  <h3>Sunlight Requirements</h3>
                  <p>{selectedPlant.sunlight_requirements}</p>
                </div>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => {
                    addToCart(selectedPlant);
                    setSelectedPlant(null);
                  }}
                  disabled={selectedPlant.stock_quantity === 0}
                >
                  {selectedPlant.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAuth(false)}>×</button>
            <div className="auth-content">
              <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
              <AuthForm 
                mode={authMode}
                onSubmit={handleAuth}
                onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthForm = ({ mode, onSubmit, onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {mode === 'register' && (
        <div className="form-row">
          <input
            type="text"
            placeholder="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            required
          />
        </div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      <button type="submit" className="auth-submit-btn">
        {mode === 'login' ? 'Login' : 'Register'}
      </button>
      <p className="auth-toggle">
        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={onToggleMode}>
          {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </p>
    </form>
  );
};

export default App;