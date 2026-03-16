import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminAuth.css";
import { FaUserPlus, FaLock, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

import { useToast } from "../../context/ToastContext";

function AdminSignup() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    canteen: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !adminData.name ||
      !adminData.email ||
      !adminData.phone ||
      !adminData.canteen ||
      !adminData.username ||
      !adminData.password
    ) {
      showToast("All fields are mandatory for security", "warning");
      return;
    }

    try {
      await addDoc(collection(db, "admins"), {
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        canteen: adminData.canteen,
        username: adminData.username.trim(),
        password: adminData.password,

        // default account state
        approved: false,
        blocked: false,
        deleted: false,

        createdAt: new Date()
      });

      showToast("Request Sent. Waiting for validation.", "success");

      navigate("/AdminLogin");
    } catch (error) {
      console.error(error);
      showToast("Signup Failed: " + error.message, "error");
    }
  };

  return (
    <div className="admin-auth-page">

      <div className="admin-auth-card">

        <div className="admin-header-box">
          <div className="admin-badge-icon">
            <FaUserPlus />
          </div>
          <h2>Admin Setup</h2>
          <p>Initialize your canteen terminal</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="admin-form-group">
            <label><FaUser style={{ marginRight: "8px" }} /> Full Name</label>
            <input className="admin-input-premium" type="text" name="name"
              value={adminData.name} onChange={handleChange} required />
          </div>

          <div className="admin-form-group">
            <label><FaEnvelope style={{ marginRight: "8px" }} /> Email</label>
            <input className="admin-input-premium" type="email" name="email"
              value={adminData.email} onChange={handleChange} required />
          </div>

          <div className="admin-form-group">
            <label><FaPhone style={{ marginRight: "8px" }} /> Phone</label>
            <input className="admin-input-premium" type="text" name="phone"
              value={adminData.phone} onChange={handleChange} required />
          </div>

          <div className="admin-form-group">
            <label><FaUser style={{ marginRight: "8px" }} /> Canteen Name</label>
            <input className="admin-input-premium" type="text" name="canteen"
              value={adminData.canteen} onChange={handleChange} required />
          </div>

          <div className="admin-form-group">
            <label><FaUser style={{ marginRight: "8px" }} /> Username</label>
            <input className="admin-input-premium" type="text" name="username"
              value={adminData.username} onChange={handleChange} required />
          </div>

          <div className="admin-form-group">
            <label><FaLock style={{ marginRight: "8px" }} /> Password</label>
            <input className="admin-input-premium" type="password" name="password"
              value={adminData.password} onChange={handleChange} required />
          </div>

          <button className="admin-submit-btn" type="submit">
            Deploy Admin Console
          </button>

        </form>

        <div className="admin-footer-links">
          <p>
            Already registered?{" "}
            <span onClick={() => navigate("/AdminLogin")}>Return to Login</span>
          </p>
        </div>

      </div>

    </div>
  );
}

export default AdminSignup;