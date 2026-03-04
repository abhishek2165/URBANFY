import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

import Sidebar from './components/common/Sidebar';
import Topbar from './components/common/Topbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Coupons from './pages/Coupons'; 
import Sales from './pages/Sales';   // ← हे add करा

const ProtectedRoute = ({ children, title }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Topbar title={title} />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute title="Dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute title="Products"><Products /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute title="Orders"><Orders /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute title="Users"><Users /></ProtectedRoute>} />
          {/* ===== हे add करा ===== */}
          <Route path="/coupons" element={<ProtectedRoute title="Coupons"><Coupons /></ProtectedRoute>} />
          {/* ====================== */}
          <Route path="/sales" element={<ProtectedRoute title="Sales"><Sales /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;