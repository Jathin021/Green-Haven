import React from 'react';

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
  setShowAuth,
}) => {
  return (
    <header className="bg-white shadow sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <span role="img" aria-label="logo">🌿</span> Green Haven Nursery
        </h1>
        <nav className="flex items-center gap-2 md:gap-4">
          <button
            className={`px-3 py-2 rounded hover:bg-green-100 transition font-medium ${!showCart && !showCheckout && !showOrders && !showProfile && !showWishlist ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
            onClick={resetToShopping}
          >
            Plants
          </button>
          <button
            className={`relative px-3 py-2 rounded hover:bg-green-100 transition font-medium ${showCart ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
            onClick={() => { setShowCart(true); setShowCheckout(false); setShowOrders(false); setShowProfile(false); setShowWishlist(false); }}
          >
            Cart
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-green-600 text-white rounded-full absolute -top-2 -right-2">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
          </button>
          {currentUser && (
            <>
              <button
                className={`relative px-3 py-2 rounded hover:bg-green-100 transition font-medium ${showWishlist ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                onClick={() => { setShowWishlist(true); setShowCart(false); setShowCheckout(false); setShowOrders(false); setShowProfile(false); fetchWishlist(); }}
              >
                Wishlist
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-pink-500 text-white rounded-full absolute -top-2 -right-2">{wishlist.length}</span>
              </button>
              <button
                className={`px-3 py-2 rounded hover:bg-green-100 transition font-medium ${showOrders ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                onClick={() => { setShowOrders(true); setShowCart(false); setShowCheckout(false); setShowProfile(false); setShowWishlist(false); fetchOrders(); }}
              >
                Orders
              </button>
              <button
                className={`px-3 py-2 rounded hover:bg-green-100 transition font-medium ${showProfile ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                onClick={() => { setShowProfile(true); setShowCart(false); setShowCheckout(false); setShowOrders(false); setShowWishlist(false); }}
              >
                Profile
              </button>
            </>
          )}
          {currentUser ? (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-gray-700 font-medium">Hi, {currentUser.first_name}!</span>
              <button onClick={logout} className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition text-sm font-semibold">Logout</button>
            </div>
          ) : (
            <button
              className="ml-4 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition font-semibold shadow"
              onClick={() => setShowAuth(true)}
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 