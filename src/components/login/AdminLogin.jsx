import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminAuth.css";
import { FaUserShield, FaLock, FaUser } from "react-icons/fa";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import { useToast } from "../../context/ToastContext";

function AdminLogin({ setAdmin }) {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const q = query(
        collection(db, "admins"),
        where("username", "==", credentials.username.trim())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showToast("Admin not found", "error");
        return;
      }

      const adminDoc = snapshot.docs[0];
      const admin = adminDoc.data();

      if (admin.password !== credentials.password) {
        showToast("Invalid password", "error");
        return;
      }

      if (admin.deleted === true) {
        showToast("Your account has been deleted by Super Admin.", "error");
        return;
      }

      if (admin.blocked === true) {
        showToast("Your account is blocked by Super Admin.", "warning");
        return;
      }

      if (admin.approved !== true) {
        showToast("Your account is waiting for Super Admin approval.", "info");
        return;
      }

      setAdmin(true);

      localStorage.setItem("adminHotelId", admin.username);
      localStorage.setItem("isAdmin", "true");

      showToast("Access Granted. Welcome back.", "success");

      navigate("/admin-panel");
    } catch (error) {
      console.error(error);
      showToast("Critical Auth Failure", "error");
    }
  };

  return (
    <div className="admin-auth-page">

      <div className="admin-auth-card">

        <div className="admin-header-box">
          <div className="admin-badge-icon">
            <FaUserShield />
          </div>
          <h2>Admin Hub</h2>
          <p>Secure access for canteen managers</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="admin-form-group">
            <label><FaUser style={{ marginRight: "8px" }} /> Master Username</label>
            <input
              className="admin-input-premium"
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-form-group">
            <label><FaLock style={{ marginRight: "8px" }} /> Auth Token / Password</label>
            <input
              className="admin-input-premium"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="admin-submit-btn" type="submit">
            Access Terminal
          </button>

        </form>

        <div className="admin-footer-links">
          <p>
            New manager?{" "}
            <span onClick={() => navigate("/AdminSignup")}>
              Create Admin Account
            </span>
          </p>
        </div>

      </div>

    </div>
  );
}

export default AdminLogin;