// src/App.jsx

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";

import "./App.css";

/* ADMIN COMPONENTS */

import AdminLogin from "./components/login/AdminLogin";
import AdminSignup from "./components/login/AdminSignup";

import AdminPanel from "./components/admin/AdminPanel";
import ProductManager from "./components/admin/ProductManger";
import AdminNav from "./components/admin/AdminNav";
import PaymentSettings from "./components/admin/PaymentSettings";
import SalesReport from "./components/admin/SalesReport";

import OrderHistory from "./components/admin/OrderHistory";

/* ================= ADMIN PROTECTION ================= */

const ProtectedAdmin = ({ admin, children }) => {
  if (!admin) return <Navigate to="/AdminLogin" replace />;
  return children;
};

function App() {

  const location = useLocation();

  /* ADMIN STATE */

  const [admin, setAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );

  /* SHOW ADMIN NAV */

  const showAdminNav =
    location.pathname !== "/AdminLogin" &&
    location.pathname !== "/AdminSignup";

  return (
    <>

      {showAdminNav && admin && (
        <AdminNav setAdmin={setAdmin} />
      )}

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<Navigate to="/AdminLogin" />}
        />

        <Route
          path="/AdminLogin"
          element={<AdminLogin setAdmin={setAdmin} />}
        />

        <Route
          path="/AdminSignup"
          element={<AdminSignup setAdmin={setAdmin} />}
        />

        {/* ADMIN DASHBOARD */}

        <Route
          path="/admin-panel"
          element={
            <ProtectedAdmin admin={admin}>
              <AdminPanel />
            </ProtectedAdmin>
          }
        />

        {/* INVENTORY */}

        <Route
          path="/admin-inventory"
          element={
            <ProtectedAdmin admin={admin}>
              <ProductManager />
            </ProtectedAdmin>
          }
        />

        {/* PAYMENT */}

        <Route
          path="/admin-payment"
          element={
            <ProtectedAdmin admin={admin}>
              <PaymentSettings />
            </ProtectedAdmin>
          }
        />

        <Route
          path="/admin-history"
          element={
            <ProtectedAdmin admin={admin}>
              <OrderHistory />
            </ProtectedAdmin>
          }
        />

        {/* SALES */}

        <Route
          path="/sales"
          element={
            <ProtectedAdmin admin={admin}>
              <SalesReport />
            </ProtectedAdmin>
          }
        />

        {/* FALLBACK */}
   <Route
          path="*"
          element={
            admin
              ? <Navigate to="/admin-panel" replace />
              : <Navigate to="/AdminLogin" replace />
          }
        />

      </Routes>

    </>
  );
}

/* ================= ROUTER WRAPPER ================= */

export default function AppWrapper() {
  return (
    <Router>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Router>
  );
}
