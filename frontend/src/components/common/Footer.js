import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      {/* Newsletter Section */}
      <div className="newsletter-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h3 className="newsletter-title">Stay in Touch</h3>
              <p className="newsletter-text">
                Subscribe to get exclusive offers, new arrivals & fragrance tips.
              </p>
            </Col>
            <Col lg={6}>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="newsletter-input"
                />
                <motion.button
                  type="submit"
                  className="newsletter-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <Container>
          <Row>
            {/* Brand Column */}
            <Col lg={4} md={6} className="mb-4">
              <div className="footer-brand">
                <h2 className="footer-logo">URBANFY</h2>
                <p className="footer-brand-tagline">Premium Fragrances</p>
                <p className="footer-description">
                  Discover the world of premium fragrances. From luxurious perfumes to
                  traditional attars and refreshing body mists, URBANFY brings you the
                  finest scents from around the world.
                </p>
                <div className="footer-social">
                  <motion.a href="https://www.instagram.com/_urbanfyperfumes?igsh=eXhrZHZoY3FlZGcy" className="social-icon" whileHover={{ scale: 1.2, y: -3 }}>
                    <FiInstagram />
                  </motion.a>
                  <motion.a href="#" className="social-icon" whileHover={{ scale: 1.2, y: -3 }}>
                    <FiFacebook />
                  </motion.a>
                  <motion.a href="#" className="social-icon" whileHover={{ scale: 1.2, y: -3 }}>
                    <FiTwitter />
                  </motion.a>
                  <motion.a href="#" className="social-icon" whileHover={{ scale: 1.2, y: -3 }}>
                    <FiYoutube />
                  </motion.a>
                </div>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} className="mb-4">
              <h5 className="footer-heading">Quick Links</h5>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li> 
                <li><Link to="/perfumes">Perfumes</Link></li>
                <li><Link to="/attars">Attars</Link></li>
                <li><Link to="/bodymists">Body Mists</Link></li>
                <li><Link to="/cart">Cart</Link></li>
              </ul>
            </Col>

            {/* Customer Service */}
            <Col lg={3} md={6} className="mb-4">
              <h5 className="footer-heading">Customer Service</h5>
              <ul className="footer-links">
                <li><Link to="/Profile">My Account</Link></li>
                <li><Link to="/Profile">Order Tracking</Link></li>
                <li><a href="#">Shipping Policy</a></li>
                <li><a href="#">Return Policy</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </Col>

            {/* Contact */}
            <Col lg={3} md={6} className="mb-4">
              <h5 className="footer-heading">Contact Us</h5>
              <ul className="footer-contact">
                <li>
                  <FiMapPin className="contact-icon" />
                  <span>Sr.no 21, Sai Siddhi Chowk, Ambegaon Pathar,Dhankwadi,Pune-411046</span>
                </li>
                <li>
                  <FiPhone className="contact-icon" />
                  <span>+91 8999323926</span>
                </li>
                <li>
                  <FiMail className="contact-icon" />
                  <span>urbanfy.05@gmail.com</span>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <Container>
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2026 URBANFY. All Rights Reserved.
            </p>
            <div className="payment-methods">
              <span>We Accept:</span>
              <span className="payment-badge">💳 Cards</span>
              <span className="payment-badge">📱 UPI</span>
              <span className="payment-badge">🏦 Net Banking</span>
              <span className="payment-badge">💵 COD</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;