import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiPhone,
  FiUser,
  FiCreditCard,
  FiTruck,
  FiShield,
  FiCheck,
  FiArrowLeft,
  FiChevronRight,
  FiPackage,
  FiTag,
  FiX,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../services/api";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "8999323926",
    address: "",
    city: "",
    state: "",
    pincode: "",
    payment_method: "COD",
    notes: "",
  });

  // ===== COUPON STATES =====
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);

  // ===== CALCULATIONS =====
  const subtotal = cartTotal;
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal - couponDiscount + shipping;

  // ============================================
  // USE EFFECTS
  // ============================================
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Please login to continue checkout");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (cartItems.length === 0 && !orderPlaced) {
      toast.info("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "8999323926",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      }));
    }
  }, [isAuthenticated, user, cartItems.length, navigate, orderPlaced]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableCoupons();
    }
  }, [isAuthenticated]);

  const fetchAvailableCoupons = async () => {
    try {
      const res = await api.get("/coupons/available");
      setAvailableCoupons(res.data.coupons || []);
    } catch (err) {
      console.log("Could not fetch coupons");
    }
  };

  // ============================================
  // FORM HANDLERS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter valid 10-digit phone number";
    }
    if (
      formData.pincode &&
      !/^\d{6}$/.test(formData.pincode.replace(/\s/g, ""))
    ) {
      newErrors.pincode = "Enter valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // COUPON FUNCTIONS - Component च्या आत!
  // ============================================
  const handleApplyCoupon = async (code = null) => {
    const codeToApply = code || couponCode.trim().toUpperCase();

    if (!codeToApply) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const response = await api.post("/coupons/apply", {
        code: codeToApply,
        cart_total: subtotal,
      });

      const data = response.data;

      if (data.success) {
        setAppliedCoupon(data);
        setCouponDiscount(data.discount_amount);
        setCouponCode(data.coupon_code);
        setShowCoupons(false);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // ============================================
  // SYNC CART TO SERVER
  // ============================================
  const syncCartToServer = async () => {
    for (const item of cartItems) {
      try {
        await api.post("/cart/add", {
          product_id: item.id,
          quantity: item.quantity,
        });
      } catch (err) {
        // ignore if already in cart
      }
    }
  };

  // ============================================
  // RAZORPAY PAYMENT HANDLER
  // ============================================
  const handleRazorpayPayment = async () => {
    try {
      await syncCartToServer();

      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

      const response = await api.post("/payment/create-order", {
        address: fullAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        phone: formData.phone,
        payment_method: "Online",
        notes: formData.notes,
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null,
      });

      const data = response.data;

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "URBUNFY",
        description: `Order #${data.order_number}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: `${formData.first_name} ${formData.last_name}`,
          email: user?.email || "",
          contact: formData.phone,
        },
        theme: {
          color: "#000000",
        },

        handler: async function (razorpayResponse) {
          try {
            const verifyRes = await api.post("/payment/verify", {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              order_id: data.order_id,
            });

            setOrderData(verifyRes.data.order);
            setOrderPlaced(true);
            clearCart();
            toast.success("Payment successful! Order confirmed! 🎉");
          } catch (verifyError) {
            console.error("Verify error:", verifyError);
            toast.error("Payment verification failed. Contact support.");
          }
        },

        modal: {
          ondismiss: async function () {
            try {
              await api.post(`/payment/failed?order_id=${data.order_id}`);
            } catch (e) {}
            toast.warning("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async function (failedResponse) {
        console.error("Payment failed:", failedResponse.error);
        try {
          await api.post(`/payment/failed?order_id=${data.order_id}`);
        } catch (e) {}
        toast.error("Payment failed! Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error(error.response?.data?.detail || "Failed to initiate payment");
      setLoading(false);
    }
  };

  // ============================================
  // COD ORDER HANDLER
  // ============================================
  const handleCODOrder = async () => {
    try {
      await syncCartToServer();

      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

      const response = await api.post("/orders/place", {
        address: fullAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        phone: formData.phone,
        payment_method: "COD",
        notes: formData.notes,
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null,
      });

      setOrderData(response.data);
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully! 🎉");
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.detail || "Failed to place order");
    }
  };

  // ============================================
  // MAIN PLACE ORDER FUNCTION
  // ============================================
  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (formData.payment_method === "Online") {
        await handleRazorpayPayment();
      } else {
        await handleCODOrder();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      if (formData.payment_method === "COD") {
        setLoading(false);
      }
    }
  };

  // ============================================
  // ORDER SUCCESS SCREEN
  // ============================================
  if (orderPlaced && orderData) {
    return (
      <div className="checkout-page">
        <Container>
          <motion.div
            className="order-success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-icon">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <FiCheck />
              </motion.div>
            </div>

            <motion.h2
              className="success-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {orderData.payment_method === "Online"
                ? "Payment Successful! 🎉"
                : "Order Placed Successfully!"}
            </motion.h2>

            <motion.p
              className="success-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Thank you for shopping with URBANFY
            </motion.p>

            {/* ⬅️ NEW: SMS Notification Info */}
            <motion.div
              className="sms-notification-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              style={{
                background: "#e8f5e9",
                padding: "12px 20px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.9rem",
                color: "#2e7d32",
              }}
            >
              📱 Order confirmation SMS sent to your phone number!
            </motion.div>

            <motion.div
              className="success-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="success-detail-row">
                <span>Order Number</span>
                <strong>{orderData.order_number}</strong>
              </div>
              <div className="success-detail-row">
                <span>Total Amount</span>
                <strong>₹{orderData.final_price}</strong>
              </div>

              {orderData.discount_amount > 0 && (
                <div className="success-detail-row">
                  <span>Coupon Discount</span>
                  <strong className="discount-text">
                    -₹{orderData.discount_amount}
                  </strong>
                </div>
              )}

              <div className="success-detail-row">
                <span>Payment Method</span>
                <strong>{orderData.payment_method}</strong>
              </div>
              <div className="success-detail-row">
                <span>Payment Status</span>
                <strong
                  className={`status-badge ${orderData.payment_status === "Paid" ? "paid" : ""}`}
                >
                  {orderData.payment_status}
                </strong>
              </div>
              <div className="success-detail-row">
                <span>Order Status</span>
                <strong className="status-badge">
                  {orderData.order_status}
                </strong>
              </div>

              {/* ⬅️⬅️⬅️ NEW: Expected Delivery Date */}
              {orderData.expected_delivery_formatted && (
                <div className="success-detail-row expected-delivery-row">
                  <span>📦 Expected Delivery</span>
                  <strong className="expected-date">
                    {orderData.expected_delivery_formatted}
                  </strong>
                </div>
              )}

              {orderData.razorpay_payment_id && (
                <div className="success-detail-row">
                  <span>Transaction ID</span>
                  <strong style={{ fontSize: "0.85rem" }}>
                    {orderData.razorpay_payment_id}
                  </strong>
                </div>
              )}
            </motion.div>

            <motion.div
              className="success-items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h5>Order Items</h5>
              {orderData.items &&
                orderData.items.map((item) => (
                  <div key={item.id} className="success-item">
                    <FiPackage />
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>₹{item.total}</span>
                  </div>
                ))}
            </motion.div>

            <motion.div
              className="success-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Link to="/profile" className="btn-primary-custom">
                <FiPackage /> View My Orders
              </Link>
              <Link to="/perfumes" className="btn-secondary-custom">
                Continue Shopping
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </div>
    );
  }

  // ============================================
  // CHECKOUT FORM
  // ============================================
  return (
    <div className="checkout-page">
      {/* Breadcrumb */}
      <div className="checkout-breadcrumb">
        <Container>
          <div className="breadcrumb-links">
            <Link to="/cart">
              <FiArrowLeft /> Back to Cart
            </Link>
            <FiChevronRight />
            <span>Checkout</span>
          </div>
        </Container>
      </div>

      <Container className="checkout-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="checkout-title">Checkout</h2>
          <p className="checkout-subtitle">
            Complete your order by filling in the details below
          </p>
        </motion.div>

        <Row className="g-4 mt-1">
          {/* Left - Form */}
          <Col lg={7}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Shipping Details */}
              <div className="checkout-section">
                <div className="checkout-section-header">
                  <FiMapPin />
                  <h4>Shipping Details</h4>
                </div>

                <div className="checkout-form">
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="checkout-field">
                        <label>First Name *</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="First name"
                          className={`checkout-input ${errors.first_name ? "error" : ""}`}
                        />
                        {errors.first_name && (
                          <span className="field-error">
                            {errors.first_name}
                          </span>
                        )}
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="checkout-field">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          placeholder="Last name"
                          className={`checkout-input ${errors.last_name ? "error" : ""}`}
                        />
                        {errors.last_name && (
                          <span className="field-error">
                            {errors.last_name}
                          </span>
                        )}
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="checkout-field">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Phone number"
                          className={`checkout-input ${errors.phone ? "error" : ""}`}
                        />
                        {errors.phone && (
                          <span className="field-error">{errors.phone}</span>
                        )}
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="checkout-field">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="6-digit pincode"
                          maxLength={6}
                          className={`checkout-input ${errors.pincode ? "error" : ""}`}
                        />
                        {errors.pincode && (
                          <span className="field-error">{errors.pincode}</span>
                        )}
                      </div>
                    </Col>

                    <Col xs={12}>
                      <div className="checkout-field">
                        <label>Full Address *</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="House no, street, area, landmark"
                          rows={3}
                          className={`checkout-input checkout-textarea ${errors.address ? "error" : ""}`}
                        />
                        {errors.address && (
                          <span className="field-error">{errors.address}</span>
                        )}
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="checkout-field">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          className={`checkout-input ${errors.city ? "error" : ""}`}
                        />
                        {errors.city && (
                          <span className="field-error">{errors.city}</span>
                        )}
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="checkout-field">
                        <label>State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="State"
                          className={`checkout-input ${errors.state ? "error" : ""}`}
                        />
                        {errors.state && (
                          <span className="field-error">{errors.state}</span>
                        )}
                      </div>
                    </Col>

                    <Col xs={12}>
                      <div className="checkout-field">
                        <label>Order Notes (Optional)</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Any special instructions..."
                          rows={2}
                          className="checkout-input checkout-textarea"
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <div className="checkout-section-header">
                  <FiCreditCard />
                  <h4>Payment Method</h4>
                </div>

                <div className="payment-options">
                  <label
                    className={`payment-option ${formData.payment_method === "Online" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="Online"
                      checked={formData.payment_method === "Online"}
                      onChange={handleChange}
                    />
                    <div className="payment-option-content">
                      <div className="payment-option-icon">💳</div>
                      <div>
                        <strong>Online Payment</strong>
                        <p>UPI, Cards, Net Banking, Wallets</p>
                      </div>
                    </div>
                    {formData.payment_method === "Online" && (
                      <FiCheck className="payment-check" />
                    )}
                  </label>
                </div>

                {formData.payment_method === "Online" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="online-payment-info"
                    style={{
                      background: "#f0f9ff",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      marginTop: "12px",
                      fontSize: "0.9rem",
                      color: "#1a73e8",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FiShield />
                    Secure payment powered by Razorpay. UPI, Credit/Debit Card,
                    Net Banking supported.
                  </motion.div>
                )}
              </div>

              {/* ===== COUPON SECTION ===== */}
              <div className="checkout-section">
                <div className="checkout-section-header">
                  <FiTag />
                  <h4>Apply Coupon</h4>
                </div>

                {appliedCoupon ? (
                  <motion.div
                    className="coupon-applied"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="coupon-applied-info">
                      <div className="coupon-applied-badge">🎉</div>
                      <div>
                        <strong className="coupon-applied-code">
                          {appliedCoupon.coupon_code}
                        </strong>
                        <p className="coupon-applied-msg">
                          You save ₹{couponDiscount.toFixed(0)}!
                        </p>
                      </div>
                    </div>
                    <button
                      className="coupon-remove-btn"
                      onClick={handleRemoveCoupon}
                    >
                      <FiX /> Remove
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="coupon-input-wrapper">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="coupon-input"
                        maxLength={20}
                      />
                      <motion.button
                        className="coupon-apply-btn"
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponCode.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </motion.button>
                    </div>

                    {availableCoupons.length > 0 && (
                      <div className="available-coupons-section">
                        <button
                          className="show-coupons-btn"
                          onClick={() => setShowCoupons(!showCoupons)}
                        >
                          🎟️ {showCoupons ? "Hide" : "View"} Available Coupons (
                          {availableCoupons.length})
                        </button>

                        <AnimatePresence>
                          {showCoupons && (
                            <motion.div
                              className="coupons-list"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {availableCoupons.map((c) => (
                                <div key={c.id} className="coupon-card">
                                  <div className="coupon-card-left">
                                    <span className="coupon-card-code">
                                      {c.code}
                                    </span>
                                    <span className="coupon-card-desc">
                                      {c.description}
                                    </span>
                                  </div>
                                  <motion.button
                                    className="coupon-card-apply"
                                    onClick={() => handleApplyCoupon(c.code)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Apply
                                  </motion.button>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* ===== END COUPON SECTION ===== */}
            </motion.div>
          </Col>

          {/* Right - Order Summary */}
          <Col lg={5}>
            <motion.div
              className="checkout-summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="summary-heading">Order Summary</h4>

              <div className="checkout-items">
                {cartItems.map((item) => {
                  const price = item.discount_price || item.price;
                  return (
                    <div key={item.id} className="checkout-item">
                      <div className="checkout-item-image">
                        <img
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop"
                          }
                          alt={item.name}
                        />
                        <span className="checkout-item-qty">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="checkout-item-info">
                        <h6>{item.name}</h6>
                        <span className="checkout-item-brand">
                          {item.brand || "URBUNFY"}
                        </span>
                      </div>
                      <span className="checkout-item-price">
                        ₹{(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-price-details">
                <div className="checkout-price-row">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="checkout-price-row discount-row">
                    <span>Coupon ({appliedCoupon?.coupon_code})</span>
                    <span className="discount-text">
                      -₹{couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="checkout-price-row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "free-text" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="checkout-price-divider"></div>
                <div className="checkout-price-row total-row">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner-small"></span>
                    {formData.payment_method === "Online"
                      ? "Processing Payment..."
                      : "Placing Order..."}
                  </span>
                ) : (
                  <>
                    {formData.payment_method === "Online"
                      ? `Pay ₹${total.toFixed(2)}`
                      : `Place Order - ₹${total.toFixed(2)}`}
                  </>
                )}
              </motion.button>

              <div className="checkout-secure">
                <div className="secure-item">
                  <FiShield />
                  <span>Secure Checkout</span>
                </div>
                <div className="secure-item">
                  <FiTruck />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Checkout;
