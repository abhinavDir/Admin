import React, { useEffect, useState } from "react";
import "./admin.css";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  FaChartBar,
  FaClipboardList,
  FaCheck,
  FaTimes,
  FaTruck
} from "react-icons/fa";

const AdminPanel = () => {

  const [orders, setOrders] = useState([]);

  const adminName = localStorage.getItem("adminUser") || "Admin";
  const adminId = localStorage.getItem("adminHotelId") || "DEFAULT_ADMIN";

  /* ================= LOAD ORDERS ================= */

  useEffect(() => {

    const q = query(
      collection(db, "orders"),
      where("adminId", "==", adminId)
    );

    const unsub = onSnapshot(q, (snap) => {

      const data = snap.docs
        .map((docItem) => {

          const d = docItem.data();

          return {
            id: docItem.id,
            ...d,
            items: Array.isArray(d.items) ? d.items : [],
            userName: d.userName || "Customer",
            status: d.status || "Pending",
            total: d.total || 0,
            mobile: d.mobile || "-",
            createdAt: d.createdAt || 0
          };

        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setOrders(data);

    });

    return () => unsub();

  }, [adminId]);

  /* ================= UPDATE STATUS ================= */

  const updateOrderStatus = async (id, status) => {

    await updateDoc(doc(db, "orders", id), {
      status,
      assignedTo: adminName
    });

  };

  /* ================= STATUS BADGE ================= */

  const getStatusClass = (status) => {

    switch (status) {

      case "Order Received":
      case "Pending":
        return "badge-premium received";

      case "Preparing":
      case "Accepted":
        return "badge-premium preparing";

      case "Out for Delivery":
        return "badge-premium delivery";

      case "Delivered":
        return "badge-premium delivered";

      case "Rejected":
        return "badge-premium rejected";

      default:
        return "badge-premium";

    }

  };

  /* ================= STATS ================= */

  const stats = [

    {
      label: "Active Orders",
      value: orders.filter(
        (o) => o.status !== "Delivered" && o.status !== "Rejected"
      ).length,
      icon: <FaClipboardList />
    },

    {
      label: "Total Revenue",
      value: `₹${orders
        .filter((o) => o.status === "Delivered")
        .reduce((acc, curr) => acc + curr.total, 0)}`,
      icon: <FaChartBar />
    },

    {
      label: "Completion",
      value: `${Math.round(
        (orders.filter((o) => o.status === "Delivered").length /
          (orders.length || 1)) *
          100
      )}%`,
      icon: <FaCheck />
    }

  ];

  return (

    <div className="admin-panel">
      <div className="admin-dash-header">
        <h2 className="premium-gradient-text">
          Incoming Orders
        </h2>

        <div className="dashboard-stats-row">
          {stats.map((stat, i) => (
            <div key={i} className="stat-terminal-card">
              <div className="stat-icon-modern">
                {stat.icon}
              </div>
              <div>
                <span className="stat-label-modern">
                  {stat.label}
                </span>
                <span className="stat-value-modern">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="desktop-table">
        <table>
          <thead>
            <tr>
              <th>Entry ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <span className="order-id-tiny">
                    #{o.id.slice(0, 8)}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 800, color: 'var(--bg-dark)' }}>
                    {o.userName}
                  </div>
                </td>
                <td>
                  <div className="item-expansion-box">
                    {o.items.map((i, idx) => {
                      const price = Number(i.discountedPrice ?? i.price ?? 0);
                      const qty = Number(i.qty ?? 1);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "6px 0",
                            fontSize: "0.85rem"
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)' }}>
                            {i.name} <strong style={{color: 'var(--primary)'}}>×{qty}</strong>
                          </span>
                          <span style={{ fontWeight: 700 }}>
                            ₹{price * qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>₹{o.total}</strong>
                </td>
                <td>
                  <span className={getStatusClass(o.status)}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{o.mobile}</div>
                </td>
                <td>
                  <div className="action-group-admin">
                    {(o.status === "Order Received" || o.status === "Pending") && (
                      <>
                        <button
                          className="action-pill-btn"
                          onClick={() => updateOrderStatus(o.id, "Preparing")}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="action-pill-btn danger"
                          onClick={() => updateOrderStatus(o.id, "Rejected")}
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}

                    {(o.status === "Preparing" || o.status === "Accepted") && (
                      <button
                        className="action-pill-btn wide"
                        onClick={() => updateOrderStatus(o.id, "Out for Delivery")}
                      >
                        <FaTruck style={{ marginRight: '8px' }} /> Dispatch
                      </button>
                    )}

                    {o.status === "Out for Delivery" && (
                      <button
                        className="action-pill-btn wide"
                        onClick={() => updateOrderStatus(o.id, "Delivered")}
                      >
                        <FaCheck style={{ marginRight: '8px' }} /> Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="mobile-orders-container">
        {orders.map((o) => (
          <div key={o.id} className="order-card-premium">
            <div className="order-card-header">
              <div className="order-user-info">
                <span className="order-id-tiny">#{o.id.slice(0, 8)}</span>
                <span className="order-user-name">{o.userName}</span>
                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{o.mobile}</span>
              </div>
              <span className={getStatusClass(o.status)}>
                {o.status}
              </span>
            </div>

            <div className="order-items-scroll">
              {o.items.map((i, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>{i.name} × {i.qty}</span>
                  <strong>₹{(Number(i.discountedPrice ?? i.price) * (i.qty || 1))}</strong>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <div className="order-total-price">₹{o.total}</div>
              <div className="action-group-admin">
                {(o.status === "Order Received" || o.status === "Pending") && (
                  <>
                    <button
                      className="action-pill-btn"
                      onClick={() => updateOrderStatus(o.id, "Preparing")}
                    >
                      <FaCheck />
                    </button>
                    <button
                      className="action-pill-btn danger"
                      onClick={() => updateOrderStatus(o.id, "Rejected")}
                    >
                      <FaTimes />
                    </button>
                  </>
                )}

                {(o.status === "Preparing" || o.status === "Accepted") && (
                  <button
                    className="action-pill-btn wide"
                    onClick={() => updateOrderStatus(o.id, "Out for Delivery")}
                  >
                    <FaTruck style={{ marginRight: '8px' }} /> Dispatch
                  </button>
                )}

                {o.status === "Out for Delivery" && (
                  <button
                    className="action-pill-btn wide"
                    onClick={() => updateOrderStatus(o.id, "Delivered")}
                  >
                    <FaCheck style={{ marginRight: '8px' }} /> Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

  );

};

export default AdminPanel;