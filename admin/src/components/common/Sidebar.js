import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiShoppingCart, FiUsers, FiTag ,FiZap     // ← FiTag add करा
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <h2>URBUNFY</h2>
        <span>Admin Panel</span>
      </div>

      <nav className="sidebar-menu">
        <span className="sidebar-label">Main</span>

        <Link to="/" className={`sidebar-item ${isActive('/') ? 'active' : ''}`}>
          <FiGrid /> Dashboard
        </Link>

        <span className="sidebar-label">Management</span>

        <Link to="/products" className={`sidebar-item ${isActive('/products') ? 'active' : ''}`}>
          <FiPackage /> Products
        </Link>

        <Link to="/orders" className={`sidebar-item ${isActive('/orders') ? 'active' : ''}`}>
          <FiShoppingCart /> Orders
        </Link>

        <Link to="/users" className={`sidebar-item ${isActive('/users') ? 'active' : ''}`}>
          <FiUsers /> Users
        </Link>

        {/* ===== हे add करा ===== */}
        <Link to="/coupons" className={`sidebar-item ${isActive('/coupons') ? 'active' : ''}`}>
          <FiTag /> Coupons
        </Link>
        {/* ====================== */}
        <Link to="/sales" className={`sidebar-item ${isActive('/sales') ? 'active' : ''}`}><FiZap /> Sales & Offers</Link>
      </nav>

      <div className="sidebar-footer">
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', textAlign: 'center' }}>
          © 2026 URBUNFY
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;