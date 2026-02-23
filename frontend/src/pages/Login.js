import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to redirect after login
  const from = location.state?.from || '/';

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success(`Welcome back, ${result.user.first_name}!`);
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-80">
          <Col lg={5} md={7}>
            <motion.div
              className="auth-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="auth-header">
                <Link to="/" className="auth-brand">URBANFY</Link>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login to your account to continue shopping</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                {/* Email */}
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className={`auth-input-wrapper ${errors.email ? 'error' : ''}`}>
                    <FiMail className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
                      className="auth-input"
                    />
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className={`auth-input-wrapper ${errors.password ? 'error' : ''}`}>
                    <FiLock className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                {/* Forgot Password */}
                <div className="auth-extras">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">Forgot Password?</a>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="btn-loading">
                      <span className="spinner-small"></span> Logging in...
                    </span>
                  ) : (
                    <>Login <FiArrowRight /></>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="auth-divider">
                <span>OR</span>
              </div>

              {/* Signup Link */}
              <div className="auth-footer">
                <p>
                  Don't have an account?{' '}
                  <Link to="/signup" state={{ from }}>
                    Create Account
                  </Link>
                </p>
              </div>

              {/* Guest */}
              <div className="auth-guest">
                <Link to="/perfumes" className="guest-link">
                  <FiShoppingBag /> Continue as Guest
                </Link>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;