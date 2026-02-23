import React, { useState, useEffect } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FiUsers, FiEye, FiX, FiUser, FiMail,
  FiPhone, FiMapPin, FiCalendar, FiSearch,
  FiToggleLeft, FiToggleRight, FiPackage, FiShoppingCart
} from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    setDetailLoading(true);

    try {
      const res = await api.get(`/admin/users/${user.id}`);
      setUserDetail(res.data);
    } catch (error) {
      toast.error('Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    setToggling(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setToggling(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    return (
      user.first_name.toLowerCase().includes(search.toLowerCase()) ||
      user.last_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone && user.phone.includes(search))
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '3px' }}>
          Users Management
        </h2>
        <p style={{ color: '#8a8a9a', fontSize: '0.85rem', margin: 0 }}>
          {filteredUsers.length} users found
        </p>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
                <FiUsers />
              </div>
            </div>
            <div className="stat-card-body">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60' }}>
                <FiUser />
              </div>
            </div>
            <div className="stat-card-body">
              <h3>{users.filter(u => u.is_active).length}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>
                <FiUser />
              </div>
            </div>
            <div className="stat-card-body">
              <h3>{users.filter(u => !u.is_active).length}</h3>
              <p>Inactive Users</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search */}
      <div style={{ marginBottom: '20px', maxWidth: '400px', position: 'relative' }}>
        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a8a9a', pointerEvents: 'none' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input"
          placeholder="Search by name, email or phone..."
          style={{ paddingLeft: '38px' }}
          autoComplete="off"
        />
      </div>

      {/* Users Table */}
      <motion.div
        className="admin-table-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#8a8a9a' }}>Loading users...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8a8a9a' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td><strong>#{user.id}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '35px', height: '35px', borderRadius: '50%',
                            background: '#1a1a2e', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 600, flexShrink: 0
                          }}>
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1a1a2e' }}>
                              {user.first_name} {user.last_name}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#4a4a5a' }}>{user.email}</td>
                      <td style={{ fontSize: '0.85rem' }}>{user.phone || '-'}</td>
                      <td>
                        <span style={{
                          background: '#f0f0f0', padding: '3px 10px',
                          borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600
                        }}>
                          {user.total_orders} orders
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 600,
                          background: user.is_active ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                          color: user.is_active ? '#27ae60' : '#e74c3c'
                        }}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#8a8a9a' }}>
                        {new Date(user.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td>
                        <button className="action-btn action-btn-view" onClick={() => openDetailModal(user)} title="View Details">
                          <FiEye />
                        </button>
                        <button
                          className={`action-btn ${user.is_active ? 'action-btn-delete' : 'action-btn-edit'}`}
                          onClick={() => handleToggleUser(user.id)}
                          disabled={toggling === user.id}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <FiToggleRight /> : <FiToggleLeft />}
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
      {/* USER DETAIL MODAL */}
      {/* ============================================ */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header style={{ borderBottom: '1px solid #e0e0e0', padding: '18px 22px' }}>
          <Modal.Title style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
            <FiUser style={{ marginRight: '8px', color: '#c9a96e' }} />
            User Details
          </Modal.Title>
          <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#8a8a9a' }}>
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: '22px' }}>
          {detailLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8a8a9a' }}>Loading...</div>
          ) : userDetail ? (
            <>
              {/* User Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', padding: '20px', background: '#f5f6fa', borderRadius: '12px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: '#1a1a2e', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 600, flexShrink: 0
                }}>
                  {userDetail.user.first_name.charAt(0)}{userDetail.user.last_name.charAt(0)}
                </div>
                <div>
                  <h5 style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
                    {userDetail.user.first_name} {userDetail.user.last_name}
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#8a8a9a' }}>{userDetail.user.email}</p>
                  <span style={{
                    display: 'inline-block', marginTop: '5px',
                    padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600,
                    background: userDetail.user.is_active ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: userDetail.user.is_active ? '#27ae60' : '#e74c3c'
                  }}>
                    {userDetail.user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <FiPhone style={{ color: '#c9a96e' }} />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#8a8a9a', display: 'block' }}>Phone</span>
                      <span style={{ fontSize: '0.88rem' }}>{userDetail.user.phone || '-'}</span>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <FiCalendar style={{ color: '#c9a96e' }} />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#8a8a9a', display: 'block' }}>Joined</span>
                      <span style={{ fontSize: '0.88rem' }}>
                        {new Date(userDetail.user.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FiMapPin style={{ color: '#c9a96e', marginTop: '3px' }} />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#8a8a9a', display: 'block' }}>Address</span>
                      <span style={{ fontSize: '0.88rem' }}>
                        {userDetail.user.address
                          ? `${userDetail.user.address}, ${userDetail.user.city || ''} ${userDetail.user.state || ''} ${userDetail.user.pincode || ''}`
                          : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* User Orders */}
              <div>
                <h6 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiShoppingCart style={{ color: '#c9a96e' }} />
                  Orders ({userDetail.total_orders})
                </h6>

                {userDetail.orders.length === 0 ? (
                  <p style={{ color: '#8a8a9a', fontSize: '0.88rem', padding: '20px 0', textAlign: 'center' }}>
                    No orders yet
                  </p>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {userDetail.orders.map((order) => (
                      <div key={order.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', borderBottom: '1px solid #f0f0f0'
                      }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{order.order_number}</strong>
                          <br />
                          <span style={{ fontSize: '0.75rem', color: '#8a8a9a' }}>
                            {new Date(order.created_at).toLocaleDateString('en-IN')} • {order.payment_method}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '0.9rem' }}>₹{order.final_price}</strong>
                          <br />
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 600,
                            color: order.order_status === 'Delivered' ? '#27ae60' :
                              order.order_status === 'Cancelled' ? '#e74c3c' : '#f39c12'
                          }}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Users;