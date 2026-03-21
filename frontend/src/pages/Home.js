import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiStar, FiShield, FiTruck, FiAward, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Home.css';
import { useWishlist } from '../context/WishlistContext';
// Home.js top la existing imports nantar he add kar:
import { productCardImage, saleBannerImage } from '../utils/imageHelper';

// ============================================
// HERO SLIDER DATA
// ============================================
const heroSlides = [
  {
    id: 1,
    title: "Luxury Perfumes",
    subtitle: "PREMIUM COLLECTION",
    description: "Discover our exquisite collection of premium perfumes crafted from the finest ingredients. Long-lasting fragrances that define elegance.",
    cta: "Explore Perfumes",
    link: "/perfumes",
    image: "/images/hero/mavlahero.jpeg",
    color: "#1a1a2e"
  },
  {
    id: 2,
    title: "Traditional Attars",
    subtitle: "AUTHENTIC HERITAGE",
    description: "Experience the rich tradition of authentic attars. Alcohol-free, pure oil-based fragrances with incredible longevity and depth.",
    cta: "Explore Attars",
    link: "/attars",
    image: "/images/hero/atter2.png",
    color: "#2d1b4e"
  },
  {
    id: 3,
    title: "Fresh Body Mists",
    subtitle: "EVERYDAY FRESHNESS",
    description: "Stay fresh all day with our refreshing body mists. Light, uplifting scents perfect for everyday wear and active lifestyles.",
    cta: "Explore Body Mists",
    link: "/bodymists",
    image: "/images/hero/nude.jpeg",
    color: "#1b3a4b"
  }
];

// ============================================
// HERO SLIDER COMPONENT
// ============================================
const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[current];

  return (
    <section className="hero-section" style={{ background: slide.color }}>
      <Container>
        <Row className="align-items-center hero-row">
          {/* Left Side - Text */}
          <Col lg={6} className="hero-text-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hero-text-wrapper"
              >
                <motion.span
                  className="hero-subtitle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {slide.subtitle}
                </motion.span>

                <motion.h1
                  className="hero-title"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  className="hero-description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link to={slide.link} className="hero-cta-btn">
                    {slide.cta}
                    <FiArrowRight className="cta-arrow" />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </Col>

          {/* Right Side - Image */}
          <Col lg={6} className="hero-image-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                className="hero-image-wrapper"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="hero-image-glow"></div>
                <img src={slide.image} alt={slide.title} className="hero-image" />
              </motion.div>
            </AnimatePresence>
          </Col>
        </Row>

        {/* Slider Dots */}
        <div className="hero-dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === current ? 'active' : ''}`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </Container>

      {/* Decorative Elements */}
      <div className="hero-decoration hero-dec-1"></div>
      <div className="hero-decoration hero-dec-2"></div>
    </section>
  );
};

// ============================================
// CATEGORIES SECTION
// ============================================
const CategoriesSection = () => {
  const categories = [
    {
      name: "Perfumes",
      slug: "/perfumes",
      description: "Premium luxury fragrances",
      image: "/images/hero/mavlahero.jpeg",
      count: "6+ Products"
    },
    {
      name: "Attars",
      slug: "/attars",
      description: "Traditional oil-based scents",
      image: "/images/hero/atter2.png",
      count: "5+ Products"
    },
    {
      name: "Body Mists",
      slug: "/bodymists",
      description: "Refreshing everyday sprays",
      image: "/images/hero/nude.jpeg",
      count: "6+ Products"
    }
  ];

  return (
    <section className="categories-section section-padding">
      <Container>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">CATEGORIES</span>
          <h2 className="section-title">Shop by Category</h2>
          <div className="section-divider"></div>
        </motion.div>

        <Row className="g-4 mt-2">
          {categories.map((cat, index) => (
            <Col lg={4} md={6} key={cat.name}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <Link to={cat.slug} className="category-card">
                  <div className="category-image-wrapper">
                    <img src={cat.image} alt={cat.name} />
                    <div className="category-overlay">
                      <span className="category-explore">
                        Explore <FiArrowRight />
                      </span>
                    </div>
                  </div>
                  <div className="category-info">
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                    <span className="category-count">{cat.count}</span>
                  </div>
                </Link>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// ============================================
// FEATURED PRODUCTS SECTION
// ============================================
const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await api.get('/products/featured?limit=8');
      setProducts(res.data);
    } catch (error) {
      console.log('Using sample data');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const getDiscountPercent = (price, discountPrice) => {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  return (
    <section className="featured-section section-padding">
      <Container>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">BESTSELLERS</span>
          <h2 className="section-title">Featured Products</h2>
          <div className="section-divider"></div>
          <p className="section-subtitle">Handpicked premium fragrances loved by our customers</p>
        </motion.div>

        {loading ? (
          <div className="loading-wrapper">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading products...</p>
          </div>
        ) : (
          <Row className="g-4 mt-2">
            {products.map((product, index) => (
              <Col xl={3} lg={4} md={6} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="product-card">
                    {/* Image */}
                    <Link to={`/product/${product.id}`}>
                      <div className="product-image-wrapper">
                        <img
                          src={productCardImage(product.image_url)}
                          alt={product.name}
                        />
                        {product.discount_price && (
                          <span className="product-badge">
                            -{getDiscountPercent(product.price, product.discount_price)}%
                          </span>
                        )}
                        <div className="product-actions">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <FiHeart />
                          </motion.button>
                        </div>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="product-info">
                      <span className="product-brand">{product.brand || 'URBUNFY'}</span>
                      <Link to={`/product/${product.id}`}>
                        <h4 className="product-name">{product.name}</h4>
                      </Link>

                      {/* Rating */}
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`star ${star <= Math.round(product.rating || 4) ? '' : 'empty'}`}
                            fill={star <= Math.round(product.rating || 4) ? '#ffc107' : 'none'}
                          />
                        ))}
                        <span className="rating-count">({product.total_reviews || 0})</span>
                      </div>

                      {/* Price */}
                      <div className="product-price-wrapper">
                        <span className="product-price">
                          ₹{product.discount_price || product.price}
                        </span>
                        {product.discount_price && (
                          <span className="product-original-price">₹{product.price}</span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <motion.button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiShoppingBag /> Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}

        {/* View All Button */}
        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link to="/perfumes" className="btn-secondary-custom">
            View All Products <FiArrowRight />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
};

// ============================================
// WHY CHOOSE US SECTION
// ============================================
const WhyChooseUs = () => {
  const features = [
    {
      icon: <FiAward />,
      title: "Premium Quality",
      description: "100% authentic fragrances sourced from the finest ingredients worldwide."
    },
    {
      icon: <FiTruck />,
      title: "Free Shipping",
      description: "Free delivery on all orders above ₹999. Fast and secure shipping."
    },
    {
      icon: <FiShield />,
      title: "Secure Payment",
      description: "Multiple payment options with 100% secure checkout process."
    },
    {
      icon: <FiStar />,
      title: "Customer Love",
      description: "Thousands of happy customers. 4.8★ average rating across all products."
    }
  ];

  return (
    <section className="why-section section-padding">
      <Container>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">WHY URBANFY</span>
          <h2 className="section-title">Why Choose Us</h2>
          <div className="section-divider"></div>
        </motion.div>

        <Row className="g-4 mt-3">
          {features.map((feature, index) => (
            <Col lg={3} md={6} key={index}>
              <motion.div
                className="why-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <div className="why-icon">{feature.icon}</div>
                <h4 className="why-title">{feature.title}</h4>
                <p className="why-description">{feature.description}</p>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// ============================================
// BANNER SECTION
// ============================================
const BannerSection = () => {
  return (
    <section className="banner-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <motion.div
              className="banner-content"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="banner-tag">LIMITED OFFER</span>
              <h2 className="banner-title">Get 20% Off on Your First Order</h2>
              <p className="banner-text">
                Use code <strong>WELCOME10</strong> at checkout and enjoy exclusive
                discounts on premium fragrances.
              </p>
              <Link to="/perfumes" className="hero-cta-btn">
                Shop Now <FiArrowRight className="cta-arrow" />
              </Link>
            </motion.div>
          </Col>
          <Col lg={6}>
            <motion.div
              className="banner-image-wrapper"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=400&fit=crop"
                alt="URBUNFY Offer"
                className="banner-image"
              />
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
// ============================================
// sale SECTION
// ============================================
const SaleBanner = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await api.get('/sales/active');
      setSales(res.data.sales || []);
    } catch (error) {
      console.log('No active sales');
    }
  };

  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    if (sales.length === 0) return;
    const timer = setInterval(() => {
      const newTimeLeft = {};
      sales.forEach(sale => {
        newTimeLeft[sale.id] = getTimeLeft(sale.end_date);
      });
      setTimeLeft(newTimeLeft);
    }, 1000);
    return () => clearInterval(timer);
  }, [sales]);

  if (sales.length === 0) return null;

  return (
    <section className="sale-banner-section">
      {sales.map((sale) => {
        const time = timeLeft[sale.id];
        if (!time) return null;

        return (
          <motion.div
            key={sale.id}
            className="sale-banner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Container>
              <div className="sale-banner-content">
                {sale.banner_image && (
                  <div className="sale-banner-image">
                    <img src={saleBannerImage(sale.banner_image)} alt={sale.name} />
                  </div>
                )}
                <div className="sale-banner-info">
                  <span className="sale-tag">🔥 LIMITED TIME OFFER</span>
                  <h2 className="sale-name">{sale.name}</h2>
                  <div className="sale-discount">
                    {sale.discount_type === 'percentage'
                      ? `${sale.discount_value}% OFF`
                      : `₹${sale.discount_value} OFF`
                    }
                  </div>
                  {sale.description && <p className="sale-desc">{sale.description}</p>}

                  <div className="sale-countdown">
                    <span className="countdown-label">Ends in:</span>
                    <div className="countdown-boxes">
                      <div className="countdown-box">
                        <span className="countdown-num">{String(time.days).padStart(2, '0')}</span>
                        <span className="countdown-unit">Days</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-box">
                        <span className="countdown-num">{String(time.hours).padStart(2, '0')}</span>
                        <span className="countdown-unit">Hours</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-box">
                        <span className="countdown-num">{String(time.minutes).padStart(2, '0')}</span>
                        <span className="countdown-unit">Mins</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-box">
                        <span className="countdown-num">{String(time.seconds).padStart(2, '0')}</span>
                        <span className="countdown-unit">Secs</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/perfumes" className="hero-cta-btn" style={{ marginTop: '20px' }}>
                    Shop Sale <FiArrowRight className="cta-arrow" />
                  </Link>
                </div>
              </div>
            </Container>
          </motion.div>
        );
      })}
    </section>
  );
};

// ============================================
// MAIN HOME COMPONENT
// ============================================
const Home = () => {
  return (
    <div className="home-page">
      <HeroSlider />
      <SaleBanner />
      <CategoriesSection />
      <FeaturedProducts />
      <BannerSection />
      <WhyChooseUs />
    </div>
  );
};

export default Home;