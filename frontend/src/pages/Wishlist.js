import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiShoppingBag, FiTrash2, FiStar, FiArrowLeft
} from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    toast.success(`${product.name} moved to cart!`);
  };

  const handleRemove = (product) => {
    removeFromWishlist(product.id);
    toast.info(`${product.name} removed from wishlist`);
  };

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart(item, 1);
    });
    clearWishlist();
    toast.success('All items moved to cart!');
  };

  // Empty Wishlist
  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="page-header">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1>My Wishlist</h1>
              <p>Your wishlist is empty</p>
            </motion.div>
          </Container>
        </div>

        <Container>
          <motion.div
            className="empty-wishlist"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-wishlist-icon">💝</div>
            <h2>Your Wishlist is Empty</h2>
            <p>Save your favorite fragrances here for later</p>
            <Link to="/perfumes" className="btn-primary-custom">
              <FiShoppingBag /> Browse Products
            </Link>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* Page Header */}
      <div className="page-header">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>My Wishlist</h1>
            <p>{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved</p>
            <div className="breadcrumb-custom">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Wishlist</span>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="wishlist-container">
        {/* Action Buttons */}
        <div className="wishlist-actions">
          <Link to="/perfumes" className="wishlist-back-btn">
            <FiArrowLeft /> Continue Shopping
          </Link>
          <div className="wishlist-actions-right">
            <motion.button
              className="btn-secondary-custom"
              onClick={handleAddAllToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiShoppingBag /> Move All to Cart
            </motion.button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <Row className="g-4">
          <AnimatePresence>
            {wishlistItems.map((product, index) => (
              <Col xl={3} lg={4} md={6} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  layout
                >
                  <div className="wishlist-card">
                    {/* Remove Button */}
                    <motion.button
                      className="wishlist-remove-btn"
                      onClick={() => handleRemove(product)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiTrash2 />
                    </motion.button>

                    {/* Image */}
                    <Link to={`/product/${product.id}`}>
                      <div className="wishlist-image">
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'}
                          alt={product.name}
                        />
                        {product.discount_price && (
                          <span className="wishlist-badge">
                            -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="wishlist-info">
                      <span className="wishlist-brand">{product.brand || 'URBUNFY'}</span>
                      <Link to={`/product/${product.id}`}>
                        <h4 className="wishlist-name">{product.name}</h4>
                      </Link>

                      <div className="wishlist-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            size={12}
                            fill={star <= Math.round(product.rating || 0) ? '#ffc107' : 'none'}
                            color={star <= Math.round(product.rating || 0) ? '#ffc107' : '#ddd'}
                          />
                        ))}
                      </div>

                      <div className="wishlist-price">
                        <span className="wishlist-current-price">
                          ₹{product.discount_price || product.price}
                        </span>
                        {product.discount_price && (
                          <span className="wishlist-original-price">₹{product.price}</span>
                        )}
                      </div>

                      <motion.button
                        className="wishlist-cart-btn"
                        onClick={() => handleMoveToCart(product)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiShoppingBag /> Move to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      </Container>
    </div>
  );
};

export default Wishlist;