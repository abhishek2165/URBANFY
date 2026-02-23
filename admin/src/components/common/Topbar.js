import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const Topbar = ({ title }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <h3>{title || 'Dashboard'}</h3>
      </div>

      <div className="topbar-right">
        <div className="admin-user-info">
          <div className="admin-avatar"><FiUser /></div>
          <div>
            <span className="admin-name">{admin?.full_name || 'Admin'}</span>
            <span className="admin-role">{admin?.role || 'admin'}</span>
          </div>
        </div>
        <button className="topbar-logout" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;