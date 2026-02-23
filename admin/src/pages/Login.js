import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);

    if (result.success) {
      toast.success('Welcome to Admin Panel!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-login-header">
          <h1>URBUNFY</h1>
          <p>Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label><FiMail /> Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@urbunfy.com"
              className="admin-input"
            />
          </div>

          <div className="admin-field">
            <label><FiLock /> Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="admin-input"
            />
          </div>

          <motion.button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Logging in...' : <>Login <FiArrowRight /></>}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: '#8a8a9a' }}>
          © 2026 URBUNFY Admin Panel
        </p>
      </motion.div>
    </div>
  );
};

export default Login;