import React, { useEffect, useState } from "react";
import "./admin.css";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  FaHistory,
  FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const adminId = localStorage.getItem("adminHotelId") || "DEFAULT_ADMIN";

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
            createdAt: d.createdAt || 0
          };
        })
        .filter(o => 
          o.status === "Delivered" || 
          o.status === "Rejected" || 
          o.status === "Cancelled"
        )
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : 0);
          return timeB - timeA;
        });

      setOrders(data);
    });

    return () => unsub();
  }, [adminId]);

  return (
    <div className="admin-panel">
      <div className="admin-dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate("/admin-panel")} className="action-pill-btn" style={{ padding: '10px' }}>
            <FaArrowLeft />
          </button>
          <h2 className="premium-gradient-text" style={{ margin: 0 }}>
            Order History
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
          All completed and cancelled transactions
        </p>
      </div>

      <div className="desktop-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><span className="order-id-tiny">#{o.id.slice(0, 8)}</span></td>
                <td><div style={{ fontWeight: 800, color: 'var(--bg-dark)' }}>{o.userName || "Customer"}</div></td>
                <td><strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>₹{o.total}</strong></td>
                <td>
                  <span className={`badge-premium ${o.status.toLowerCase()}`}>
                    {o.status}
                  </span>
                </td>
                <td><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{o.mobile || "-"}</div></td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>
                    {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : new Date(o.createdAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
            <FaHistory size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p>No history found.</p>
          </div>
        )}
      </div>

      {/* Mobile view integration via card styling */}
      <div className="mobile-orders-container">
        {orders.map((o) => (
          <div key={o.id} className="order-card-premium">
             <div className="order-card-header">
              <div className="order-user-info">
                <span className="order-id-tiny">#{o.id.slice(0, 8)}</span>
                <span className="order-user-name">{o.userName || "Customer"}</span>
              </div>
              <span className={`badge-premium ${o.status.toLowerCase()}`}>
                {o.status}
              </span>
            </div>
            <div style={{ padding: '15px', borderTop: '1px dashed #eee' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total:</span>
                  <strong>₹{o.total}</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Time:</span>
                  <span>{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleTimeString() : new Date(o.createdAt).toLocaleTimeString()}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
