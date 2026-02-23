import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiPhone,
  FiEye, FiEyeOff, FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '8999323926',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await signup({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (result.success) {
        toast.success(`Welcome to URBANFY, ${result.user.first_name}!`);
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || 'Signup failed');
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
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join URBANFY for exclusive deals and premium fragrances</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                {/* Name Row */}
                <Row className="g-3">
                  <Col xs={6}>
                    <div className="auth-field">
                      <label className="auth-label">First Name</label>
                      <div className={`auth-input-wrapper ${errors.first_name ? 'error' : ''}`}>
                        <FiUser className="auth-input-icon" />
                        <input
                          type="text"
                          name="first_name"
                          placeholder="First name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="auth-input"
                        />
                      </div>
                      {errors.first_name && <span className="auth-error">{errors.first_name}</span>}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="auth-field">
                      <label className="auth-label">Last Name</label>
                      <div className={`auth-input-wrapper ${errors.last_name ? 'error' : ''}`}>
                        <FiUser className="auth-input-icon" />
                        <input
                          type="text"
                          name="last_name"
                          placeholder="Last name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="auth-input"
                        />
                      </div>
                      {errors.last_name && <span className="auth-error">{errors.last_name}</span>}
                    </div>
                  </Col>
                </Row>

                {/* Email */}
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className={`auth-input-wrapper ${errors.email ? 'error' : ''}`}>
                    <FiMail className="auth-input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className="auth-field">
                  <label className="auth-label">Phone Number</label>
                  <div className={`auth-input-wrapper ${errors.phone ? 'error' : ''}`}>
                    <FiPhone className="auth-input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                  {errors.phone && <span className="auth-error">{errors.phone}</span>}
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className={`auth-input-wrapper ${errors.password ? 'error' : ''}`}>
                    <FiLock className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
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

                {/* Confirm Password */}
                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <div className={`auth-input-wrapper ${errors.confirm_password ? 'error' : ''}`}>
                    <FiLock className="auth-input-icon" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm_password"
                      placeholder="Confirm your password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.confirm_password && <span className="auth-error">{errors.confirm_password}</span>}
                </div>

                {/* Terms */}
                <div className="auth-terms">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>
                      I agree to the <a href="#">Terms of Service</a> and{' '}
                      <a href="#">Privacy Policy</a>
                    </span>
                  </label>
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
                      <span className="spinner-small"></span> Creating Account...
                    </span>
                  ) : (
                    <>Create Account <FiArrowRight /></>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="auth-divider">
                <span>OR</span>
              </div>

              {/* Login Link */}
              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" state={{ from }}>
                    Login
                  </Link>
                </p>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;