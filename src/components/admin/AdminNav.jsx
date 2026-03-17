import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaBoxes, FaChartLine, FaSignOutAlt, FaUserShield, FaUserEdit, FaHotel, FaBars, FaTimes, FaWallet, FaBell, FaHistory } from "react-icons/fa";
import "./AdminNav.css";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationPanel from "./NotificationPanel";

function AdminNav({ setAdmin }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get Admin ID from localStorage for FCM token storage
  const adminId = localStorage.getItem("adminHotelId") || "default_admin";
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(adminId);

  const adminData = (() => {
    try {
      const raw = localStorage.getItem("adminUser");
      if (!raw) return { username: "Manager" };
      return JSON.parse(raw);
    } catch {
      return { username: "Manager" };
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminHotelId");
    setAdmin(false);
    navigate("/AdminLogin");
  };

  return (
    <>
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <button 
            className="admin-hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(true)}
            title="Menu"
          >
            <FaBars />
          </button>
          <Link to="/admin-panel" className="admin-app-name">
            FusionX<span>Admin</span>
          </Link>
        </div>

        {/* NAV LINKS (Desktop Pills) */}
        {!showProfile && (
          <div className="admin-nav-links-desktop">
            <Link
              to="/admin-panel"
              className={`admin-nav-btn ${location.pathname === "/admin-panel" ? "active" : ""}`}
            >
              <FaTachometerAlt /> <span>Orders</span>
            </Link>
            <Link
              to="/admin-inventory"
              className={`admin-nav-btn ${location.pathname === "/admin-inventory" ? "active" : ""}`}
            >
              <FaBoxes /> <span>Inventory</span>
            </Link>
            <Link
              to="/admin-history"
              className={`admin-nav-btn ${location.pathname === "/admin-history" ? "active" : ""}`}
            >
              <FaHistory /> <span>History</span>
            </Link>
            <Link
              to="/sales"
              className={`admin-nav-btn ${location.pathname === "/sales" ? "active" : ""}`}
            >
              <FaChartLine /> <span>Analytics</span>
            </Link>
            <Link
              to="/admin-payment"
              className={`admin-nav-btn ${location.pathname === "/admin-payment" ? "active" : ""}`}
            >
              <FaWallet /> <span>Payment</span>
            </Link>
          </div>
        )}

        <div className="admin-nav-right">
          <button
            className={`admin-nav-trigger ${showNotifications ? "active" : ""}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            title="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>

          <button
            className="admin-profile-toggle"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            title="Admin Profile"
          >
            <FaUserShield />
          </button>
        </div>
      </nav>

      {showNotifications && (
        <NotificationPanel 
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {showProfile && (
        <div className="admin-mini-profile-card">
          <button className="profile-close-btn" onClick={() => setShowProfile(false)}>
            <FaTimes />
          </button>
          <div className="profile-card-header">
            <div className="profile-avatar-small">
              {adminData.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4>{adminData.username}</h4>
              <p>System Administrator</p>
            </div>
          </div>

          <div className="profile-card-content">
            <div className="profile-info-item">
              <FaHotel /> <span>ID: {localStorage.getItem("adminHotelId") || "N/A"}</span>
            </div>
          </div>

          <div className="profile-card-footer">
            <button className="profile-action-btn" onClick={() => { navigate("/admin-inventory"); setShowProfile(false); }}>
              <FaUserEdit /> Edit Menu
            </button>
            <button className="profile-action-btn logout" onClick={handleLogout}>
              <FaSignOutAlt /> Terminate Session
            </button>
          </div>
        </div>
      )}

      <div
        className={`nav-overlay ${showProfile || showNotifications || isMobileMenuOpen ? "visible" : ""}`}
        onClick={() => {
          setShowProfile(false);
          setShowNotifications(false);
          setIsMobileMenuOpen(false);
        }}
      ></div>

      {/* MOBILE SIDE DRAWER */}
      <div className={`admin-mobile-drawer ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-logo">FusionX<span>Admin</span></div>
          <button className="drawer-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="drawer-links">
          <Link to="/admin-panel" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/admin-panel" ? "active" : ""}>
            <FaTachometerAlt /> Orders
          </Link>
          <Link to="/admin-inventory" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/admin-inventory" ? "active" : ""}>
            <FaBoxes /> Inventory
          </Link>
          <Link to="/admin-history" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/admin-history" ? "active" : ""}>
            <FaHistory /> History
          </Link>
          <Link to="/sales" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/sales" ? "active" : ""}>
            <FaChartLine /> Analytics
          </Link>
          <Link to="/admin-payment" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/admin-payment" ? "active" : ""}>
            <FaWallet /> Payment
          </Link>
          <div className="drawer-divider"></div>
          <button className="drawer-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="mobile-bottom-nav">
        <Link
          to="/admin-panel"
          className={`mob-nav-item ${location.pathname === "/admin-panel" ? "active" : ""}`}
        >
          <FaTachometerAlt />
          <span>Orders</span>
        </Link>
        <Link
          to="/admin-inventory"
          className={`mob-nav-item ${location.pathname === "/admin-inventory" ? "active" : ""}`}
        >
          <FaBoxes />
          <span>Stock</span>
        </Link>
        <Link
          to="/admin-history"
          className={`mob-nav-item ${location.pathname === "/admin-history" ? "active" : ""}`}
        >
          <FaHistory />
          <span>History</span>
        </Link>
        <Link
          to="/sales"
          className={`mob-nav-item ${location.pathname === "/sales" ? "active" : ""}`}
        >
          <FaChartLine />
          <span>Sales</span>
        </Link>
      </div>
    </>
  );
}

export default AdminNav;
