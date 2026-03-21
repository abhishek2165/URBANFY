import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiX, FiShoppingBag,
  FiHeart, FiStar, FiChevronDown, FiGrid, FiList, FiEye
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './ProductList.css';
import { useWishlist } from '../../context/WishlistContext';
import { productCardImage, productListImage } from '../../utils/imageHelper';

const ProductList = ({ categorySlug, categoryName, categoryDescription }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Filters
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [gender, setGender] = useState('');
  const [brand, setBrand] = useState('');
  const [volume, setVolume] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [categorySlug, currentPage, sort, gender, brand, volume]);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearch(urlSearch);
      fetchProducts(urlSearch);
    }
  }, [searchParams]);

  const fetchProducts = async (searchQuery = null) => {
    setLoading(true);
    try {
      let params = {
        page: currentPage,
        per_page: 12,
        sort: sort,
      };

      if (categorySlug) params.category = categorySlug;
      if (searchQuery || search) params.search = searchQuery || search;
      if (gender) params.gender = gender;
      if (brand) params.brand = brand;
      if (volume) params.volume = volume;
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);

      const res = await api.get('/products/', { params });
      setProducts(res.data.products);
      setTotalProducts(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handlePriceFilter = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearch('');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setGender('');
    setBrand('');
    setVolume('');
    setCurrentPage(1);
    setSearchParams({});
    setTimeout(() => fetchProducts(''), 100);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const getDiscountPercent = (price, discountPrice) => {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const hasActiveFilters = search || minPrice || maxPrice || gender || brand || volume || sort !== 'newest';

  return (
    <div className="product-list-page">
      {/* Page Header */}
      <div className="page-header">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>{categoryName}</h1>
            <p>{categoryDescription}</p>
            <div className="breadcrumb-custom">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>{categoryName}</span>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Sidebar Filters - Desktop */}
          <Col lg={3}>
            <motion.div
              className={`filter-sidebar ${filterOpen ? 'mobile-open' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="filter-header">
                <h5><FiFilter /> Filters</h5>
                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear All
                  </button>
                )}
                <button className="filter-close-mobile" onClick={() => setFilterOpen(false)}>
                  <FiX />
                </button>
              </div>

              {/* Search */}
              <div className="filter-group">
                <h6 className="filter-title">Search</h6>
                <form onSubmit={handleSearch} className="filter-search">
                  <FiSearch className="filter-search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="filter-search-input"
                  />
                </form>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h6 className="filter-title">Price Range</h6>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                  />
                  <span className="price-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
                <button className="apply-price-btn" onClick={handlePriceFilter}>
                  Apply
                </button>
              </div>

              {/* Gender Filter */}
              <div className="filter-group">
                <h6 className="filter-title">Gender</h6>
                <div className="filter-options">
                  {['', 'male', 'female', 'unisex'].map((g) => (
                    <label key={g || 'all'} className="filter-option">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === g}
                        onChange={() => { setGender(g); setCurrentPage(1); }}
                      />
                      <span className="filter-option-label">
                        {g === '' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Volume Filter */}
              <div className="filter-group">
                <h6 className="filter-title">Volume</h6>
                <div className="filter-options">
                  {[
                    { value: '', label: 'All Volumes' },
                    { value: '10ml', label: '10ml' },
                    { value: '20ml', label: '20ml' },
                    { value: '30ml', label: '30ml' },
                    { value: '50ml', label: '50ml' },
                    { value: '100ml', label: '100ml' },
                    { value: '150ml', label: '150ml' },
                    { value: '200ml', label: '200ml' },
                  ].map((v) => (
                    <label key={v.value || 'all'} className="filter-option">
                      <input
                        type="radio"
                        name="volume"
                        checked={volume === v.value}
                        onChange={() => { setVolume(v.value); setCurrentPage(1); }}
                      />
                      <span className="filter-option-label">{v.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Price Ranges */}
              <div className="filter-group">
                <h6 className="filter-title">Quick Filters</h6>
                <div className="quick-filters">
                  <button
                    className="quick-filter-btn"
                    onClick={() => { setMinPrice('0'); setMaxPrice('500'); handlePriceFilter(); }}
                  >
                    Under ₹500
                  </button>
                  <button
                    className="quick-filter-btn"
                    onClick={() => { setMinPrice('500'); setMaxPrice('1000'); handlePriceFilter(); }}
                  >
                    ₹500 - ₹1000
                  </button>
                  <button
                    className="quick-filter-btn"
                    onClick={() => { setMinPrice('1000'); setMaxPrice('3000'); handlePriceFilter(); }}
                  >
                    ₹1000 - ₹3000
                  </button>
                  <button
                    className="quick-filter-btn"
                    onClick={() => { setMinPrice('3000'); setMaxPrice(''); handlePriceFilter(); }}
                  >
                    Above ₹3000
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Mobile Overlay */}
            {filterOpen && (
              <div className="filter-overlay" onClick={() => setFilterOpen(false)} />
            )}
          </Col>

          {/* Products Grid */}
          <Col lg={9}>
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="toolbar-left">
                <button
                  className="filter-toggle-mobile"
                  onClick={() => setFilterOpen(true)}
                >
                  <FiFilter /> Filters
                </button>
                <span className="product-count">
                  {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
                </span>
              </div>

              <div className="toolbar-right">
                {/* Sort */}
                <div className="sort-wrapper">
                  <Form.Select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
                    className="sort-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="name">Name: A to Z</option>
                  </Form.Select>
                </div>

                {/* View Mode */}
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="active-filters">
                {search && (
                  <span className="filter-tag">
                    Search: {search}
                    <FiX onClick={() => { setSearch(''); fetchProducts(''); }} />
                  </span>
                )}
                {gender && (
                  <span className="filter-tag">
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    <FiX onClick={() => setGender('')} />
                  </span>
                )}

                {volume && (
                  <span className="filter-tag">
                    Volume: {volume}
                    <FiX onClick={() => setVolume('')} />
                  </span>
                )}

                {(minPrice || maxPrice) && (
                  <span className="filter-tag">
                    ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                    <FiX onClick={() => { setMinPrice(''); setMaxPrice(''); }} />
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className="loading-wrapper">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button className="btn-primary-custom" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <Row className={`g-3 ${viewMode === 'list' ? 'list-view' : ''}`}>
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <Col
                        xl={viewMode === 'grid' ? 4 : 12}
                        md={viewMode === 'grid' ? 6 : 12}
                        key={product.id}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                        >
                          {viewMode === 'grid' ? (
                            <GridProductCard
                              product={product}
                              onAddToCart={handleAddToCart}
                              getDiscountPercent={getDiscountPercent}
                            />
                          ) : (
                            <ListProductCard
                              product={product}
                              onAddToCart={handleAddToCart}
                              getDiscountPercent={getDiscountPercent}
                            />
                          )}
                        </motion.div>
                      </Col>
                    ))}
                  </AnimatePresence>
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    <button
                      className="page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className="page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// ============================================
// GRID PRODUCT CARD
// ============================================
const GridProductCard = ({ product, onAddToCart, getDiscountPercent }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      toast.success(`${product.name} added to wishlist!`, {
        icon: '💝',
      });
    } else {
      toast.info(`${product.name} removed from wishlist`);
    }
  };

  // ⬅️ NEW: Stock status helper
  const getStockInfo = () => {
    if (product.stock <= 0) {
      return { text: 'Out of Stock', className: 'out-of-stock', color: '#e74c3c' };
    } else if (product.stock <= 5) {
      return { text: `Only ${product.stock} left!`, className: 'low-stock', color: '#e67e22' };
    } else {
      return { text: 'In Stock', className: 'in-stock', color: '#27ae60' };
    }
  };

  const stockInfo = getStockInfo(); // ⬅️ NEW

  return (
    <div className={`product-card ${product.stock <= 0 ? 'product-out-of-stock' : ''}`}> {/* ⬅️ NEW: class added */}
      <Link to={`/product/${product.id}`}>
        <div className="product-image-wrapper">
          <img
    src={productCardImage(product.image_url)}
    alt={product.name}
    loading="lazy"
    onError={(e) => {
        e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop';
    }}
/>
          {product.discount_price && (
            <span className="product-badge">
              -{getDiscountPercent(product.price, product.discount_price)}%
            </span>
          )}

          {/* ⬅️ NEW: Out of Stock Overlay */}
          {product.stock <= 0 && (
            <div className="out-of-stock-overlay">
              <span>OUT OF STOCK</span>
            </div>
          )}

          {/* ⬅️ NEW: Low Stock Badge */}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="stock-badge-low">Only {product.stock} left!</span>
          )}

          <div className="product-actions">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Wishlist"
              onClick={handleWishlist}
              style={{
                color: wishlisted ? '#e94560' : 'inherit',
                background: wishlisted ? '#fff0f3' : 'white'
              }}
            >
              <FiHeart fill={wishlisted ? '#e94560' : 'none'} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Quick View">
              <FiEye />
            </motion.button>
          </div>
        </div>
      </Link>

      <div className="product-info">
        <span className="product-brand">{product.brand || 'URBUNFY'}</span>
        <Link to={`/product/${product.id}`}>
          <h4 className="product-name">{product.name}</h4>
        </Link>

        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              className={`star ${star <= Math.round(product.rating || 0) ? '' : 'empty'}`}
              fill={star <= Math.round(product.rating || 0) ? '#ffc107' : 'none'}
            />
          ))}
          <span className="rating-count">({product.total_reviews || 0})</span>
        </div>

        <div className="product-price-wrapper">
          <span className="product-price">
            ₹{product.discount_price || product.price}
          </span>
          {product.discount_price && (
            <>
              <span className="product-original-price">₹{product.price}</span>
              <span className="product-discount">
                {getDiscountPercent(product.price, product.discount_price)}% off
              </span>
            </>
          )}
        </div>

        {product.volume && (
          <span className="product-volume">{product.volume}</span>
        )}

        {/* ⬅️ NEW: Stock Status Text */}
        <div className={`product-stock-status ${stockInfo.className}`}>
          <span style={{ color: stockInfo.color }}>● {stockInfo.text}</span>
        </div>

        {/* ⬅️ NEW: Conditional Add to Cart Button */}
        {product.stock > 0 ? (
          <motion.button
            className="add-to-cart-btn"
            onClick={() => onAddToCart(product)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiShoppingBag /> Add to Cart
          </motion.button>
        ) : (
          <button className="add-to-cart-btn out-of-stock-btn" disabled>
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};
// ============================================
// LIST PRODUCT CARD
// ============================================
const ListProductCard = ({ product, onAddToCart, getDiscountPercent }) => {
  // ⬅️ NEW: Stock status helper
  const getStockInfo = () => {
    if (product.stock <= 0) {
      return { text: 'Out of Stock', className: 'out-of-stock', color: '#e74c3c' };
    } else if (product.stock <= 5) {
      return { text: `Only ${product.stock} left!`, className: 'low-stock', color: '#e67e22' };
    } else {
      return { text: 'In Stock', className: 'in-stock', color: '#27ae60' };
    }
  };

  const stockInfo = getStockInfo(); // ⬅️ NEW

  return (
    <div className={`product-card-list ${product.stock <= 0 ? 'product-out-of-stock' : ''}`}> {/* ⬅️ NEW */}
      <Row className="align-items-center g-0">
        <Col md={4}>
          <Link to={`/product/${product.id}`}>
            <div className="list-image-wrapper">
              <img
    src={productListImage(product.image_url)}
    alt={product.name}
    loading="lazy"
    onError={(e) => {
        e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop';
    }}
/>
              {product.discount_price && (
                <span className="product-badge">
                  -{getDiscountPercent(product.price, product.discount_price)}%
                </span>
              )}
              {/* ⬅️ NEW: Out of Stock Overlay */}
              {product.stock <= 0 && (
                <div className="out-of-stock-overlay">
                  <span>OUT OF STOCK</span>
                </div>
              )}
            </div>
          </Link>
        </Col>
        <Col md={8}>
          <div className="list-product-info">
            <span className="product-brand">{product.brand || 'URBUNFY'}</span>
            <Link to={`/product/${product.id}`}>
              <h4 className="product-name">{product.name}</h4>
            </Link>
            <p className="list-description">
              {product.short_description || product.description?.substring(0, 120) + '...'}
            </p>

            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`star ${star <= Math.round(product.rating || 0) ? '' : 'empty'}`}
                  fill={star <= Math.round(product.rating || 0) ? '#ffc107' : 'none'}
                />
              ))}
              <span className="rating-count">({product.total_reviews || 0})</span>
            </div>

            {/* ⬅️ NEW: Stock Status */}
            <div className={`product-stock-status ${stockInfo.className}`}>
              <span style={{ color: stockInfo.color }}>● {stockInfo.text}</span>
            </div>

            <div className="list-bottom">
              <div className="product-price-wrapper">
                <span className="product-price">₹{product.discount_price || product.price}</span>
                {product.discount_price && (
                  <span className="product-original-price">₹{product.price}</span>
                )}
              </div>

              {/* ⬅️ NEW: Conditional Button */}
              {product.stock > 0 ? (
                <motion.button
                  className="add-to-cart-btn list-cart-btn"
                  onClick={() => onAddToCart(product)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiShoppingBag /> Add to Cart
                </motion.button>
              ) : (
                <button className="add-to-cart-btn list-cart-btn out-of-stock-btn" disabled>
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default ProductList;