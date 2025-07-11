import React, { useState } from 'react';

const Header = ({
  currentUser,
  showCart,
  showCheckout,
  showOrders,
  showProfile,
  showWishlist,
  wishlist,
  cart,
  resetToShopping,
  setShowCart,
  setShowCheckout,
  setShowOrders,
  setShowProfile,
  setShowWishlist,
  fetchWishlist,
  fetchOrders,
  logout,
  setShowAuth
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); resetToShopping(); }}>
          <span className="logo-icon">🌱</span>
          <span>Green Haven</span>
        </a>

        {/* Mobile Menu Button */}
        <button 
          className="nav-btn md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Desktop Navigation */}
        <nav className={`nav-actions ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
          {/* Shopping Cart */}
          <button
            className={`nav-btn ${showCart ? 'primary' : 'secondary'}`}
            onClick={() => setShowCart(true)}
            disabled={showCheckout || showOrders || showProfile || showWishlist}
          >
            🛒 Cart
            {getTotalItems() > 0 && (
              <span className="badge">{getTotalItems()}</span>
            )}
          </button>

          {/* Wishlist */}
          <button
            className={`nav-btn ${showWishlist ? 'primary' : 'secondary'}`}
            onClick={() => {
              setShowWishlist(true);
              fetchWishlist();
            }}
            disabled={showCart || showCheckout || showOrders || showProfile}
          >
            💖 Wishlist
            {wishlist.length > 0 && (
              <span className="badge">{wishlist.length}</span>
            )}
          </button>

          {/* User Menu */}
          {currentUser ? (
            <>
              {/* Orders */}
              <button
                className={`nav-btn ${showOrders ? 'primary' : 'secondary'}`}
                onClick={() => {
                  setShowOrders(true);
                  fetchOrders();
                }}
                disabled={showCart || showCheckout || showProfile || showWishlist}
              >
                📦 Orders
              </button>

              {/* Profile */}
              <button
                className={`nav-btn ${showProfile ? 'primary' : 'secondary'}`}
                onClick={() => setShowProfile(true)}
                disabled={showCart || showCheckout || showOrders || showWishlist}
              >
                👤 Profile
              </button>

              {/* Logout */}
              <button
                className="nav-btn danger"
                onClick={logout}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            /* Login/Register */
            <button
              className="nav-btn primary"
              onClick={() => setShowAuth(true)}
            >
              🔐 Login
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={toggleMobileMenu}
        >
          <div 
            className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-4 min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <button
                className={`nav-btn ${showCart ? 'primary' : 'secondary'} w-full justify-center`}
                onClick={() => {
                  setShowCart(true);
                  setIsMobileMenuOpen(false);
                }}
                disabled={showCheckout || showOrders || showProfile || showWishlist}
              >
                🛒 Cart ({getTotalItems()})
              </button>

              <button
                className={`nav-btn ${showWishlist ? 'primary' : 'secondary'} w-full justify-center`}
                onClick={() => {
                  setShowWishlist(true);
                  fetchWishlist();
                  setIsMobileMenuOpen(false);
                }}
                disabled={showCart || showCheckout || showOrders || showProfile}
              >
                💖 Wishlist ({wishlist.length})
              </button>

              {currentUser ? (
                <>
                  <button
                    className={`nav-btn ${showOrders ? 'primary' : 'secondary'} w-full justify-center`}
                    onClick={() => {
                      setShowOrders(true);
                      fetchOrders();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={showCart || showCheckout || showProfile || showWishlist}
                  >
                    📦 Orders
                  </button>

                  <button
                    className={`nav-btn ${showProfile ? 'primary' : 'secondary'} w-full justify-center`}
                    onClick={() => {
                      setShowProfile(true);
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={showCart || showCheckout || showOrders || showWishlist}
                  >
                    👤 Profile
                  </button>

                  <button
                    className="nav-btn danger w-full justify-center"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <button
                  className="nav-btn primary w-full justify-center"
                  onClick={() => {
                    setShowAuth(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  🔐 Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 