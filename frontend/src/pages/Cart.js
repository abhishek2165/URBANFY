import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMinus, FiPlus, FiTrash2, FiShoppingBag,
  FiArrowLeft, FiArrowRight, FiTag, FiTruck, FiShield
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Cart.css';
// Cart.js - TOP la existing imports nantar he add kar:
import { cartImage } from '../utils/imageHelper';
const Cart = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, currentQty, type) => {
    if (type === 'increase') {
      updateQuantity(productId, currentQty + 1);
    } else if (type === 'decrease') {
      if (currentQty <= 1) {
        removeFromCart(productId);
        toast.info('Item removed from cart');
      } else {
        updateQuantity(productId, currentQty - 1);
      }
    }
  };

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    toast.info(`${productName} removed from cart`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Cart cleared');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please login to continue checkout');
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  // Calculations
  const subtotal = cartTotal;
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;
  const savings = cartItems.reduce((sum, item) => {
    if (item.discount_price) {
      return sum + (item.price - item.discount_price) * item.quantity;
    }
    return sum;
  }, 0);

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="page-header">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1>Shopping Cart</h1>
              <p>Your cart is waiting to be filled</p>
            </motion.div>
          </Container>
        </div>

        <Container>
          <motion.div
            className="empty-cart"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-cart-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/perfumes" className="btn-primary-custom">
              <FiShoppingBag /> Start Shopping
            </Link>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Page Header */}
      <div className="page-header">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Shopping Cart</h1>
            <p>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</p>
            <div className="breadcrumb-custom">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Cart</span>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="cart-container">
        <Row className="g-4">
          {/* Cart Items */}
          <Col lg={8}>
            <motion.div
              className="cart-items-wrapper"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Cart Header */}
              <div className="cart-items-header">
                <h4>Cart Items ({cartCount})</h4>
                <button className="clear-cart-btn" onClick={handleClearCart}>
                  <FiTrash2 /> Clear Cart
                </button>
              </div>

              {/* Cart Items List */}
              <AnimatePresence>
                {cartItems.map((item, index) => {
                  const itemPrice = item.discount_price || item.price;
                  const itemTotal = itemPrice * item.quantity;
                  const hasDiscount = item.discount_price && item.discount_price < item.price;

                  return (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      layout
                    >
                      {/* Product Image */}
                      <Link to={`/product/${item.id}`} className="cart-item-image">
                        <img
    src={cartImage(item.image_url)}
    alt={item.name}
    loading="lazy"
    onError={(e) => {
      e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop';
    }}
/>
                      </Link>

                      {/* Product Details */}
                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <div>
                            <span className="cart-item-brand">{item.brand || 'URBUNFY'}</span>
                            <Link to={`/product/${item.id}`}>
                              <h5 className="cart-item-name">{item.name}</h5>
                            </Link>
                            {item.volume && (
                              <span className="cart-item-volume">{item.volume}</span>
                            )}
                          </div>
                          <motion.button
                            className="cart-item-remove"
                            onClick={() => handleRemove(item.id, item.name)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>

                        <div className="cart-item-bottom">
                          {/* Price */}
                          <div className="cart-item-price">
                            <span className="item-current-price">₹{itemPrice}</span>
                            {hasDiscount && (
                              <span className="item-original-price">₹{item.price}</span>
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="cart-quantity">
                            <button
                              className="cart-qty-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 'decrease')}
                            >
                              <FiMinus />
                            </button>
                            <span className="cart-qty-value">{item.quantity}</span>
                            <button
                              className="cart-qty-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 'increase')}
                            >
                              <FiPlus />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="cart-item-total">
                            <span>₹{itemTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Continue Shopping */}
              <div className="continue-shopping">
                <Link to="/perfumes" className="continue-btn">
                  <FiArrowLeft /> Continue Shopping
                </Link>
              </div>
            </motion.div>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <motion.div
              className="order-summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="summary-title">Order Summary</h4>

              {/* Price Breakdown */}
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {savings > 0 && (
                  <div className="summary-row savings">
                    <span>You Save</span>
                    <span>-₹{savings.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'free-shipping' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>

                {shipping > 0 && (
                  <p className="free-shipping-hint">
                    <FiTruck /> Add ₹{(999 - subtotal).toFixed(0)} more for free shipping
                  </p>
                )}

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                className="checkout-btn"
                onClick={handleCheckout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Proceed to Checkout <FiArrowRight />
              </motion.button>

              {/* Secure Checkout */}
              <div className="secure-checkout">
                <FiShield />
                <span>100% Secure Checkout</span>
              </div>

              {/* Payment Icons */}
              <div className="payment-info">
                <span>We Accept:</span>
                <div className="payment-icons-row">
                  <span className="pay-icon">💳 Cards</span>
                  <span className="pay-icon">📱 UPI</span>
                  <span className="pay-icon">💵 COD</span>
                </div>
              </div>
            </motion.div>

            {/* Free Shipping Banner */}
            <motion.div
              className="shipping-banner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FiTruck className="shipping-banner-icon" />
              <div>
                <strong>Free Shipping</strong>
                <p>On all orders above ₹999</p>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Cart;