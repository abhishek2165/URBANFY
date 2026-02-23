import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiPackage,
  FiSettings,
  FiLogOut,
  FiEdit2,
  FiSave,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiChevronRight,
  FiLock,
  FiShoppingBag,
  FiTruck,
  FiCheck,
  FiX,
  FiClock,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../services/api";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile form
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Please login to view profile");
      navigate("/login", { state: { from: "/profile" } });
      return;
    }

    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "8999323926",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      fetchOrders();
    }
  }, [activeTab, isAuthenticated]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get("/orders/my");
      setOrders(res.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const res = await api.put("/auth/profile", profileData);
      updateUser(res.data);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new_password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put("/auth/change-password", {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f39c12";
      case "Confirmed":
        return "#3498db";
      case "Shipped":
        return "#9b59b6";
      case "Delivered":
        return "#27ae60";
      case "Cancelled":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FiClock />;
      case "Confirmed":
        return <FiCheck />;
      case "Shipped":
        return <FiTruck />;
      case "Delivered":
        return <FiCheck />;
      case "Cancelled":
        return <FiX />;
      default:
        return <FiClock />;
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>My Account</h1>
            <p>Manage your profile, orders, and settings</p>
            <div className="breadcrumb-custom">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>My Account</span>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="profile-container">
        <Row className="g-4">
          {/* Sidebar */}
          <Col lg={3}>
            <motion.div
              className="profile-sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* User Info */}
              <div className="sidebar-user">
                <div className="user-avatar-large">
                  <FiUser />
                </div>
                <h5 className="sidebar-username">
                  {user.first_name} {user.last_name}
                </h5>
                <p className="sidebar-email">{user.email}</p>
              </div>

              {/* Navigation */}
              <nav className="sidebar-nav">
                <button
                  className={`sidebar-link ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("profile");
                    setSelectedOrder(null);
                  }}
                >
                  <FiUser /> My Profile
                  <FiChevronRight className="link-arrow" />
                </button>
                <button
                  className={`sidebar-link ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("orders");
                    setSelectedOrder(null);
                  }}
                >
                  <FiPackage /> My Orders
                  <FiChevronRight className="link-arrow" />
                </button>
                <button
                  className={`sidebar-link ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("settings");
                    setSelectedOrder(null);
                  }}
                >
                  <FiSettings /> Settings
                  <FiChevronRight className="link-arrow" />
                </button>
                <button
                  className="sidebar-link logout-link"
                  onClick={handleLogout}
                >
                  <FiLogOut /> Logout
                </button>
              </nav>
            </motion.div>
          </Col>

          {/* Content */}
          <Col lg={9}>
            <AnimatePresence mode="wait">
              {/* ============================================ */}
              {/* PROFILE TAB */}
              {/* ============================================ */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="content-card">
                    <div className="content-header">
                      <h4>
                        <FiUser /> Personal Information
                      </h4>
                      {!editing ? (
                        <button
                          className="edit-btn"
                          onClick={() => setEditing(true)}
                        >
                          <FiEdit2 /> Edit
                        </button>
                      ) : (
                        <div className="edit-actions">
                          <button
                            className="cancel-btn"
                            onClick={() => setEditing(false)}
                          >
                            Cancel
                          </button>
                          <button
                            className="save-btn"
                            onClick={handleProfileSave}
                            disabled={loading}
                          >
                            <FiSave /> {loading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="profile-form">
                      <Row className="g-3">
                        <Col md={6}>
                          <div className="profile-field">
                            <label>First Name</label>
                            {editing ? (
                              <input
                                type="text"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={handleProfileChange}
                                className="profile-input"
                              />
                            ) : (
                              <p className="profile-value">{user.first_name}</p>
                            )}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="profile-field">
                            <label>Last Name</label>
                            {editing ? (
                              <input
                                type="text"
                                name="last_name"
                                value={profileData.last_name}
                                onChange={handleProfileChange}
                                className="profile-input"
                              />
                            ) : (
                              <p className="profile-value">{user.last_name}</p>
                            )}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="profile-field">
                            <label>
                              <FiMail /> Email
                            </label>
                            <p className="profile-value">{user.email}</p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="profile-field">
                            <label>
                              <FiPhone /> Phone
                            </label>
                            {editing ? (
                              <input
                                type="tel"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                                className="profile-input"
                              />
                            ) : (
                              <p className="profile-value">
                                {user.phone || "8999323926"}
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className="profile-field">
                            <label>
                              <FiMapPin /> Address
                            </label>
                            {editing ? (
                              <textarea
                                name="address"
                                value={profileData.address}
                                onChange={handleProfileChange}
                                className="profile-input"
                                rows={2}
                                placeholder="Enter your address"
                              />
                            ) : (
                              <p className="profile-value">
                                {user.address || "Not added yet"}
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="profile-field">
                            <label>City</label>
                            {editing ? (
                              <input
                                type="text"
                                name="city"
                                value={profileData.city}
                                onChange={handleProfileChange}
                                className="profile-input"
                                placeholder="City"
                              />
                            ) : (
                              <p className="profile-value">
                                {user.city || "-"}
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="profile-field">
                            <label>State</label>
                            {editing ? (
                              <input
                                type="text"
                                name="state"
                                value={profileData.state}
                                onChange={handleProfileChange}
                                className="profile-input"
                                placeholder="State"
                              />
                            ) : (
                              <p className="profile-value">
                                {user.state || "-"}
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="profile-field">
                            <label>Pincode</label>
                            {editing ? (
                              <input
                                type="text"
                                name="pincode"
                                value={profileData.pincode}
                                onChange={handleProfileChange}
                                className="profile-input"
                                placeholder="Pincode"
                              />
                            ) : (
                              <p className="profile-value">
                                {user.pincode || "-"}
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className="profile-field">
                            <label>
                              <FiCalendar /> Member Since
                            </label>
                            <p className="profile-value">
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString(
                                    "en-IN",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    },
                                  )
                                : "2026"}
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* ORDERS TAB */}
              {/* ============================================ */}
              {activeTab === "orders" && !selectedOrder && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="content-card">
                    <div className="content-header">
                      <h4>
                        <FiPackage /> My Orders
                      </h4>
                      <span className="order-count">
                        {orders.length} orders
                      </span>
                    </div>

                    {ordersLoading ? (
                      <div
                        className="loading-wrapper"
                        style={{ minHeight: "200px" }}
                      >
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="empty-orders">
                        <div className="empty-orders-icon">📦</div>
                        <h5>No Orders Yet</h5>
                        <p>Start shopping to see your orders here</p>
                        <Link to="/perfumes" className="btn-primary-custom">
                          <FiShoppingBag /> Shop Now
                        </Link>
                      </div>
                    ) : (
                      <div className="orders-list">
                        {orders.map((order, index) => (
                          <motion.div
                            key={order.id}
                            className="order-card"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <div className="order-card-top">
                              <div className="order-card-info">
                                <h6 className="order-number">
                                  {order.order_number}
                                </h6>
                                <span className="order-date">
                                  {new Date(
                                    order.created_at,
                                  ).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div
                                className="order-status-badge"
                                style={{
                                  background: `${getStatusColor(order.order_status)}15`,
                                  color: getStatusColor(order.order_status),
                                }}
                              >
                                {getStatusIcon(order.order_status)}
                                {order.order_status}
                              </div>
                            </div>

                            {/* ⬅️ NEW: Expected Delivery Date */}
                            {order.expected_delivery_formatted &&
                              order.order_status !== "Delivered" &&
                              order.order_status !== "Cancelled" && (
                                <div className="order-expected-delivery">
                                  <FiTruck />
                                  <span>
                                    Expected Delivery:{" "}
                                    <strong>
                                      {order.expected_delivery_formatted}
                                    </strong>
                                  </span>
                                </div>
                              )}

                            {/* ⬅️ NEW: Delivered Message */}
                            {order.order_status === "Delivered" && (
                              <div className="order-delivered-info">
                                <FiCheck />
                                <span>Delivered Successfully! ✅</span>
                              </div>
                            )}

                            <div className="order-card-bottom">
                              <div className="order-card-items">
                                {order.items &&
                                  order.items.slice(0, 3).map((item) => (
                                    <div
                                      key={item.id}
                                      className="order-mini-item"
                                    >
                                      <FiPackage />
                                      <span>
                                        {item.product_name} × {item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                {order.items && order.items.length > 3 && (
                                  <span className="more-items">
                                    +{order.items.length - 3} more
                                  </span>
                                )}
                              </div>
                              <div className="order-card-total">
                                <span>₹{order.final_price}</span>
                                <FiChevronRight className="view-arrow" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* ORDER DETAIL VIEW */}
              {/* ============================================ */}
              {activeTab === "orders" && selectedOrder && (
                <motion.div
                  key="order-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="content-card">
                    <div className="content-header">
                      <button
                        className="back-btn"
                        onClick={() => setSelectedOrder(null)}
                      >
                        ← Back to Orders
                      </button>
                      <div
                        className="order-status-badge"
                        style={{
                          background: `${getStatusColor(selectedOrder.order_status)}15`,
                          color: getStatusColor(selectedOrder.order_status),
                        }}
                      >
                        {getStatusIcon(selectedOrder.order_status)}
                        {selectedOrder.order_status}
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="order-detail-section">
                      <h5>Order Details</h5>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Order Number</span>
                          <span className="detail-value">
                            {selectedOrder.order_number}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Date</span>
                          <span className="detail-value">
                            {new Date(
                              selectedOrder.created_at,
                            ).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Payment</span>
                          <span className="detail-value">
                            {selectedOrder.payment_method}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Phone</span>
                          <span className="detail-value">
                            {selectedOrder.phone}
                          </span>
                        </div>
                      </div>

                      {/* ⬅️⬅️⬅️ NEW: Expected Delivery Date - Big Display */}
                      {selectedOrder.expected_delivery_formatted && (
                        <div className="expected-delivery-card">
                          <div className="expected-delivery-icon">
                            <FiTruck />
                          </div>
                          <div className="expected-delivery-info">
                            <span className="expected-label">
                              {selectedOrder.order_status === "Delivered"
                                ? "Delivered On"
                                : selectedOrder.order_status === "Cancelled"
                                  ? "Was Expected On"
                                  : "Expected Delivery"}
                            </span>
                            <span className="expected-date-value">
                              {selectedOrder.expected_delivery_formatted}
                            </span>
                          </div>

                          {/* Delivery Progress Bar */}
                          {selectedOrder.order_status !== "Cancelled" && (
                            <div className="delivery-progress">
                              <div className="progress-steps">
                                <div
                                  className={`progress-step ${["Pending", "Confirmed", "Shipped", "Delivered"].includes(selectedOrder.order_status) ? "active" : ""}`}
                                >
                                  <div className="step-dot"></div>
                                  <span>Ordered</span>
                                </div>
                                <div
                                  className={`progress-step ${["Confirmed", "Shipped", "Delivered"].includes(selectedOrder.order_status) ? "active" : ""}`}
                                >
                                  <div className="step-dot"></div>
                                  <span>Confirmed</span>
                                </div>
                                <div
                                  className={`progress-step ${["Shipped", "Delivered"].includes(selectedOrder.order_status) ? "active" : ""}`}
                                >
                                  <div className="step-dot"></div>
                                  <span>Shipped</span>
                                </div>
                                <div
                                  className={`progress-step ${selectedOrder.order_status === "Delivered" ? "active" : ""}`}
                                >
                                  <div className="step-dot"></div>
                                  <span>Delivered</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cancelled Message */}
                          {selectedOrder.order_status === "Cancelled" && (
                            <div className="cancelled-message">
                              <FiX /> This order has been cancelled
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    <div className="order-detail-section">
                      <h5>
                        <FiMapPin /> Shipping Address
                      </h5>
                      <p className="address-text">{selectedOrder.address}</p>
                    </div>

                    {/* Order Items */}
                    <div className="order-detail-section">
                      <h5>
                        <FiPackage /> Items
                      </h5>
                      <div className="order-items-list">
                        {selectedOrder.items &&
                          selectedOrder.items.map((item) => (
                            <div key={item.id} className="order-detail-item">
                              <div className="order-detail-item-img">
                                <img
                                  src={
                                    item.product_image ||
                                    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop"
                                  }
                                  alt={item.product_name}
                                />
                              </div>
                              <div className="order-detail-item-info">
                                <h6>{item.product_name}</h6>
                                <span>
                                  Qty: {item.quantity} × ₹{item.price}
                                </span>
                              </div>
                              <span className="order-detail-item-total">
                                ₹{item.total}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="order-detail-section">
                      <h5>Price Summary</h5>
                      <div className="price-summary">
                        <div className="price-row">
                          <span>Subtotal</span>
                          <span>₹{selectedOrder.total_price}</span>
                        </div>
                        <div className="price-row">
                          <span>Shipping</span>
                          <span>
                            {selectedOrder.shipping_charge > 0
                              ? `₹${selectedOrder.shipping_charge}`
                              : "FREE"}
                          </span>
                        </div>
                        {selectedOrder.discount_amount > 0 && (
                          <div className="price-row discount">
                            <span>Discount</span>
                            <span>-₹{selectedOrder.discount_amount}</span>
                          </div>
                        )}
                        <div className="price-row total">
                          <span>Total</span>
                          <span>₹{selectedOrder.final_price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* SETTINGS TAB */}
              {/* ============================================ */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Change Password */}
                  <div className="content-card">
                    <div className="content-header">
                      <h4>
                        <FiLock /> Change Password
                      </h4>
                    </div>

                    <form
                      onSubmit={handlePasswordChange}
                      className="password-form"
                    >
                      <div className="profile-field">
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={passwordData.old_password}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              old_password: e.target.value,
                            })
                          }
                          className="profile-input"
                          placeholder="Enter current password"
                          required
                        />
                      </div>
                      <div className="profile-field">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              new_password: e.target.value,
                            })
                          }
                          className="profile-input"
                          placeholder="Enter new password (min 6 characters)"
                          required
                        />
                      </div>
                      <div className="profile-field">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirm_password: e.target.value,
                            })
                          }
                          className="profile-input"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                      <motion.button
                        type="submit"
                        className="change-password-btn"
                        disabled={passwordLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {passwordLoading ? "Changing..." : "Change Password"}
                      </motion.button>
                    </form>
                  </div>

                  {/* Danger Zone */}
                  <div className="content-card danger-card">
                    <div className="content-header">
                      <h4>
                        <FiLogOut /> Account Actions
                      </h4>
                    </div>
                    <p className="danger-text">
                      Logging out will end your current session.
                    </p>
                    <button className="logout-btn-full" onClick={handleLogout}>
                      <FiLogOut /> Logout from Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
