import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiX, FiSave, FiImage, FiEye
} from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

// ============================================
// PRODUCT FORM - SEPARATE COMPONENT (OUTSIDE)
// ============================================
const ProductForm = ({ formData, setFormData, categories, onSubmit, submitText, saving }) => {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(formData.image_url || '');

  // Update preview when formData changes
  useEffect(() => {
    setImagePreview(formData.image_url || '');
  }, [formData.image_url]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({
      ...prev,
      name: name,
      slug: slug,
    }));
  };

  // ============================================
  // IMAGE UPLOAD HANDLER
  // ============================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP images allowed');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await api.post('/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setFormData(prev => ({
          ...prev,
          image_url: res.data.image_url,
        }));
        setImagePreview(res.data.image_url);
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Image upload failed');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImagePreview('');
  };

  return (
    <form onSubmit={onSubmit}>
      <Row className="g-3">
        {/* Image Upload Section */}
        <Col xs={12}>
          <div className="admin-field">
            <label><FiImage style={{ marginRight: '5px' }} /> Product Image</label>

            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              marginTop: '8px'
            }}>
              {/* Image Preview */}
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '12px',
                border: '2px dashed #e0e0e0',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f6fa',
                position: 'relative'
              }}>
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(231, 76, 60, 0.9)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem'
                      }}
                    >
                      <FiX />
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#8a8a9a' }}>
                    <FiImage style={{ fontSize: '2rem', marginBottom: '5px' }} />
                    <p style={{ fontSize: '0.7rem', margin: 0 }}>No image</p>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1 }}>
                {/* Upload Button */}
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: uploading ? '#e0e0e0' : '#1a1a2e',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  marginBottom: '10px',
                  transition: 'all 0.3s ease'
                }}>
                  {uploading ? (
                    <>
                      <span style={{
                        width: '16px', height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }}></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiImage /> Choose Image
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>

                <p style={{ fontSize: '0.72rem', color: '#8a8a9a', margin: '0 0 10px' }}>
                  JPG, PNG, WEBP • Max 5MB
                </p>

                {/* OR Manual URL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8a8a9a' }}>OR paste image URL:</span>
                </div>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="/images/products/perfume1.jpg or https://..."
                  autoComplete="off"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        </Col>

        <Col md={8}>
          <div className="admin-field">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              className="admin-input"
              placeholder="Enter product name"
              required
              autoComplete="off"
            />
          </div>
        </Col>
        <Col md={4}>
          <div className="admin-field">
            <label>Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="admin-input"
              placeholder="auto-generated"
              autoComplete="off"
            />
          </div>
        </Col>

        <Col md={4}>
          <div className="admin-field">
            <label>Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="admin-input"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </Col>
        <Col md={4}>
          <div className="admin-field">
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="admin-input"
              placeholder="0.00"
              step="0.01"
              required
              autoComplete="off"
            />
          </div>
        </Col>
        <Col md={4}>
          <div className="admin-field">
            <label>Discount Price (₹)</label>
            <input
              type="number"
              name="discount_price"
              value={formData.discount_price}
              onChange={handleChange}
              className="admin-input"
              placeholder="0.00"
              step="0.01"
              autoComplete="off"
            />
          </div>
        </Col>

        <Col md={3}>
          <div className="admin-field">
            <label>Stock *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="admin-input"
              placeholder="0"
              required
              autoComplete="off"
            />
          </div>
        </Col>
        <Col md={3}>
          <div className="admin-field">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="admin-input"
              placeholder="URBUNFY"
              autoComplete="off"
            />
          </div>
        </Col>
        <Col md={3}>
          <div className="admin-field">
            <label>Volume</label>
            <input
              type="text"
              name="volume"
              value={formData.volume}
              onChange={handleChange}
              className="admin-input"
              placeholder="100ml"
              autoComplete="off"
            />
          </div>
        </Col>
        <Col md={3}>
          <div className="admin-field">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="admin-input"
            >
              <option value="unisex">Unisex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </Col>

        <Col xs={12}>
          <div className="admin-field">
            <label>Short Description</label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              className="admin-input"
              placeholder="Brief description (1 line)"
              autoComplete="off"
            />
          </div>
        </Col>

        <Col xs={12}>
          <div className="admin-field">
            <label>Full Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="admin-input"
              rows={4}
              placeholder="Detailed product description..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </Col>

        <Col xs={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              id="featured-check"
              style={{ width: '18px', height: '18px', accentColor: '#c9a96e' }}
            />
            <label htmlFor="featured-check" style={{ margin: 0, cursor: 'pointer', fontSize: '0.88rem' }}>
              Mark as Featured Product
            </label>
          </div>
        </Col>

        <Col xs={12} style={{ marginTop: '15px' }}>
          <button type="submit" className="admin-btn-primary" disabled={saving} style={{ marginRight: '10px' }}>
            <FiSave style={{ marginRight: '5px' }} />
            {saving ? 'Saving...' : submitText}
          </button>
        </Col>
      </Row>
    </form>
  );
};

// ============================================
// MAIN PRODUCTS COMPONENT
// ============================================
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: 1,
    price: '',
    discount_price: '',
    stock: '',
    description: '',
    short_description: '',
    image_url: '',
    brand: 'URBUNFY',
    volume: '',
    gender: 'unisex',
    is_featured: false,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/?per_page=50');
      setProducts(res.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category_id: 1,
      price: '',
      discount_price: '',
      stock: '',
      description: '',
      short_description: '',
      image_url: '',
      brand: 'URBUNFY',
      volume: '',
      gender: 'unisex',
      is_featured: false,
    });
  };

  // ============================================
  // ADD PRODUCT
  // ============================================
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Name, Price, and Stock are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock),
      };

      await api.post('/products/admin/create', payload);
      toast.success('Product added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // EDIT PRODUCT
  // ============================================
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      category_id: product.category_id || 1,
      price: product.price || '',
      discount_price: product.discount_price || '',
      stock: product.stock || '',
      description: product.description || '',
      short_description: product.short_description || '',
      image_url: product.image_url || '',
      brand: product.brand || 'URBUNFY',
      volume: product.volume || '',
      gender: product.gender || 'unisex',
      is_featured: product.is_featured || false,
    });
    setShowEditModal(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error('Name and Price are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock),
        description: formData.description,
        short_description: formData.short_description,
        image_url: formData.image_url,
        brand: formData.brand,
        volume: formData.volume,
        gender: formData.gender,
        is_featured: formData.is_featured,
      };

      await api.put(`/products/admin/${selectedProduct.id}`, payload);
      toast.success('Product updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE PRODUCT
  // ============================================
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    setSaving(true);
    try {
      await api.delete(`/products/admin/${selectedProduct.id}`);
      toast.success(`"${selectedProduct.name}" deleted permanently!`);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete product');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // VIEW PRODUCT
  // ============================================
  const openViewModal = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !categoryFilter || p.category_id === parseInt(categoryFilter);
    return matchSearch && matchCategory;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '3px' }}>
            Products Management
          </h2>
          <p style={{ color: '#8a8a9a', fontSize: '0.85rem', margin: 0 }}>
            {filteredProducts.length} products found
          </p>
        </div>
        <motion.button
          className="admin-btn-accent"
          onClick={() => { resetForm(); setShowAddModal(true); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FiPlus /> Add Product
        </motion.button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a8a9a', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            placeholder="Search products..."
            style={{ paddingLeft: '38px' }}
            autoComplete="off"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="admin-input"
          style={{ width: '180px' }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <motion.div
        className="admin-table-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#8a8a9a' }}>Loading products...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8a8a9a' }}>
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td><strong>#{product.id}</strong></td>
                      <td>
                        <div style={{
                          width: '50px', height: '50px', borderRadius: '8px',
                          overflow: 'hidden', border: '1px solid #e0e0e0', background: '#f5f6fa'
                        }}>
                          <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop'}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#1a1a2e', fontSize: '0.88rem' }}>{product.name}</strong>
                        <br />
                        <span style={{ fontSize: '0.72rem', color: '#c9a96e' }}>{product.brand}</span>
                      </td>
                      <td>
                        <span style={{
                          background: '#f0f0f0', padding: '3px 10px',
                          borderRadius: '12px', fontSize: '0.78rem'
                        }}>
                          {product.category_name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div>
                          {product.discount_price ? (
                            <>
                              <strong style={{ color: '#1a1a2e' }}>₹{product.discount_price}</strong>
                              <br />
                              <span style={{ textDecoration: 'line-through', fontSize: '0.78rem', color: '#8a8a9a' }}>
                                ₹{product.price}
                              </span>
                            </>
                          ) : (
                            <strong style={{ color: '#1a1a2e' }}>₹{product.price}</strong>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          color: product.stock > 0 ? '#27ae60' : '#e74c3c',
                          fontWeight: 600
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        {product.is_featured ? (
                          <span style={{ color: '#f39c12', fontSize: '0.82rem', fontWeight: 600 }}>⭐ Yes</span>
                        ) : (
                          <span style={{ color: '#8a8a9a', fontSize: '0.82rem' }}>No</span>
                        )}
                      </td>
                      <td>
                        <button className="action-btn action-btn-view" onClick={() => openViewModal(product)} title="View">
                          <FiEye />
                        </button>
                        <button className="action-btn action-btn-edit" onClick={() => openEditModal(product)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="action-btn action-btn-delete" onClick={() => openDeleteModal(product)} title="Delete">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ============================================ */}
      {/* ADD PRODUCT MODAL */}
      {/* ============================================ */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered enforceFocus={false}>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiPlus style={{ marginRight: '8px', color: '#c9a96e' }} />
            Add New Product
          </Modal.Title>
          <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8a8a9a' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px' }}>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            onSubmit={handleAddProduct}
            submitText="Add Product"
            saving={saving}
          />
        </Modal.Body>
      </Modal>

      {/* ============================================ */}
      {/* EDIT PRODUCT MODAL */}
      {/* ============================================ */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered enforceFocus={false}>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiEdit2 style={{ marginRight: '8px', color: '#c9a96e' }} />
            Edit Product
          </Modal.Title>
          <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8a8a9a' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px' }}>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            onSubmit={handleEditProduct}
            submitText="Update Product"
            saving={saving}
          />
        </Modal.Body>
      </Modal>

      {/* ============================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================ */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Body style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'rgba(231, 76, 60, 0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '1.8rem', color: '#e74c3c'
          }}>
            <FiTrash2 />
          </div>
          <h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '10px' }}>
            Delete Product?
          </h4>
          <p style={{ color: '#8a8a9a', fontSize: '0.9rem', marginBottom: '5px' }}>
            Are you sure you want to permanently delete
          </p>
          <p style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '25px' }}>
            "{selectedProduct?.name}"
          </p>
          <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: '25px' }}>
            ⚠️ This action cannot be undone. Product will be removed from database permanently.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                padding: '10px 24px', border: '1.5px solid #e0e0e0',
                background: 'transparent', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProduct}
              className="admin-btn-danger"
              disabled={saving}
            >
              <FiTrash2 style={{ marginRight: '5px' }} />
              {saving ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ============================================ */}
      {/* VIEW PRODUCT MODAL */}
      {/* ============================================ */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiEye style={{ marginRight: '8px', color: '#c9a96e' }} />
            Product Details
          </Modal.Title>
          <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8a8a9a' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px' }}>
          {selectedProduct && (
            <Row className="g-3">
              <Col md={5}>
                <div style={{
                  borderRadius: '12px', overflow: 'hidden',
                  border: '1px solid #e0e0e0', background: '#f5f6fa'
                }}>
                  <img
                    src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'}
                    alt={selectedProduct.name}
                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                  />
                </div>
              </Col>
              <Col md={7}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#c9a96e', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    {selectedProduct.brand}
                  </span>
                </div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '12px' }}>
                  {selectedProduct.name}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Price</span>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>₹{selectedProduct.discount_price || selectedProduct.price}</p>
                    {selectedProduct.discount_price && (
                      <span style={{ textDecoration: 'line-through', color: '#8a8a9a', fontSize: '0.85rem' }}>₹{selectedProduct.price}</span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Stock</span>
                    <p style={{ fontWeight: 600, color: selectedProduct.stock > 0 ? '#27ae60' : '#e74c3c', margin: 0 }}>
                      {selectedProduct.stock} units
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Category</span>
                    <p style={{ fontWeight: 500, margin: 0 }}>{selectedProduct.category_name}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Volume</span>
                    <p style={{ fontWeight: 500, margin: 0 }}>{selectedProduct.volume || '-'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Gender</span>
                    <p style={{ fontWeight: 500, margin: 0, textTransform: 'capitalize' }}>{selectedProduct.gender}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Featured</span>
                    <p style={{ fontWeight: 500, margin: 0 }}>{selectedProduct.is_featured ? '⭐ Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Description</span>
                  <p style={{ fontSize: '0.88rem', color: '#4a4a5a', lineHeight: 1.7, marginTop: '5px' }}>
                    {selectedProduct.description || 'No description'}
                  </p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Products;