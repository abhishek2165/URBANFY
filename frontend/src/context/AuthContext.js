import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('urbunfy_token');
    const savedUser = localStorage.getItem('urbunfy_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('urbunfy_token', token);
      localStorage.setItem('urbunfy_user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { token, user: newUser } = response.data;

      localStorage.setItem('urbunfy_token', token);
      localStorage.setItem('urbunfy_user', JSON.stringify(newUser));

      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Signup failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('urbunfy_token');
    localStorage.removeItem('urbunfy_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('urbunfy_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;