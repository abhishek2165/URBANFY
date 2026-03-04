import React, { useState, useEffect } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiCheck,
  FiCalendar, FiPercent, FiImage, FiPackage, FiTag
} from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner_image: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    product_ids: []
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales/admin/all');
      setSales(res.data.sales);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/?per_page=50');
      setProducts(res.data.products || []);
    } catch (error) {
      console.log('Failed to load products');
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormData({
      name: '', description: '', banner_image: '',
      discount_type: 'percentage', discount_value: '',
      start_date: '', end_date: '', product_ids: []
    });
    setShowModal(true);
  };

  const openEditModal = (sale) => {
    setEditing(sale);
    setFormData({
      name: sale.name,
      description: sale.description || '',
      banner_image: sale.banner_image || '',
      discount_type: sale.discount_type,
      discount_value: sale.discount_value,
      start_date: sale.start_date?.slice(0, 16) || '',
      end_date: sale.end_date?.slice(0, 16) || '',
      product_ids: sale.products?.map(p => p.id) || []
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, banner_image: res.data.image_url });
      toast.success('Banner uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.discount_value || !formData.start_date || !formData.end_date) {
      toast.error('Please fill all required fields');
      return;
    }
    if (formData.product_ids.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      if (editing) {
        await api.put(`/sales/admin/${editing.id}`, payload);
        toast.success('Sale updated!');
      } else {
        await api.post('/sales/admin/create', payload);
        toast.success('Sale created!');
      }
      setShowModal(false);
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale?')) return;
    try {
      await api.delete(`/sales/admin/${id}`);
      toast.success('Sale deleted!');
      fetchSales();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (sale) => {
    try {
      await api.put(`/sales/admin/${sale.id}`, { is_active: !sale.is_active });
      toast.success(`Sale ${sale.is_active ? 'deactivated' : 'activated'}!`);
      fetchSales();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const isLive = (sale) => {
    const now = new Date();
    return sale.is_active && new Date(sale.start_date) <= now && new Date(sale.end_date) >= now;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '3px' }}>
            Sales & Offers
          </h2>
          <p style={{ color: '#8a8a9a', fontSize: '0.85rem', margin: 0 }}>{sales.length} sales</p>
        </div>
        <button className="admin-btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiPlus /> Create Sale
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#8a8a9a', padding: '40px' }}>Loading...</p>
      ) : sales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8a8a9a' }}>
          <FiTag style={{ fontSize: '2rem', marginBottom: '10px' }} />
          <p>No sales yet. Create your first sale!</p>
        </div>
      ) : (
        <Row className="g-3">
          {sales.map((sale) => (
            <Col md={6} lg={4} key={sale.id}>
              <motion.div
                style={{
                  background: 'white', borderRadius: '12px', overflow: 'hidden',
                  border: `2px solid ${isLive(sale) ? '#27ae60' : '#e0e0e0'}`,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}
                whileHover={{ y: -3 }}
              >
                {sale.banner_image && (
                  <img src={sale.banner_image} alt={sale.name}
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{sale.name}</h5>
                    {isLive(sale) && (
                      <span style={{ background: '#27ae60', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                        🔴 LIVE
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e74c3c', marginBottom: '8px' }}>
                    {sale.discount_type === 'percentage' ? `${sale.discount_value}% OFF` : `₹${sale.discount_value} OFF`}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#8a8a9a', marginBottom: '6px' }}>
                    <FiCalendar style={{ marginRight: '4px' }} />
                    {new Date(sale.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {' - '}
                    {new Date(sale.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#8a8a9a', marginBottom: '12px' }}>
                    <FiPackage style={{ marginRight: '4px' }} />
                    {sale.products?.length || 0} products
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => toggleActive(sale)}
                      style={{
                        flex: 1, padding: '7px', border: '1px solid #e0e0e0', borderRadius: '6px',
                        background: sale.is_active ? '#e8f5e9' : '#fff3e0', cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: 600,
                        color: sale.is_active ? '#27ae60' : '#f39c12'
                      }}>
                      {sale.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => openEditModal(sale)}
                      style={{ padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(sale.id)}
                      style={{ padding: '7px 12px', border: '1px solid #ffcdd2', borderRadius: '6px', background: '#fff5f5', cursor: 'pointer', color: '#e74c3c' }}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}

      {/* CREATE/EDIT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiTag style={{ marginRight: '8px', color: '#c9a96e' }} />
            {editing ? 'Edit Sale' : 'Create New Sale'}
          </Modal.Title>
          <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px', maxHeight: '70vh', overflowY: 'auto' }}>
          <Row className="g-3">
            <Col md={8}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Sale Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} className="admin-input" placeholder="e.g. Summer Mega Sale" />
            </Col>
            <Col md={4}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Discount Type</label>
              <select name="discount_type" value={formData.discount_type} onChange={handleChange} className="admin-input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </Col>
            <Col md={4}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Discount Value *</label>
              <input name="discount_value" type="number" value={formData.discount_value} onChange={handleChange} className="admin-input"
                placeholder={formData.discount_type === 'percentage' ? 'e.g. 30' : 'e.g. 500'} />
            </Col>
            <Col md={4}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Start Date *</label>
              <input name="start_date" type="datetime-local" value={formData.start_date} onChange={handleChange} className="admin-input" />
            </Col>
            <Col md={4}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>End Date *</label>
              <input name="end_date" type="datetime-local" value={formData.end_date} onChange={handleChange} className="admin-input" />
            </Col>
            <Col xs={12}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="admin-input" rows={2}
                placeholder="Sale description..." />
            </Col>
            <Col xs={12}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                <FiImage style={{ marginRight: '4px' }} /> Banner Image
              </label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="admin-input" />
              {formData.banner_image && (
                <img src={formData.banner_image} alt="Banner" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />
              )}
            </Col>
            <Col xs={12}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '10px', display: 'block' }}>
                <FiPackage style={{ marginRight: '4px' }} /> Select Products * ({formData.product_ids.length} selected)
              </label>
              <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '8px' }}>
                {products.map((product) => (
                  <label key={product.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                      borderRadius: '6px', cursor: 'pointer', marginBottom: '4px',
                      background: formData.product_ids.includes(product.id) ? '#f0f9ff' : 'transparent',
                      border: `1px solid ${formData.product_ids.includes(product.id) ? '#3498db' : 'transparent'}`
                    }}>
                    <input type="checkbox" checked={formData.product_ids.includes(product.id)}
                      onChange={() => toggleProduct(product.id)} style={{ accentColor: '#3498db' }} />
                    <img src={product.image_url || 'https://via.placeholder.com/40'} alt=""
                      style={{ width: '35px', height: '35px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{product.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#8a8a9a', marginLeft: '8px' }}>₹{product.price}</span>
                    </div>
                  </label>
                ))}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', padding: '15px 22px' }}>
          <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} className="admin-btn-primary" disabled={saving}
            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {saving ? 'Saving...' : <><FiCheck /> {editing ? 'Update Sale' : 'Create Sale'}</>}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sales;