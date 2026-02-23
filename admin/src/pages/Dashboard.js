import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FiPackage, FiUsers, FiShoppingCart, FiDollarSign,
  FiStar, FiTrendingUp
} from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40, border: '3px solid #e0e0e0', borderTop: '3px solid #c9a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.stats?.total_products || 0,
      icon: <FiPackage />,
      color: '#3498db',
      bg: 'rgba(52, 152, 219, 0.1)'
    },
    {
      title: 'Total Users',
      value: stats?.stats?.total_users || 0,
      icon: <FiUsers />,
      color: '#27ae60',
      bg: 'rgba(39, 174, 96, 0.1)'
    },
    {
      title: 'Total Orders',
      value: stats?.stats?.total_orders || 0,
      icon: <FiShoppingCart />,
      color: '#9b59b6',
      bg: 'rgba(155, 89, 182, 0.1)'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.stats?.total_revenue || 0).toLocaleString()}`,
      icon: <FiDollarSign />,
      color: '#c9a96e',
      bg: 'rgba(201, 169, 110, 0.1)'
    },
    {
      title: 'Total Reviews',
      value: stats?.stats?.total_reviews || 0,
      icon: <FiStar />,
      color: '#f39c12',
      bg: 'rgba(243, 156, 18, 0.1)'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '5px' }}>
          Dashboard Overview
        </h2>
        <p style={{ color: '#8a8a9a', fontSize: '0.88rem' }}>Welcome to URBUNFY Admin Panel</p>
      </div>

      {/* Stat Cards */}
      <Row className="g-3 mb-4">
        {statCards.map((card, index) => (
          <Col xl={true} lg={4} md={6} key={index}>
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="stat-card-header">
                <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <FiTrendingUp style={{ color: '#27ae60', fontSize: '1rem' }} />
              </div>
              <div className="stat-card-body">
                <h3>{card.value}</h3>
                <p>{card.title}</p>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Order Stats & Categories */}
      <Row className="g-3 mb-4">
        <Col lg={6}>
          <motion.div
            className="admin-table-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="admin-table-header">
              <h5>Order Statistics</h5>
            </div>
            <table className="admin-table">
              <tbody>
                <tr>
                  <td>Pending Orders</td>
                  <td><span className="status-badge status-pending">{stats?.order_stats?.pending || 0}</span></td>
                </tr>
                <tr>
                  <td>Confirmed Orders</td>
                  <td><span className="status-badge status-confirmed">{stats?.order_stats?.confirmed || 0}</span></td>
                </tr>
                <tr>
                  <td>Shipped Orders</td>
                  <td><span className="status-badge status-shipped">{stats?.order_stats?.shipped || 0}</span></td>
                </tr>
                <tr>
                  <td>Delivered Orders</td>
                  <td><span className="status-badge status-delivered">{stats?.order_stats?.delivered || 0}</span></td>
                </tr>
                <tr>
                  <td>Cancelled Orders</td>
                  <td><span className="status-badge status-cancelled">{stats?.order_stats?.cancelled || 0}</span></td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </Col>

        <Col lg={6}>
          <motion.div
            className="admin-table-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="admin-table-header">
              <h5>Category Overview</h5>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Products</th>
                </tr>
              </thead>
              <tbody>
                {stats?.category_stats?.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td><strong>{cat.product_count}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </Col>
      </Row>

      {/* Recent Orders */}
      <motion.div
        className="admin-table-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="admin-table-header">
          <h5>Recent Orders</h5>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recent_orders?.length > 0 ? (
              stats.recent_orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.order_number}</strong></td>
                  <td>{order.customer}</td>
                  <td>₹{order.total}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString('en-IN')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#8a8a9a' }}>
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Dashboard;