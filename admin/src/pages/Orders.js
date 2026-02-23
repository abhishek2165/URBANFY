import React, { useState, useEffect } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FiShoppingCart, FiEye, FiX, FiPackage,
  FiMapPin, FiPhone, FiUser, FiCalendar,
  FiCreditCard, FiTruck, FiCheck, FiClock,
  FiSearch, FiFilter
} from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/admin/all');
      setOrders(res.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setNewPaymentStatus(order.payment_status);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const payload = {};
      if (newStatus !== selectedOrder.order_status) {
        payload.order_status = newStatus;
      }
      if (newPaymentStatus !== selectedOrder.payment_status) {
        payload.payment_status = newPaymentStatus;
      }

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to update');
        setShowStatusModal(false);
        return;
      }

      await api.put(`/orders/admin/${selectedOrder.id}`, payload);
      toast.success('Order status updated!');
      setShowStatusModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f39c12',
      'Confirmed': '#3498db',
      'Shipped': '#9b59b6',
      'Delivered': '#27ae60',
      'Cancelled': '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  const getPaymentColor = (status) => {
    const colors = {
      'Pending': '#f39c12',
      'Paid': '#27ae60',
      'Failed': '#e74c3c',
      'Refunded': '#3498db',
    };
    return colors[status] || '#95a5a6';
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchStatus = !statusFilter || order.order_status === statusFilter;
    const matchSearch = !search ||
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '3px' }}>
          Orders Management
        </h2>
        <p style={{ color: '#8a8a9a', fontSize: '0.85rem', margin: 0 }}>
          {filteredOrders.length} orders found
        </p>
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
            placeholder="Search by order number or phone..."
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
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Status Summary Cards */}
      <Row className="g-3 mb-4">
        {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => {
          const count = orders.filter(o => o.order_status === status).length;
          return (
            <Col key={status}>
              <motion.div
                onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                style={{
                  background: statusFilter === status ? `${getStatusColor(status)}15` : 'white',
                  border: `1px solid ${statusFilter === status ? getStatusColor(status) : '#e0e0e0'}`,
                  borderRadius: '10px',
                  padding: '15px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: getStatusColor(status), margin: 0 }}>
                  {count}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#8a8a9a', margin: 0 }}>{status}</p>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      {/* Orders Table */}
      <motion.div
        className="admin-table-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#8a8a9a' }}>Loading orders...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8a8a9a' }}>
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong style={{ color: '#1a1a2e' }}>{order.order_number}</strong></td>
                      <td style={{ fontSize: '0.82rem', color: '#8a8a9a' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td>
                        <span style={{ background: '#f0f0f0', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem' }}>
                          {order.items ? order.items.length : 0} items
                        </span>
                      </td>
                      <td><strong style={{ color: '#1a1a2e' }}>₹{order.final_price}</strong></td>
                      <td>
                        <div>
                          <span style={{ fontSize: '0.82rem' }}>{order.payment_method}</span>
                          <br />
                          <span style={{
                            fontSize: '0.72rem',
                            color: getPaymentColor(order.payment_status),
                            fontWeight: 600
                          }}>
                            {order.payment_status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{order.phone}</td>
                      <td>
                        <button className="action-btn action-btn-view" onClick={() => openDetailModal(order)} title="View Details">
                          <FiEye />
                        </button>
                        <button className="action-btn action-btn-edit" onClick={() => openStatusModal(order)} title="Update Status">
                          <FiTruck />
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
      {/* ORDER DETAIL MODAL */}
      {/* ============================================ */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiPackage style={{ marginRight: '8px', color: '#c9a96e' }} />
            Order Details
          </Modal.Title>
          <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8a8a9a' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px' }}>
          {selectedOrder && (
            <>
              {/* Order Info */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div style={{ background: '#f5f6fa', borderRadius: '10px', padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <FiShoppingCart style={{ color: '#c9a96e' }} />
                      <strong style={{ fontSize: '0.9rem' }}>Order Info</strong>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: '#8a8a9a' }}>Order #</span>
                        <strong style={{ fontSize: '0.82rem' }}>{selectedOrder.order_number}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: '#8a8a9a' }}>Date</span>
                        <span style={{ fontSize: '0.82rem' }}>
                          {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: '#8a8a9a' }}>Status</span>
                        <span className={`status-badge ${getStatusClass(selectedOrder.order_status)}`}>
                          {selectedOrder.order_status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: '#8a8a9a' }}>Payment</span>
                        <span style={{ fontSize: '0.82rem' }}>{selectedOrder.payment_method} ({selectedOrder.payment_status})</span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div style={{ background: '#f5f6fa', borderRadius: '10px', padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <FiMapPin style={{ color: '#c9a96e' }} />
                      <strong style={{ fontSize: '0.9rem' }}>Shipping Info</strong>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#8a8a9a', textTransform: 'uppercase' }}>Address</span>
                        <p style={{ fontSize: '0.85rem', margin: '3px 0 0', lineHeight: 1.5 }}>{selectedOrder.address}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiPhone style={{ fontSize: '0.85rem', color: '#8a8a9a' }} />
                        <span style={{ fontSize: '0.85rem' }}>{selectedOrder.phone}</span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Order Items */}
              <div style={{ marginBottom: '20px' }}>
                <h6 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '12px' }}>
                  <FiPackage style={{ marginRight: '8px', color: '#c9a96e' }} />
                  Order Items
                </h6>
                {selectedOrder.items && selectedOrder.items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px', borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div style={{
                      width: '45px', height: '45px', borderRadius: '8px',
                      overflow: 'hidden', border: '1px solid #e0e0e0', flexShrink: 0
                    }}>
                      <img
                        src={item.product_image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop'}
                        alt={item.product_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem' }}>{item.product_name}</strong>
                      <br />
                      <span style={{ fontSize: '0.78rem', color: '#8a8a9a' }}>
                        Qty: {item.quantity} × ₹{item.price}
                      </span>
                    </div>
                    <strong style={{ fontSize: '0.9rem' }}>₹{item.total}</strong>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div style={{ background: '#f5f6fa', borderRadius: '10px', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#8a8a9a', fontSize: '0.88rem' }}>Subtotal</span>
                  <span style={{ fontSize: '0.88rem' }}>₹{selectedOrder.total_price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#8a8a9a', fontSize: '0.88rem' }}>Shipping</span>
                  <span style={{ fontSize: '0.88rem', color: selectedOrder.shipping_charge > 0 ? '#1a1a2e' : '#27ae60' }}>
                    {selectedOrder.shipping_charge > 0 ? `₹${selectedOrder.shipping_charge}` : 'FREE'}
                  </span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#27ae60', fontSize: '0.88rem' }}>Discount</span>
                    <span style={{ color: '#27ae60', fontSize: '0.88rem' }}>-₹{selectedOrder.discount_amount}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '10px', marginTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '1rem' }}>Total</strong>
                  <strong style={{ fontSize: '1.1rem', color: '#1a1a2e' }}>₹{selectedOrder.final_price}</strong>
                </div>
              </div>

              {selectedOrder.notes && (
                <div style={{ marginTop: '15px', padding: '12px', background: '#fff3cd', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.82rem' }}>Customer Notes:</strong>
                  <p style={{ fontSize: '0.85rem', margin: '5px 0 0' }}>{selectedOrder.notes}</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* ============================================ */}
      {/* UPDATE STATUS MODAL */}
      {/* ============================================ */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiTruck style={{ marginRight: '8px', color: '#c9a96e' }} />
            Update Order Status
          </Modal.Title>
          <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8a8a9a' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px' }}>
          {selectedOrder && (
            <>
              <div style={{ background: '#f5f6fa', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
                <strong style={{ fontSize: '0.9rem' }}>{selectedOrder.order_number}</strong>
                <br />
                <span style={{ fontSize: '0.82rem', color: '#8a8a9a' }}>₹{selectedOrder.final_price}</span>
              </div>

              <div className="admin-field" style={{ marginBottom: '18px' }}>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Order Status</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                    <label
                      key={status}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        border: `1.5px solid ${newStatus === status ? getStatusColor(status) : '#e0e0e0'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: newStatus === status ? `${getStatusColor(status)}08` : 'white',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name="order_status"
                        value={status}
                        checked={newStatus === status}
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{ accentColor: getStatusColor(status) }}
                      />
                      <span style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: getStatusColor(status)
                      }}></span>
                      <span style={{ fontSize: '0.88rem', fontWeight: newStatus === status ? 600 : 400 }}>
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-field" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="admin-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                className="admin-btn-primary"
                disabled={updating}
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {updating ? 'Updating...' : <><FiCheck /> Update Status</>}
              </button>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Orders;