import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('urbunfy_admin_token');
    const savedAdmin = localStorage.getItem('urbunfy_admin');

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
        setIsAuthenticated(true);
      } catch {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/admin/login', { email, password });
      const { token, admin: adminData } = res.data;

      localStorage.setItem('urbunfy_admin_token', token);
      localStorage.setItem('urbunfy_admin', JSON.stringify(adminData));

      setAdmin(adminData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('urbunfy_admin_token');
    localStorage.removeItem('urbunfy_admin');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be within AdminAuthProvider');
  return context;
};

export default AdminAuthContext;