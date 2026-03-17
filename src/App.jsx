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

  /* ✅ SINGLE CLEAN STATE */
  const [admin, setAdmin] = useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  /* ✅ NAV CONTROL */
  const showAdminNav =
    admin &&
    location.pathname !== "/AdminLogin" &&
    location.pathname !== "/AdminSignup";

  return (
    <>
      {showAdminNav && <AdminNav setAdmin={setAdmin} />}

      <Routes>

        {/* DEFAULT */}
        <Route
          path="/"
          element={
            admin
              ? <Navigate to="/admin-panel" replace />
              : <Navigate to="/AdminLogin" replace />
          }
        />

        {/* LOGIN */}
        <Route
          path="/AdminLogin"
          element={
            admin
              ? <Navigate to="/admin-panel" replace />
              : <AdminLogin setAdmin={setAdmin} />
          }
        />

        {/* SIGNUP */}
        <Route
          path="/AdminSignup"
          element={
            admin
              ? <Navigate to="/admin-panel" replace />
              : <AdminSignup setAdmin={setAdmin} />
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin-panel"
          element={
            <ProtectedAdmin admin={admin}>
              <AdminPanel />
            </ProtectedAdmin>
          }
        />

        <Route
          path="/admin-inventory"
          element={
            <ProtectedAdmin admin={admin}>
              <ProductManager />
            </ProtectedAdmin>
          }
        />

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

        <Route
          path="/sales"
          element={
            <ProtectedAdmin admin={admin}>
              <SalesReport />
            </ProtectedAdmin>
          }
        />

        {/* ✅ CLEAN FALLBACK */}
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

/* ================= WRAPPER ================= */

export default function AppWrapper() {
  return (
    <Router>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Router>
  );
}
