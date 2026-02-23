import React, { useState, useEffect } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FiTag, FiPlus, FiEdit2, FiTrash2, FiX,
  FiCheck, FiSearch, FiPercent, FiDollarSign,
  FiCalendar, FiUsers, FiEye, FiCopy,
  FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_discount: '',
    usage_limit: '100',
    expires_at: '',
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  // ============================================
  // FETCH COUPONS
  // ============================================
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons/admin/all');
      setCoupons(res.data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FORM HANDLERS
  // ============================================
  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '',
      max_discount: '',
      usage_limit: '100',
      expires_at: '',
      is_active: true,
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0)
      newErrors.discount_value = 'Discount value is required';
    if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100)
      newErrors.discount_value = 'Percentage cannot exceed 100%';
    if (!formData.usage_limit || parseInt(formData.usage_limit) <= 0)
      newErrors.usage_limit = 'Usage limit is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // ADD COUPON
  // ============================================
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleAddCoupon = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await api.post('/coupons/admin/create', null, {
        params: {
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          min_order_value: parseFloat(formData.min_order_value) || 0,
          max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
          usage_limit: parseInt(formData.usage_limit),
          expires_at: formData.expires_at || null,
        },
      });

      toast.success(`Coupon '${formData.code.toUpperCase()}' created! 🎉`);
      setShowAddModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // EDIT COUPON
  // ============================================
  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_value: coupon.min_order_value ? coupon.min_order_value.toString() : '',
      max_discount: coupon.max_discount ? coupon.max_discount.toString() : '',
      usage_limit: coupon.usage_limit.toString(),
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleEditCoupon = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await api.put(`/coupons/admin/${selectedCoupon.id}`, {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: parseInt(formData.usage_limit),
        expires_at: formData.expires_at || null,
        is_active: formData.is_active,
      });

      toast.success('Coupon updated! ✅');
      setShowEditModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update coupon');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // TOGGLE ACTIVE
  // ============================================
  const handleToggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/admin/${coupon.id}`, {
        is_active: !coupon.is_active,
      });

      toast.success(`Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}!`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  // ============================================
  // DELETE COUPON
  // ============================================
  const openDeleteModal = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    setSaving(true);
    try {
      await api.delete(`/coupons/admin/${selectedCoupon.id}`);
      toast.success('Coupon deleted!');
      setShowDeleteModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.info(`'${code}' copied!`);
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Filter
  const filteredCoupons = coupons.filter((coupon) => {
    const matchSearch = !search || coupon.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      !statusFilter ||
      (statusFilter === 'active' && coupon.is_active && !isExpired(coupon.expires_at)) ||
      (statusFilter === 'inactive' && !coupon.is_active) ||
      (statusFilter === 'expired' && isExpired(coupon.expires_at));
    return matchSearch && matchStatus;
  });

  // Stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.is_active && !isExpired(c.expires_at)).length;
  const expiredCoupons = coupons.filter((c) => isExpired(c.expires_at)).length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  // ============================================
  // FORM JSX - Reusable (NOT a component!)
  // ============================================
  const renderCouponForm = () => (
    <div>
      {/* Coupon Code */}
      <div className="admin-field">
        <label>Coupon Code *</label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          className="admin-input"
          placeholder="e.g. WELCOME10"
          style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
          maxLength={20}
          autoComplete="off"
        />
        {errors.code && <span style={{ color: '#e74c3c', fontSize: '0.78rem' }}>{errors.code}</span>}
      </div>

      {/* Discount Type */}
      <div className="admin-field">
        <label>Discount Type *</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: `1.5px solid ${formData.discount_type === 'percentage' ? '#c9a96e' : '#e0e0e0'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              background: formData.discount_type === 'percentage' ? 'rgba(201,169,110,0.05)' : 'white',
            }}
          >
            <input
              type="radio"
              name="discount_type"
              value="percentage"
              checked={formData.discount_type === 'percentage'}
              onChange={handleChange}
              style={{ accentColor: '#c9a96e' }}
            />
            <FiPercent style={{ color: '#c9a96e' }} />
            <span style={{ fontSize: '0.88rem' }}>Percentage</span>
          </label>

          <label
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: `1.5px solid ${formData.discount_type === 'fixed' ? '#c9a96e' : '#e0e0e0'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              background: formData.discount_type === 'fixed' ? 'rgba(201,169,110,0.05)' : 'white',
            }}
          >
            <input
              type="radio"
              name="discount_type"
              value="fixed"
              checked={formData.discount_type === 'fixed'}
              onChange={handleChange}
              style={{ accentColor: '#c9a96e' }}
            />
            <span style={{ fontWeight: 700, color: '#c9a96e' }}>₹</span>
            <span style={{ fontSize: '0.88rem' }}>Fixed Amount</span>
          </label>
        </div>
      </div>

      {/* Discount Value & Max Discount */}
      <Row className="g-3">
        <Col md={6}>
          <div className="admin-field">
            <label>
              Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
            </label>
            <input
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              className="admin-input"
              placeholder={formData.discount_type === 'percentage' ? 'e.g. 10' : 'e.g. 200'}
              min="0"
              max={formData.discount_type === 'percentage' ? '100' : ''}
              autoComplete="off"
            />
            {errors.discount_value && (
              <span style={{ color: '#e74c3c', fontSize: '0.78rem' }}>{errors.discount_value}</span>
            )}
          </div>
        </Col>

        {formData.discount_type === 'percentage' && (
          <Col md={6}>
            <div className="admin-field">
              <label>Max Discount (₹) - Optional</label>
              <input
                type="number"
                name="max_discount"
                value={formData.max_discount}
                onChange={handleChange}
                className="admin-input"
                placeholder="e.g. 200"
                min="0"
                autoComplete="off"
              />
            </div>
          </Col>
        )}
      </Row>

      {/* Min Order & Usage Limit */}
      <Row className="g-3">
        <Col md={6}>
          <div className="admin-field">
            <label>Minimum Order Value (₹)</label>
            <input
              type="number"
              name="min_order_value"
              value={formData.min_order_value}
              onChange={handleChange}
              className="admin-input"
              placeholder="e.g. 500"
              min="0"
              autoComplete="off"
            />
          </div>
        </Col>
        <Col md={6}>
          <div className="admin-field">
            <label>Usage Limit *</label>
            <input
              type="number"
              name="usage_limit"
              value={formData.usage_limit}
              onChange={handleChange}
              className="admin-input"
              placeholder="e.g. 100"
              min="1"
              autoComplete="off"
            />
            {errors.usage_limit && (
              <span style={{ color: '#e74c3c', fontSize: '0.78rem' }}>{errors.usage_limit}</span>
            )}
          </div>
        </Col>
      </Row>

      {/* Expiry Date */}
      <div className="admin-field">
        <label>Expiry Date (Optional)</label>
        <input
          type="date"
          name="expires_at"
          value={formData.expires_at}
          onChange={handleChange}
          className="admin-input"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Active Toggle (Edit only) */}
      {showEditModal && (
        <div className="admin-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              style={{ accentColor: '#c9a96e', width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.88rem' }}>
              {formData.is_active ? '✅ Active' : '❌ Inactive'}
            </span>
          </label>
        </div>
      )}

      {/* Preview */}
      <div
        style={{
          background: '#f5f6fa',
          borderRadius: '10px',
          padding: '15px',
          marginTop: '15px',
          border: '1px dashed #c9a96e',
        }}
      >
        <p style={{ fontSize: '0.78rem', color: '#8a8a9a', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Preview
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: '#1a1a2e',
              color: '#c9a96e',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              letterSpacing: '2px',
              fontSize: '1rem',
            }}
          >
            {formData.code.toUpperCase() || 'CODE'}
          </span>
          <span style={{ fontSize: '0.88rem', color: '#4a4a5a' }}>
            {formData.discount_type === 'percentage'
              ? `${formData.discount_value || '0'}% off`
              : `₹${formData.discount_value || '0'} off`}
            {formData.max_discount && formData.discount_type === 'percentage'
              ? ` (max ₹${formData.max_discount})`
              : ''}
            {formData.min_order_value ? ` on orders above ₹${formData.min_order_value}` : ''}
          </span>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '3px' }}>
            Coupon Management
          </h2>
          <p style={{ color: '#8a8a9a', fontSize: '0.85rem', margin: 0 }}>
            Manage discount coupons for your store
          </p>
        </div>
        <motion.button
          className="admin-btn-accent"
          onClick={openAddModal}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiPlus /> Add Coupon
        </motion.button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(201,169,110,0.1)', color: '#c9a96e' }}>
                <FiTag />
              </div>
            </div>
            <div className="stat-card-body">
              <h3>{totalCoupons}</h3>
              <p>Total Coupons</p>
            </div>
          </motion.div>
        </Col>
        <Col md={3} sm={6}>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(39,174,96,0.1)', color: '#27ae60' }}>
                <FiCheck />
              </div>
            </div>
            <div className="stat-card-body">
              <h3>{activeCoupons}</h3>
              <p>Active</p>
            </div>
          </motion.div>
        </Col>
        <Col md={3} sm={6}>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c' }}>
                <FiCalendar />
              </div>
            </div>
            <div className="stat-card-body">
              <h3>{expiredCoupons}</h3>
              <p>Expired</p>
            </div>
          </motion.div>
        </Col>
        <Col md={3} sm={6}>
          <motion.div className="stat-card" whileHover={{ y: -4 }}>
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(52,152,219,0.1)', color: '#3498db' }}>
                <FiUsers />
              </div>
            </div>
            <div className="stat-card-body">
              <h3>{totalUsed}</h3>
              <p>Total Used</p>
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a8a9a', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            placeholder="Search coupon code..."
            style={{ paddingLeft: '38px' }}
            autoComplete="off"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-input"
          style={{ width: '180px' }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Coupons Table */}
      <motion.div
        className="admin-table-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#8a8a9a' }}>Loading coupons...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#8a8a9a' }}>
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            background: '#1a1a2e', color: '#c9a96e', padding: '5px 12px',
                            borderRadius: '6px', fontWeight: 700, letterSpacing: '1.5px', fontSize: '0.82rem',
                          }}>
                            {coupon.code}
                          </span>
                          <button onClick={() => copyCode(coupon.code)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a9a', padding: '2px' }}
                            title="Copy code">
                            <FiCopy size={14} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong style={{ color: '#1a1a2e', fontSize: '0.88rem' }}>
                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                          </strong>
                          {coupon.max_discount && (
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#8a8a9a' }}>
                              max ₹{coupon.max_discount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {coupon.min_order_value > 0 ? `₹${coupon.min_order_value}` : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '60px', height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%`,
                              height: '100%',
                              background: coupon.used_count >= coupon.usage_limit ? '#e74c3c' : '#27ae60',
                              borderRadius: '3px',
                            }}></div>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#8a8a9a' }}>
                            {coupon.used_count}/{coupon.usage_limit}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {coupon.expires_at ? (
                          <span style={{ color: isExpired(coupon.expires_at) ? '#e74c3c' : '#4a4a5a', fontWeight: isExpired(coupon.expires_at) ? 600 : 400 }}>
                            {new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {isExpired(coupon.expires_at) && (
                              <span style={{ display: 'block', fontSize: '0.7rem', color: '#e74c3c' }}>Expired</span>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: '#27ae60', fontSize: '0.82rem' }}>No Expiry</span>
                        )}
                      </td>
                      <td>
                        <motion.button
                          onClick={() => handleToggleActive(coupon)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 14px',
                            borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                            background: coupon.is_active ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
                            color: coupon.is_active ? '#27ae60' : '#e74c3c',
                          }}
                        >
                          {coupon.is_active ? <><FiToggleRight size={16} /> Active</> : <><FiToggleLeft size={16} /> Inactive</>}
                        </motion.button>
                      </td>
                      <td>
                        <button className="action-btn action-btn-edit" onClick={() => openEditModal(coupon)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="action-btn action-btn-delete" onClick={() => openDeleteModal(coupon)} title="Delete">
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
      {/* ADD COUPON MODAL */}
      {/* ============================================ */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiPlus style={{ marginRight: '8px', color: '#c9a96e' }} />
            Add New Coupon
          </Modal.Title>
          <button onClick={() => setShowAddModal(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8a8a9a' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px' }}>
          {renderCouponForm()}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', padding: '15px 22px' }}>
          <button onClick={() => setShowAddModal(false)}
            style={{ padding: '10px 24px', border: '1.5px solid #e0e0e0', background: 'white', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleAddCoupon} className="admin-btn-accent" disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? 'Creating...' : <><FiCheck /> Create Coupon</>}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ============================================ */}
      {/* EDIT COUPON MODAL */}
      {/* ============================================ */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiEdit2 style={{ marginRight: '8px', color: '#c9a96e' }} />
            Edit Coupon
          </Modal.Title>
          <button onClick={() => setShowEditModal(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8a8a9a' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px' }}>
          {renderCouponForm()}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', padding: '15px 22px' }}>
          <button onClick={() => setShowEditModal(false)}
            style={{ padding: '10px 24px', border: '1.5px solid #e0e0e0', background: 'white', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleEditCoupon} className="admin-btn-primary" disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? 'Saving...' : <><FiCheck /> Save Changes</>}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ============================================ */}
      {/* DELETE CONFIRM MODAL */}
      {/* ============================================ */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Body style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(231,76,60,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <FiTrash2 style={{ fontSize: '1.8rem', color: '#e74c3c' }} />
          </div>
          <h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '10px' }}>Delete Coupon?</h4>
          <p style={{ color: '#8a8a9a', fontSize: '0.9rem', marginBottom: '5px' }}>
            Are you sure you want to delete
          </p>
          {selectedCoupon && (
            <span style={{
              background: '#1a1a2e', color: '#c9a96e', padding: '6px 16px', borderRadius: '6px',
              fontWeight: 700, letterSpacing: '1.5px', fontSize: '0.9rem', display: 'inline-block', marginBottom: '20px',
            }}>
              {selectedCoupon.code}
            </span>
          )}
          <p style={{ color: '#e74c3c', fontSize: '0.82rem' }}>This action cannot be undone!</p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={() => setShowDeleteModal(false)}
              style={{ padding: '10px 30px', border: '1.5px solid #e0e0e0', background: 'white', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleDeleteCoupon} className="admin-btn-danger" disabled={saving}>
              {saving ? 'Deleting...' : 'Delete Coupon'}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Coupons;