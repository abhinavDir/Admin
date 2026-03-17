import React from "react";
import { FaBell, FaCheckDouble, FaShoppingBag, FaClock, FaTimes } from "react-icons/fa";
import "./NotificationPanel.css";

const NotificationPanel = ({ notifications, unreadCount, onMarkAsRead, onMarkAllAsRead, onClose }) => {
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    // Simple formatter if date-fns is not available
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-panel-premium">
      <div className="np-header">
        <div className="np-title">
          <FaBell className="bell-glow" />
          <h3>Notifications</h3>
          {unreadCount > 0 && <span className="unread-dot">{unreadCount}</span>}
        </div>
        <div className="np-actions">
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={onMarkAllAsRead} title="Mark all as read">
              <FaCheckDouble />
            </button>
          )}
          <button className="np-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="np-content custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="np-empty">
            <div className="empty-icon-wrap">
              <FaBell />
            </div>
            <p>All clear! No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`np-card ${!n.read ? "unread" : ""}`}
              onClick={() => !n.read && onMarkAsRead(n.id)}
            >
              <div className={`np-icon-box ${n.type || "order"}`}>
                <FaShoppingBag />
              </div>
              <div className="np-details">
                <div className="np-top-row">
                  <span className="np-type">{n.title || "New Order"}</span>
                  <span className="np-time">
                    <FaClock /> {formatTime(n.timestamp)}
                  </span>
                </div>
                <p className="np-message">{n.message}</p>
                {!n.read && <div className="unread-indicator"></div>}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="np-footer">
        <button 
          className="test-alert-btn" 
          onClick={() => {
            window.dispatchEvent(new CustomEvent("test-notification-trigger"));
          }}
        >
          Test Alert
        </button>
        <p>System Monitor Active</p>
      </div>
    </div>
  );
};

export default NotificationPanel;
