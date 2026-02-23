import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag, FiHeart, FiMinus, FiPlus, FiStar,
  FiTruck, FiShield, FiRefreshCw, FiCheck, FiChevronRight,
  FiUser, FiArrowRight
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import './ProductDetail.css';
import { useWishlist } from '../context/WishlistContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const wishlisted = product ? isInWishlist(product.id) : false;
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      fetchSimilar(res.data.id);
    } catch (error) {
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/similar?limit=4`);
      setSimilarProducts(res.data);
    } catch (error) {
      console.log('No similar products');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data.reviews);
      setAvgRating(res.data.average_rating);
      setTotalReviews(res.data.total_reviews);
    } catch (error) {
      console.log('No reviews yet');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please login to write a review');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews/', {
        product_id: parseInt(id),
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      toast.success('Review submitted successfully!');
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getDiscountPercent = () => {
    if (!product?.discount_price) return 0;
    return Math.round(((product.price - product.discount_price) / product.price) * 100);
  };

  if (loading) {
    return (
      <div className="loading-wrapper" style={{ minHeight: '60vh' }}>
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <h3>Product Not Found</h3>
        <Link to="/" className="btn-primary-custom">Go Home</Link>
      </div>
    );
  }

  const currentPrice = product.discount_price || product.price;

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <Container>
          <div className="breadcrumb-links">
            <Link to="/">Home</Link>
            <FiChevronRight />
            <Link to={`/${product.category_name?.toLowerCase() || 'perfumes'}`}>
              {product.category_name || 'Products'}
            </Link>
            <FiChevronRight />
            <span>{product.name}</span>
          </div>
        </Container>
      </div>

      {/* Product Main Section */}
      <section className="product-main-section">
        <Container>
          <Row className="g-4 g-lg-5">
            {/* Left - Product Image */}
            <Col lg={6}>
              <motion.div
                className="product-gallery"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="main-image-wrapper">
                  {product.discount_price && (
                    <span className="detail-badge">-{getDiscountPercent()}% OFF</span>
                  )}
                  <motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      toast.success(`${product.name} added to wishlist!`, { icon: '💝' });
    } else {
      toast.info(`${product.name} removed from wishlist`);
    }
  }}
  style={{
    color: isInWishlist(product.id) ? '#e94560' : 'inherit',
    background: isInWishlist(product.id) ? '#fff0f3' : 'white'
  }}
>
  <FiHeart fill={isInWishlist(product.id) ? '#e94560' : 'none'} />
</motion.button>
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop'}
                    alt={product.name}
                    className="main-product-image"
                  />
                </div>
              </motion.div>
            </Col>

            {/* Right - Product Info */}
            <Col lg={6}>
              <motion.div
                className="product-detail-info"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Brand */}
                <span className="detail-brand">{product.brand || 'URBUNFY'}</span>

                {/* Name */}
                <h1 className="detail-name">{product.name}</h1>

                {/* Rating */}
                <div className="detail-rating">
                  <div className="detail-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className="detail-star"
                        fill={star <= Math.round(avgRating || product.rating || 0) ? '#ffc107' : 'none'}
                        color={star <= Math.round(avgRating || product.rating || 0) ? '#ffc107' : '#ddd'}
                      />
                    ))}
                  </div>
                  <span className="detail-rating-text">
                    {(avgRating || product.rating || 0).toFixed(1)} ({totalReviews || product.total_reviews || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="detail-price-section">
                  <span className="detail-current-price">₹{currentPrice}</span>
                  {product.discount_price && (
                    <>
                      <span className="detail-original-price">₹{product.price}</span>
                      <span className="detail-discount-tag">
                        {getDiscountPercent()}% OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="detail-tax-info">Inclusive of all taxes</p>

                {/* Short Description */}
                <p className="detail-short-desc">
                  {product.short_description || product.description?.substring(0, 150)}
                </p>

                {/* Product Meta */}
                <div className="detail-meta">
                  {product.volume && (
                    <div className="meta-item">
                      <span className="meta-label">Volume</span>
                      <span className="meta-value">{product.volume}</span>
                    </div>
                  )}
                  {product.gender && (
                    <div className="meta-item">
                      <span className="meta-label">Gender</span>
                      <span className="meta-value">
                        {product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}
                      </span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Category</span>
                    <span className="meta-value">{product.category_name || 'Perfume'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Availability</span>
                    <span className={`meta-value ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                {product.stock > 0 && (
                  <div className="detail-actions">
                    <div className="quantity-selector">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange('decrease')}
                        disabled={quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className="qty-value">{quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange('increase')}
                        disabled={quantity >= product.stock}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <motion.button
                      className="detail-add-cart-btn"
                      onClick={handleAddToCart}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiShoppingBag /> Add to Cart
                    </motion.button>

                    <motion.button
                      className="detail-buy-now-btn"
                      onClick={handleBuyNow}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Buy Now
                    </motion.button>
                  </div>
                )}

                {/* Features */}
                <div className="detail-features">
                  <div className="detail-feature">
                    <FiTruck />
                    <div>
                      <strong>Free Delivery</strong>
                      <span>On orders above ₹999</span>
                    </div>
                  </div>
                  <div className="detail-feature">
                    <FiShield />
                    <div>
                      <strong>100% Authentic</strong>
                      <span>Genuine products only</span>
                    </div>
                  </div>
                  <div className="detail-feature">
                    <FiRefreshCw />
                    <div>
                      <strong>Easy Returns</strong>
                      <span>7 days return policy</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Tabs Section */}
      <section className="product-tabs-section">
        <Container>
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({totalReviews || 0})
            </button>
          </div>

          <div className="tabs-content">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="tab-pane"
                >
                  <div className="description-content">
                    <p>{product.description || 'No description available.'}</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="tab-pane"
                >
                  <Row>
                    {/* Reviews List */}
                    <Col lg={7}>
                      <div className="reviews-list">
                        <h4 className="reviews-title">
                          Customer Reviews ({totalReviews})
                        </h4>

                        {/* Rating Summary */}
                        <div className="rating-summary">
                          <div className="rating-big">
                            <span className="rating-number">{avgRating.toFixed(1)}</span>
                            <div className="rating-big-stars">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                  key={star}
                                  fill={star <= Math.round(avgRating) ? '#ffc107' : 'none'}
                                  color={star <= Math.round(avgRating) ? '#ffc107' : '#ddd'}
                                />
                              ))}
                            </div>
                            <span className="rating-total">{totalReviews} reviews</span>
                          </div>
                        </div>

                        {reviews.length === 0 ? (
                          <div className="no-reviews">
                            <p>No reviews yet. Be the first to review!</p>
                          </div>
                        ) : (
                          reviews.map((review) => (
                            <div key={review.id} className="review-card">
                              <div className="review-header">
                                <div className="review-user">
                                  <div className="review-avatar">
                                    <FiUser />
                                  </div>
                                  <div>
                                    <h6 className="review-user-name">{review.user_name}</h6>
                                    <div className="review-stars-small">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <FiStar
                                          key={star}
                                          size={12}
                                          fill={star <= review.rating ? '#ffc107' : 'none'}
                                          color={star <= review.rating ? '#ffc107' : '#ddd'}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="review-date">
                                  {new Date(review.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              {review.title && (
                                <h6 className="review-title-text">{review.title}</h6>
                              )}
                              <p className="review-comment">{review.comment}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </Col>

                    {/* Write Review Form */}
                    <Col lg={5}>
                      <div className="write-review">
                        <h4 className="reviews-title">Write a Review</h4>

                        {!isAuthenticated ? (
                          <div className="login-to-review">
                            <p>Please login to write a review</p>
                            <Link to="/login" className="btn-primary-custom">
                              Login
                            </Link>
                          </div>
                        ) : (
                          <form onSubmit={handleReviewSubmit} className="review-form">
                            {/* Rating */}
                            <div className="form-group-review">
                              <label>Your Rating</label>
                              <div className="rating-selector">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    className="rating-select-star"
                                    onClick={() => setReviewRating(star)}
                                  >
                                    <FiStar
                                      size={24}
                                      fill={star <= reviewRating ? '#ffc107' : 'none'}
                                      color={star <= reviewRating ? '#ffc107' : '#ddd'}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Title */}
                            <div className="form-group-review">
                              <label>Review Title</label>
                              <input
                                type="text"
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                placeholder="Give your review a title"
                                className="review-input"
                              />
                            </div>

                            {/* Comment */}
                            <div className="form-group-review">
                              <label>Your Review</label>
                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Write your review here..."
                                className="review-textarea"
                                rows={4}
                              />
                            </div>

                            <motion.button
                              type="submit"
                              className="submit-review-btn"
                              disabled={submitting}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {submitting ? 'Submitting...' : 'Submit Review'}
                            </motion.button>
                          </form>
                        )}
                      </div>
                    </Col>
                  </Row>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="similar-section section-padding">
          <Container>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-tag">YOU MAY ALSO LIKE</span>
              <h2 className="section-title">Similar Products</h2>
              <div className="section-divider"></div>
            </motion.div>

            <Row className="g-4 mt-2">
              {similarProducts.map((prod, index) => (
                <Col xl={3} lg={4} md={6} key={prod.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SimilarProductCard product={prod} />
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
};

// ============================================
// SIMILAR PRODUCT CARD
// ============================================
const SimilarProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-image-wrapper">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'}
            alt={product.name}
          />
          {product.discount_price && (
            <span className="product-badge">
              -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
            </span>
          )}
        </div>
      </Link>
      <div className="product-info">
        <span className="product-brand">{product.brand || 'URBUNFY'}</span>
        <Link to={`/product/${product.id}`}>
          <h4 className="product-name">{product.name}</h4>
        </Link>
        <div className="product-price-wrapper">
          <span className="product-price">₹{product.discount_price || product.price}</span>
          {product.discount_price && (
            <span className="product-original-price">₹{product.price}</span>
          )}
        </div>
        <motion.button
          className="add-to-cart-btn"
          onClick={handleAdd}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiShoppingBag /> Add to Cart
        </motion.button>
      </div>
    </div>
  );
};

export default ProductDetail;