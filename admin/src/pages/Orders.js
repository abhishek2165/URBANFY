import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiShoppingCart,
  FiEye,
  FiX,
  FiPackage,
  FiMapPin,
  FiPhone,
  FiUser,
  FiCalendar,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiClock,
  FiSearch,
  FiFilter,
  FiPrinter,
  FiDownload,
  FiFileText,
} from "react-icons/fi";
import api from "../services/api";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const invoiceRef = useRef();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/admin/all");
      setOrders(res.data.orders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setNewPaymentStatus(order.payment_status);
    setShowStatusModal(true);
  };

  // ⬅️ NEW: Invoice Modal
  const openInvoiceModal = (order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  // ⬅️ NEW: Print Invoice
  const handlePrintInvoice = () => {
    const printContent = invoiceRef.current;
    const printWindow = window.open("", "", "width=800,height=900");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${selectedOrder.order_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 30px; }
            .invoice-container { max-width: 700px; margin: 0 auto; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #c9a96e; }
            .brand-name { font-size: 28px; font-weight: 800; letter-spacing: 3px; color: #1a1a2e; }
            .brand-tagline { font-size: 10px; color: #8a8a9a; letter-spacing: 2px; margin-top: 4px; }
            .invoice-title { font-size: 24px; font-weight: 300; color: #c9a96e; text-align: right; letter-spacing: 4px; }
            .invoice-meta { text-align: right; margin-top: 8px; }
            .invoice-meta p { font-size: 11px; color: #666; margin: 2px 0; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #c9a96e; margin-bottom: 10px; font-weight: 600; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-box { background: #f8f9fa; padding: 15px; border-radius: 6px; }
            .info-label { font-size: 10px; color: #8a8a9a; text-transform: uppercase; letter-spacing: 1px; }
            .info-value { font-size: 13px; margin-top: 3px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            thead th { background: #1a1a2e; color: white; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: left; }
            tbody td { padding: 12px; border-bottom: 1px solid #eee; font-size: 12px; }
            tbody tr:hover { background: #f8f9fa; }
            .text-right { text-align: right; }
            .summary-table { margin-top: 15px; margin-left: auto; width: 280px; }
            .summary-table td { padding: 6px 12px; font-size: 12px; }
            .summary-table .total-row td { border-top: 2px solid #1a1a2e; font-size: 15px; font-weight: 700; padding-top: 10px; }
            .discount-text { color: #27ae60; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; }
            .footer p { font-size: 11px; color: #8a8a9a; margin: 3px 0; }
            .footer .brand { font-weight: 700; color: #1a1a2e; letter-spacing: 2px; }
            .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; }
            .expected-delivery { background: #fff8e1; border: 1px solid #ffe0b2; padding: 10px 15px; border-radius: 6px; margin-top: 15px; }
            .expected-delivery span { font-size: 11px; color: #e65100; }
            .expected-delivery strong { color: #bf360c; font-size: 13px; }
            @media print { body { padding: 15px; } .invoice-container { max-width: 100%; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const payload = {};
      if (newStatus !== selectedOrder.order_status) {
        payload.order_status = newStatus;
      }
      if (newPaymentStatus !== selectedOrder.payment_status) {
        payload.payment_status = newPaymentStatus;
      }

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to update");
        setShowStatusModal(false);
        return;
      }

      await api.put(`/orders/admin/${selectedOrder.id}`, payload);
      toast.success("Order status updated!");
      setShowStatusModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "#f39c12",
      Confirmed: "#3498db",
      Shipped: "#9b59b6",
      Delivered: "#27ae60",
      Cancelled: "#e74c3c",
    };
    return colors[status] || "#95a5a6";
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  const getPaymentColor = (status) => {
    const colors = {
      Pending: "#f39c12",
      Paid: "#27ae60",
      Failed: "#e74c3c",
      Refunded: "#3498db",
    };
    return colors[status] || "#95a5a6";
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = !statusFilter || order.order_status === statusFilter;
    const matchSearch =
      !search ||
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem",
            marginBottom: "3px",
          }}
        >
          Orders Management
        </h2>
        <p style={{ color: "#8a8a9a", fontSize: "0.85rem", margin: 0 }}>
          {filteredOrders.length} orders found
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <FiSearch
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8a8a9a",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            placeholder="Search by order number or phone..."
            style={{ paddingLeft: "38px" }}
            autoComplete="off"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-input"
          style={{ width: "180px" }}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Status Summary Cards */}
      <Row className="g-3 mb-4">
        {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(
          (status) => {
            const count = orders.filter(
              (o) => o.order_status === status,
            ).length;
            return (
              <Col key={status}>
                <motion.div
                  onClick={() =>
                    setStatusFilter(statusFilter === status ? "" : status)
                  }
                  style={{
                    background:
                      statusFilter === status
                        ? `${getStatusColor(status)}15`
                        : "white",
                    border: `1px solid ${statusFilter === status ? getStatusColor(status) : "#e0e0e0"}`,
                    borderRadius: "10px",
                    padding: "15px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: getStatusColor(status),
                      margin: 0,
                    }}
                  >
                    {count}
                  </h4>
                  <p
                    style={{ fontSize: "0.75rem", color: "#8a8a9a", margin: 0 }}
                  >
                    {status}
                  </p>
                </motion.div>
              </Col>
            );
          },
        )}
      </Row>

      {/* Orders Table */}
      <motion.div
        className="admin-table-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div
            style={{ padding: "50px", textAlign: "center", color: "#8a8a9a" }}
          >
            Loading orders...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#8a8a9a",
                      }}
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ color: "#1a1a2e" }}>
                          {order.order_number}
                        </strong>
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "#8a8a9a" }}>
                        {new Date(order.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            background: "#f0f0f0",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "0.78rem",
                          }}
                        >
                          {order.items ? order.items.length : 0} items
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#1a1a2e" }}>
                          ₹{order.final_price}
                        </strong>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontSize: "0.82rem" }}>
                            {order.payment_method}
                          </span>
                          <br />
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: getPaymentColor(order.payment_status),
                              fontWeight: 600,
                            }}
                          >
                            {order.payment_status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(order.order_status)}`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{order.phone}</td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            className="action-btn action-btn-view"
                            onClick={() => openDetailModal(order)}
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => openStatusModal(order)}
                            title="Update Status"
                          >
                            <FiTruck />
                          </button>
                          {/* ⬅️ NEW: Invoice Button */}
                          <button
                            className="action-btn"
                            onClick={() => openInvoiceModal(order)}
                            title="Invoice"
                            style={{
                              background: "#fff8e1",
                              color: "#e65100",
                              border: "1px solid #ffe0b2",
                              borderRadius: "6px",
                              width: "32px",
                              height: "32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            <FiFileText />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ============================================ */}
      {/* ORDER DETAIL MODAL */}
      {/* ============================================ */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          style={{ borderBottom: "1px solid #e0e0e0", padding: "18px 22px" }}
        >
          <Modal.Title
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.2rem",
            }}
          >
            <FiPackage style={{ marginRight: "8px", color: "#c9a96e" }} />
            Order Details
          </Modal.Title>
          <button
            onClick={() => setShowDetailModal(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "#8a8a9a",
            }}
          >
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: "22px" }}>
          {selectedOrder && (
            <>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div
                    style={{
                      background: "#f5f6fa",
                      borderRadius: "10px",
                      padding: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <FiShoppingCart style={{ color: "#c9a96e" }} />
                      <strong style={{ fontSize: "0.9rem" }}>Order Info</strong>
                    </div>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", color: "#8a8a9a" }}>
                          Order #
                        </span>
                        <strong style={{ fontSize: "0.82rem" }}>
                          {selectedOrder.order_number}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", color: "#8a8a9a" }}>
                          Date
                        </span>
                        <span style={{ fontSize: "0.82rem" }}>
                          {new Date(
                            selectedOrder.created_at,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", color: "#8a8a9a" }}>
                          Status
                        </span>
                        <span
                          className={`status-badge ${getStatusClass(selectedOrder.order_status)}`}
                        >
                          {selectedOrder.order_status}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", color: "#8a8a9a" }}>
                          Payment
                        </span>
                        <span style={{ fontSize: "0.82rem" }}>
                          {selectedOrder.payment_method} (
                          {selectedOrder.payment_status})
                        </span>
                      </div>
                      {selectedOrder.expected_delivery_formatted && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{ fontSize: "0.82rem", color: "#8a8a9a" }}
                          >
                            Expected Delivery
                          </span>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "#e65100",
                              fontWeight: 600,
                            }}
                          >
                            {selectedOrder.expected_delivery_formatted}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div
                    style={{
                      background: "#f5f6fa",
                      borderRadius: "10px",
                      padding: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <FiMapPin style={{ color: "#c9a96e" }} />
                      <strong style={{ fontSize: "0.9rem" }}>
                        Shipping Info
                      </strong>
                    </div>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "#8a8a9a",
                            textTransform: "uppercase",
                          }}
                        >
                          Address
                        </span>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            margin: "3px 0 0",
                            lineHeight: 1.5,
                          }}
                        >
                          {selectedOrder.address}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FiPhone
                          style={{ fontSize: "0.85rem", color: "#8a8a9a" }}
                        />
                        <span style={{ fontSize: "0.85rem" }}>
                          {selectedOrder.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div style={{ marginBottom: "20px" }}>
                <h6
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    marginBottom: "12px",
                  }}
                >
                  <FiPackage style={{ marginRight: "8px", color: "#c9a96e" }} />
                  Order Items
                </h6>
                {selectedOrder.items &&
                  selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #e0e0e0",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={
                            item.product_image ||
                            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop"
                          }
                          alt={item.product_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: "0.85rem" }}>
                          {item.product_name}
                        </strong>
                        <br />
                        <span style={{ fontSize: "0.78rem", color: "#8a8a9a" }}>
                          Qty: {item.quantity} × ₹{item.price}
                        </span>
                      </div>
                      <strong style={{ fontSize: "0.9rem" }}>
                        ₹{item.total}
                      </strong>
                    </div>
                  ))}
              </div>

              <div
                style={{
                  background: "#f5f6fa",
                  borderRadius: "10px",
                  padding: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#8a8a9a", fontSize: "0.88rem" }}>
                    Subtotal
                  </span>
                  <span style={{ fontSize: "0.88rem" }}>
                    ₹{selectedOrder.total_price}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#8a8a9a", fontSize: "0.88rem" }}>
                    Shipping
                  </span>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      color:
                        selectedOrder.shipping_charge > 0
                          ? "#1a1a2e"
                          : "#27ae60",
                    }}
                  >
                    {selectedOrder.shipping_charge > 0
                      ? `₹${selectedOrder.shipping_charge}`
                      : "FREE"}
                  </span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "#27ae60", fontSize: "0.88rem" }}>
                      Discount
                    </span>
                    <span style={{ color: "#27ae60", fontSize: "0.88rem" }}>
                      -₹{selectedOrder.discount_amount}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1px solid #e0e0e0",
                    paddingTop: "10px",
                    marginTop: "5px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong style={{ fontSize: "1rem" }}>Total</strong>
                  <strong style={{ fontSize: "1.1rem", color: "#1a1a2e" }}>
                    ₹{selectedOrder.final_price}
                  </strong>
                </div>
              </div>

              {selectedOrder.notes && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "12px",
                    background: "#fff3cd",
                    borderRadius: "8px",
                  }}
                >
                  <strong style={{ fontSize: "0.82rem" }}>
                    Customer Notes:
                  </strong>
                  <p style={{ fontSize: "0.85rem", margin: "5px 0 0" }}>
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* ⬅️ NEW: Invoice Button in Detail Modal */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openInvoiceModal(selectedOrder);
                  }}
                  style={{
                    background: "#1a1a2e",
                    color: "white",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FiFileText /> View Invoice
                </button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* ============================================ */}
      {/* UPDATE STATUS MODAL */}
      {/* ============================================ */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
      >
        <Modal.Header
          style={{ borderBottom: "1px solid #e0e0e0", padding: "18px 22px" }}
        >
          <Modal.Title
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.2rem",
            }}
          >
            <FiTruck style={{ marginRight: "8px", color: "#c9a96e" }} />
            Update Order Status
          </Modal.Title>
          <button
            onClick={() => setShowStatusModal(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "#8a8a9a",
            }}
          >
            <FiX />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: "22px" }}>
          {selectedOrder && (
            <>
              <div
                style={{
                  background: "#f5f6fa",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "20px",
                }}
              >
                <strong style={{ fontSize: "0.9rem" }}>
                  {selectedOrder.order_number}
                </strong>
                <br />
                <span style={{ fontSize: "0.82rem", color: "#8a8a9a" }}>
                  ₹{selectedOrder.final_price}
                </span>
              </div>

              <div className="admin-field" style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    fontWeight: 600,
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Order Status
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {[
                    "Pending",
                    "Confirmed",
                    "Shipped",
                    "Delivered",
                    "Cancelled",
                  ].map((status) => (
                    <label
                      key={status}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        border: `1.5px solid ${newStatus === status ? getStatusColor(status) : "#e0e0e0"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        background:
                          newStatus === status
                            ? `${getStatusColor(status)}08`
                            : "white",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="order_status"
                        value={status}
                        checked={newStatus === status}
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{ accentColor: getStatusColor(status) }}
                      />
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: getStatusColor(status),
                        }}
                      ></span>
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: newStatus === status ? 600 : 400,
                        }}
                      >
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-field" style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontWeight: 600,
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="admin-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                className="admin-btn-primary"
                disabled={updating}
                style={{
                  width: "100%",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {updating ? (
                  "Updating..."
                ) : (
                  <>
                    <FiCheck /> Update Status
                  </>
                )}
              </button>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* ============================================ */}
      {/* ⬅️⬅️⬅️ NEW: INVOICE MODAL */}
      {/* ============================================ */}
      <Modal
        show={showInvoiceModal}
        onHide={() => setShowInvoiceModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          style={{
            borderBottom: "1px solid #e0e0e0",
            padding: "15px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Modal.Title
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.1rem",
            }}
          >
            <FiFileText style={{ marginRight: "8px", color: "#c9a96e" }} />
            Invoice
          </Modal.Title>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Print Button */}
            <button
              onClick={handlePrintInvoice}
              style={{
                background: "#1a1a2e",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FiPrinter /> Print
            </button>
            <button
              onClick={() => setShowInvoiceModal(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "#8a8a9a",
              }}
            >
              <FiX />
            </button>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "0", background: "#f5f5f5" }}>
          {selectedOrder && (
            <div style={{ padding: "25px" }}>
              {/* Invoice Content - This gets printed */}
              <div
                ref={invoiceRef}
                style={{
                  background: "white",
                  padding: "35px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                }}
              >
                <div className="invoice-container">
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "30px",
                      paddingBottom: "20px",
                      borderBottom: "3px solid #c9a96e",
                    }}
                  >
                    <div>
                      <h1
                        style={{
                          fontSize: "28px",
                          fontWeight: 800,
                          letterSpacing: "3px",
                          color: "#1a1a2e",
                          margin: 0,
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        URBANFY
                      </h1>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#8a8a9a",
                          letterSpacing: "2px",
                          margin: "4px 0 0",
                          textTransform: "uppercase",
                        }}
                      >
                        Premium Fragrance Store
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <h2
                        style={{
                          fontSize: "22px",
                          fontWeight: 300,
                          color: "#c9a96e",
                          letterSpacing: "4px",
                          margin: 0,
                        }}
                      >
                        INVOICE
                      </h2>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          margin: "5px 0 0",
                        }}
                      >
                        #{selectedOrder.order_number}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          margin: "2px 0 0",
                        }}
                      >
                        Date:{" "}
                        {new Date(selectedOrder.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Order Info */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "25px",
                    }}
                  >
                    {/* Bill To */}
                    <div
                      style={{
                        background: "#f8f9fa",
                        padding: "15px",
                        borderRadius: "6px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#c9a96e",
                          textTransform: "uppercase",
                          letterSpacing: "2px",
                          fontWeight: 600,
                          marginBottom: "8px",
                        }}
                      >
                        Bill To
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          margin: "0 0 4px",
                        }}
                      >
                        Customer
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#555",
                          margin: "0 0 3px",
                          lineHeight: 1.5,
                        }}
                      >
                        {selectedOrder.address}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#555",
                          margin: "0 0 3px",
                        }}
                      >
                        📞 {selectedOrder.phone}
                      </p>
                      {selectedOrder.city && (
                        <p
                          style={{ fontSize: "12px", color: "#555", margin: 0 }}
                        >
                          {selectedOrder.city}
                          {selectedOrder.state
                            ? `, ${selectedOrder.state}`
                            : ""}{" "}
                          {selectedOrder.pincode
                            ? `- ${selectedOrder.pincode}`
                            : ""}
                        </p>
                      )}
                    </div>

                    {/* Order Info */}
                    <div
                      style={{
                        background: "#f8f9fa",
                        padding: "15px",
                        borderRadius: "6px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#c9a96e",
                          textTransform: "uppercase",
                          letterSpacing: "2px",
                          fontWeight: 600,
                          marginBottom: "8px",
                        }}
                      >
                        Order Information
                      </p>
                      <div style={{ display: "grid", gap: "6px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "#8a8a9a" }}>
                            Order Status
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: getStatusColor(selectedOrder.order_status),
                            }}
                          >
                            {selectedOrder.order_status}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "#8a8a9a" }}>
                            Payment
                          </span>
                          <span style={{ fontSize: "11px" }}>
                            {selectedOrder.payment_method}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "#8a8a9a" }}>
                            Payment Status
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: getPaymentColor(
                                selectedOrder.payment_status,
                              ),
                            }}
                          >
                            {selectedOrder.payment_status}
                          </span>
                        </div>
                        {selectedOrder.expected_delivery_formatted && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{ fontSize: "11px", color: "#8a8a9a" }}
                            >
                              Expected Delivery
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#e65100",
                              }}
                            >
                              {selectedOrder.expected_delivery_formatted}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div style={{ marginBottom: "20px" }}>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#c9a96e",
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        fontWeight: 600,
                        marginBottom: "10px",
                      }}
                    >
                      Order Items
                    </p>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              background: "#1a1a2e",
                              color: "white",
                              padding: "10px 12px",
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              fontWeight: 600,
                              textAlign: "left",
                            }}
                          >
                            #
                          </th>
                          <th
                            style={{
                              background: "#1a1a2e",
                              color: "white",
                              padding: "10px 12px",
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              fontWeight: 600,
                              textAlign: "left",
                            }}
                          >
                            Product
                          </th>
                          <th
                            style={{
                              background: "#1a1a2e",
                              color: "white",
                              padding: "10px 12px",
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              fontWeight: 600,
                              textAlign: "center",
                            }}
                          >
                            Qty
                          </th>
                          <th
                            style={{
                              background: "#1a1a2e",
                              color: "white",
                              padding: "10px 12px",
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              fontWeight: 600,
                              textAlign: "right",
                            }}
                          >
                            Price
                          </th>
                          <th
                            style={{
                              background: "#1a1a2e",
                              color: "white",
                              padding: "10px 12px",
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              fontWeight: 600,
                              textAlign: "right",
                            }}
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items &&
                          selectedOrder.items.map((item, index) => (
                            <tr
                              key={item.id}
                              style={{ borderBottom: "1px solid #eee" }}
                            >
                              <td
                                style={{
                                  padding: "12px",
                                  fontSize: "12px",
                                  color: "#8a8a9a",
                                }}
                              >
                                {index + 1}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                }}
                              >
                                {item.product_name}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  fontSize: "12px",
                                  textAlign: "center",
                                }}
                              >
                                {item.quantity}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  fontSize: "12px",
                                  textAlign: "right",
                                }}
                              >
                                ₹{item.price}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  fontSize: "12px",
                                  textAlign: "right",
                                  fontWeight: 600,
                                }}
                              >
                                ₹{item.total}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Price Summary */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ width: "280px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 12px",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#8a8a9a" }}>
                          Subtotal
                        </span>
                        <span style={{ fontSize: "12px" }}>
                          ₹{selectedOrder.total_price}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 12px",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#8a8a9a" }}>
                          Shipping
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color:
                              selectedOrder.shipping_charge > 0
                                ? "#1a1a2e"
                                : "#27ae60",
                          }}
                        >
                          {selectedOrder.shipping_charge > 0
                            ? `₹${selectedOrder.shipping_charge}`
                            : "FREE"}
                        </span>
                      </div>
                      {selectedOrder.discount_amount > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "6px 12px",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#27ae60" }}>
                            Discount{" "}
                            {selectedOrder.coupon_code
                              ? `(${selectedOrder.coupon_code})`
                              : ""}
                          </span>
                          <span style={{ fontSize: "12px", color: "#27ae60" }}>
                            -₹{selectedOrder.discount_amount}
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          borderTop: "2px solid #1a1a2e",
                          marginTop: "5px",
                        }}
                      >
                        <strong style={{ fontSize: "15px" }}>Total</strong>
                        <strong style={{ fontSize: "15px", color: "#1a1a2e" }}>
                          ₹{selectedOrder.final_price}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Expected Delivery */}
                  {selectedOrder.expected_delivery_formatted && (
                    <div
                      style={{
                        background: "#fff8e1",
                        border: "1px solid #ffe0b2",
                        padding: "10px 15px",
                        borderRadius: "6px",
                        marginTop: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#e65100" }}>
                        📦 Expected Delivery:
                      </span>
                      <strong style={{ color: "#bf360c", fontSize: "13px" }}>
                        {selectedOrder.expected_delivery_formatted}
                      </strong>
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    style={{
                      marginTop: "35px",
                      paddingTop: "20px",
                      borderTop: "1px solid #eee",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#1a1a2e",
                        letterSpacing: "2px",
                        margin: "0 0 5px",
                      }}
                    >
                      URBANFY
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#8a8a9a",
                        margin: "0 0 3px",
                      }}
                    >
                      Premium Fragrance Store
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#8a8a9a",
                        margin: "0 0 3px",
                      }}
                    >
                      📞 8999323926 | 📧 support@urbunfy.com
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#8a8a9a",
                        margin: "8px 0 0",
                      }}
                    >
                      Thank you for shopping with us! 🖤
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Orders;
