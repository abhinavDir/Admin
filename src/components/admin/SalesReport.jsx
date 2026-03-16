import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import "./SalesReport.css";
import {
  FaChartLine,
  FaBoxOpen,
  FaCalendarDay,
  FaChartBar,
  FaArrowUp
} from "react-icons/fa";

const SalesReport = () => {

  const [orders, setOrders] = useState([]);

  const adminId = localStorage.getItem("adminHotelId") || "DEFAULT_ADMIN";

  const adminName = (() => {
    try {
      const raw = localStorage.getItem("adminUser");
      if (!raw) return "Manager";
      const parsed = JSON.parse(raw);
      return parsed.username || "Manager";
    } catch {
      return "Manager";
    }
  })();

  /* ================= LOAD ORDERS ================= */

  useEffect(() => {

    const q = query(
      collection(db, "orders"),
      where("adminId", "==", adminId)
    );

    const unsub = onSnapshot(q, (snapshot) => {

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(data);

    });

    return () => unsub();

  }, [adminId]);

  /* ================= DATE NORMALIZER ================= */

  const normalizeDate = (value) => {

    if (!value) return null;

    if (typeof value.toDate === "function") return value.toDate();

    if (value instanceof Date) return value;

    if (typeof value === "number") return new Date(value);

    if (typeof value === "string") return new Date(value);

    return null;

  };

  /* ================= DATE FILTER ================= */

  const getStartDate = (type) => {

    const now = new Date();
    const start = new Date();

    if (type === "today") start.setHours(0, 0, 0, 0);
    if (type === "week") start.setDate(now.getDate() - 7);
    if (type === "month") start.setMonth(now.getMonth() - 1);

    return start;

  };

  /* ================= SALES CALCULATION ================= */

  const calculateSales = (type) => {

    const startDate = getStartDate(type);

    let revenue = 0;
    let qty = 0;

    orders.forEach((o) => {

      if (o.status !== "Delivered") return;

      const deliveredAt = normalizeDate(o.createdAt);
      if (!deliveredAt || deliveredAt < startDate) return;

      o.items?.forEach((i) => {

        const price = Number(i.discountedPrice ?? i.price) || 0;
        const q = Number(i.qty) || 0;

        revenue += price * q;
        qty += q;

      });

    });

    return { revenue, qty };

  };

  /* ================= WEEKLY REVENUE ================= */

  const getWeeklyRevenue = () => {

    const map = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {

      const d = new Date();
      d.setDate(now.getDate() - i);

      const key = d.toLocaleDateString("en-US", {
        weekday: "short"
      });

      map[key] = 0;

    }

    orders.forEach((o) => {

      if (o.status !== "Delivered") return;

      const date = normalizeDate(o.createdAt);
      if (!date) return;

      const key = date.toLocaleDateString("en-US", {
        weekday: "short"
      });

      if (!(key in map)) return;

      o.items?.forEach((i) => {

        const price = Number(i.discountedPrice ?? i.price) || 0;
        const q = Number(i.qty) || 0;

        map[key] += price * q;

      });

    });

    return Object.entries(map).map(([day, revenue]) => ({
      day,
      revenue
    }));

  };

  /* ================= TOP PRODUCTS ================= */

  const getTopProducts = () => {

    const startDate = getStartDate("week");
    const map = {};

    orders.forEach((o) => {

      if (o.status !== "Delivered") return;

      const date = normalizeDate(o.createdAt);
      if (!date || date < startDate) return;

      o.items?.forEach((i) => {

        const q = Number(i.qty) || 0;

        if (!i.name || isNaN(q)) return;

        map[i.name] = (map[i.name] || 0) + q;

      });

    });

    return Object.entries(map)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

  };

  /* ================= STATS ================= */

  const today = calculateSales("today");
  const week = calculateSales("week");
  const month = calculateSales("month");

  const CustomChartStyles = {
    textColor: "#94a3b8",
    gridColor: "rgba(255,255,255,0.05)",
    gradientStart: "#6366f1",
    gradientEnd: "#a855f7"
  };

  return (

    <div className="sales-analytics-page">

      <div className="sales-header">
        <h2>Revenue Terminal</h2>
        <p>
          Operational overview for <strong>{adminName}</strong>
        </p>
      </div>

      {/* ================= STATS ================= */}

      <div className="summary-stats-grid">

        <div className="summary-stat-premium">
          <h4><FaCalendarDay /> 24H Volume</h4>
          <span className="revenue">₹{today.revenue}</span>
          <span className="qty-label">{today.qty} Units Dispatched</span>
        </div>

        <div
          className="summary-stat-premium"
          style={{ borderLeftColor: "#a855f7" }}
        >
          <h4><FaChartLine /> Weekly Performance</h4>
          <span className="revenue">₹{week.revenue}</span>
          <span className="qty-label">{week.qty} Total Units</span>
        </div>

        <div
          className="summary-stat-premium"
          style={{ borderLeftColor: "#22c55e" }}
        >
          <h4><FaChartBar /> Monthly Forecast</h4>
          <span className="revenue">₹{month.revenue}</span>
          <span className="qty-label">
            <FaArrowUp /> Trending stable
          </span>
        </div>

      </div>

      {/* ================= REVENUE GRAPH ================= */}

      <div className="chart-container-premium">

        <h3><FaChartLine /> Network Revenue Trend</h3>

        <ResponsiveContainer width="100%" height={350}>

          <AreaChart data={getWeeklyRevenue()}>

            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CustomChartStyles.gradientStart} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={CustomChartStyles.gradientEnd} stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke={CustomChartStyles.gridColor}/>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: CustomChartStyles.textColor }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: CustomChartStyles.textColor }}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CustomChartStyles.gradientStart}
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      {/* ================= TOP PRODUCTS ================= */}

      <div className="chart-container-premium">

        <h3><FaBoxOpen /> Highly Demanded Items</h3>

        <ResponsiveContainer width="100%" height={350}>

          <BarChart data={getTopProducts()}>

            <CartesianGrid vertical={false} stroke={CustomChartStyles.gridColor}/>

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: CustomChartStyles.textColor }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: CustomChartStyles.textColor }}
            />

            <Tooltip />

            <Bar
              dataKey="qty"
              fill={CustomChartStyles.gradientStart}
              radius={[10,10,0,0]}
              barSize={40}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

};

export default SalesReport;