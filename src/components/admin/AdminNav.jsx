import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaBoxes, FaChartLine, FaSignOutAlt, FaUserShield, FaUserEdit, FaHotel, FaBars, FaTimes, FaWallet } from "react-icons/fa";
import "./AdminNav.css";

function AdminNav({ setAdmin }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
            className="admin-menu-toggle" 
            onClick={() => {
              setShowMobileMenu(!showMobileMenu);
              setShowProfile(false);
            }}
            aria-label="Toggle Menu"
          >
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </button>
          <Link to="/admin-panel" className="admin-app-name">
            FusionX<span>Admin</span>
          </Link>
        </div>

        <div className="admin-nav-right">
          <button 
            className="admin-profile-toggle" 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowMobileMenu(false);
            }}
            title="Admin Profile"
          >
            <FaUserShield />
          </button>
        </div>
      </nav>

      {/* FIXED OVERLAYS MOVED OUTSIDE NAV */}
      <div className={`admin-nav-links ${showMobileMenu ? "mobile-open" : ""}`}>
        <Link 
          to="/admin-panel" 
          className={`admin-nav-btn ${location.pathname === "/admin-panel" ? "active" : ""}`}
          onClick={() => setShowMobileMenu(false)}
        >
          <FaTachometerAlt /> <span>Orders</span>
        </Link>
        <Link 
          to="/admin-inventory" 
          className={`admin-nav-btn ${location.pathname === "/admin-inventory" ? "active" : ""}`}
          onClick={() => setShowMobileMenu(false)}
        >
          <FaBoxes /> <span>Inventory</span>
        </Link>
        <Link 
          to="/sales" 
          className={`admin-nav-btn ${location.pathname === "/sales" ? "active" : ""}`}
          onClick={() => setShowMobileMenu(false)}
        >
          <FaChartLine /> <span>Analytics</span>
        </Link>
        <Link 
          to="/admin-payment" 
          className={`admin-nav-btn ${location.pathname === "/admin-payment" ? "active" : ""}`}
          onClick={() => setShowMobileMenu(false)}
        >
          <FaWallet /> <span>Payment</span>
        </Link>
      </div>

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
        className={`nav-overlay ${(showMobileMenu || showProfile) ? "visible" : ""}`} 
        onClick={() => {
          setShowMobileMenu(false);
          setShowProfile(false);
        }}
      ></div>
    </>
  );
}

export default AdminNav;
