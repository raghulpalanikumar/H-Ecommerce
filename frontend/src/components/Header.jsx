import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiSearch, FiLogOut, FiX, FiHome, FiPackage } from 'react-icons/fi';
import '../styles/header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="modern-header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <div className="logo-wrapper">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                <line x1="5" y1="18" x2="19" y2="18" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="20" r="0.5" fill="currentColor" />
              </svg>
              <div className="logo-text-wrapper">
                <span className="logo-text">Modern Mobiles</span>
                <span className="logo-tagline">Premium Accessories</span>
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="header-search-form">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="header-nav">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <FiHome />
              <span>Home</span>
            </Link>
            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
              <FiPackage />
              <span>Products</span>
            </Link>
            <Link to="/wishlist" className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`} title="Wishlist">
              <FiHeart />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="nav-badge">{wishlist.length}</span>
              )}
            </Link>
            <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`} title="Cart">
              <FiShoppingCart />
              <span>Cart</span>
              {getCartItemsCount() > 0 && (
                <span className="nav-badge">{getCartItemsCount()}</span>
              )}
            </Link>
          </nav>

          {/* Actions */}
          <div className="header-actions">

            {/* User Menu */}
            {user ? (
              <div ref={userMenuRef} className="user-menu-wrapper">
                <button
                  className="action-btn user-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <FiUser />
                  <span className="action-label">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="user-dropdown-body">
                      <Link
                        to="/dashboard"
                        className="dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiUser />
                        <span>My Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item logout-item"
                      >
                        <FiLogOut />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">
                  Login
                </Link>
                <Link to="/register" className="btn-register">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="mobile-search-form">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link
              to="/"
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <FiHome />
              <span>Home</span>
            </Link>
            <Link
              to="/products"
              className={`mobile-nav-link ${isActive('/products') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <FiPackage />
              <span>Products</span>
            </Link>
            <Link
              to="/wishlist"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <FiHeart />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="mobile-badge">{wishlist.length}</span>
              )}
            </Link>
            <Link
              to="/cart"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <FiShoppingCart />
              <span>Cart</span>
              {getCartItemsCount() > 0 && (
                <span className="mobile-badge">{getCartItemsCount()}</span>
              )}
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FiUser />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="mobile-nav-link logout-link"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;