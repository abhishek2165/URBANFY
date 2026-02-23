import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar as BsNavbar, Badge, Dropdown } from 'react-bootstrap';
import { FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/perfumes?search=${searchQuery.trim()}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <Container>
          <div className="top-bar-content">
            <span>✨ Free Shipping on orders above ₹999</span>
            <span>📞 Call: 8999323926</span>
          </div>
        </Container>
      </div>

      {/* Main Navbar */}
      <nav className={`main-navbar ${scrolled ? 'scrolled' : ''}`}>
        <Container>
          <div className="navbar-wrapper">
            {/* Logo */}
            <Link to="/" className="navbar-brand-custom">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="brand-name">URBANFY</span>
                <span className="brand-tagline">Premium Fragrances</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-links-desktop">
              <Link to="/" className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/perfumes" className={`nav-link-custom ${isActive('/perfumes') ? 'active' : ''}`}>
                Perfumes
              </Link>
              <Link to="/attars" className={`nav-link-custom ${isActive('/attars') ? 'active' : ''}`}>
                Attars
              </Link>
              <Link to="/bodymists" className={`nav-link-custom ${isActive('/bodymists') ? 'active' : ''}`}>
                Body Mists
              </Link>
               <Link to="/about" className={`nav-link-custom ${isActive('/about') ? 'active' : ''}`}>
    About
  </Link>
            </div>

            {/* Right Icons */}
            <div className="nav-icons">
              {/* Search */}
              <motion.button
                className="nav-icon-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiSearch />
              </motion.button>


            {/* Wishlist */}
<motion.div
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
>
  <Link to="/wishlist" className="nav-icon-btn cart-icon">
    <FiHeart />
    {wishlistCount > 0 && (
      <motion.span
        className="cart-badge"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        key={wishlistCount}
        style={{ background: '#e94560' }}
      >
        {wishlistCount}
      </motion.span>
    )}
  </Link>
</motion.div>




              {/* Cart */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link to="/cart" className="nav-icon-btn cart-icon">
                  <FiShoppingBag />
                  {cartCount > 0 && (
                    <motion.span
                      className="cart-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={cartCount}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* User */}
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle as="button" className="nav-icon-btn user-btn">
                    <FiUser />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="user-dropdown">
                    <div className="user-dropdown-header">
                      <p className="user-name">{user?.first_name} {user?.last_name}</p>
                      <p className="user-email">{user?.email}</p>
                    </div>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/profile">
                      <FiUser className="dropdown-icon" /> My Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile">
                      <FiPackage className="dropdown-icon" /> My Orders
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="logout-item">
                      <FiLogOut className="dropdown-icon" /> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link to="/login" className="nav-icon-btn">
                    <FiUser />
                  </Link>
                </motion.div>
              )}

              {/* Mobile Toggle */}
              <button
                className="mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>
        </Container>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="search-bar-wrapper"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Container>
                <form onSubmit={handleSearch} className="search-form">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search perfumes, attars, body mists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="search-input"
                  />
                  <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
                    <FiX />
                  </button>
                </form>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="mobile-menu-header">
                <span className="brand-name">URBANFY</span>
                <button onClick={() => setMobileOpen(false)}>
                  <FiX />
                </button>
              </div>

              <div className="mobile-menu-links">
                <Link to="/" className={`mobile-link ${isActive('/') ? 'active' : ''}`}>
                  Home
                </Link>
                <Link to="/perfumes" className={`mobile-link ${isActive('/perfumes') ? 'active' : ''}`}>
                  Perfumes
                </Link>
                <Link to="/attars" className={`mobile-link ${isActive('/attars') ? 'active' : ''}`}>
                  Attars
                </Link>
                <Link to="/bodymists" className={`mobile-link ${isActive('/bodymists') ? 'active' : ''}`}>
                  Body Mists
                </Link>
                 <Link to="/about" className={`mobile-link ${isActive('/about') ? 'active' : ''}`}>
    About Us
  </Link>
                <Link to="/cart" className={`mobile-link ${isActive('/cart') ? 'active' : ''}`}>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="mobile-link">
                      My Profile
                    </Link>
                    <button className="mobile-link logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="mobile-link">
                      Login
                    </Link>
                    <Link to="/signup" className="mobile-link">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;