import React, { useEffect, useState } from "react";

function Order() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    const savedOrders =
      JSON.parse(localStorage.getItem("orders")) || [];

    setOrders(savedOrders);

  }, []);

  /* ================= UPDATE STATUS ================= */

  const updateStatus = (id, status) => {

    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status } : order
    );

    setOrders(updatedOrders);

    localStorage.setItem(
      "orders",
      JSON.stringify(updatedOrders)
    );

  };

  return (

    <div style={{ padding: "20px" }}>

      <h1>📦 Orders</h1>

      {orders.length === 0 ? (

        <p>No orders yet</p>

      ) : (

        <ul style={{ listStyle: "none", padding: 0 }}>

          {orders.map((order) => (

            <li
              key={order.id}
              style={{
                border: "1px solid #ddd",
                marginBottom: "15px",
                padding: "15px",
                borderRadius: "10px",
                background: "#fff"
              }}
            >

              <strong>Order #{order.id}</strong>

              <p>
                Status: <b>{order.status}</b>
              </p>

              {/* ================= ITEMS ================= */}

              <div style={{ marginTop: "10px" }}>

                {order.items.map((item, index) => {

                  const price = Number(
                    item.discountedPrice ?? item.price ?? 0
                  );

                  const qty = Number(item.qty ?? 1);

                  const total = price * qty;

                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        padding: "6px 0"
                      }}
                    >

                      <span>
                        {item.name} × {qty}
                      </span>

                      <span style={{ fontWeight: 600 }}>
                        ₹{price} → ₹{total}
                      </span>

                    </div>
                  );

                })}

              </div>

              <p style={{ marginTop: "10px" }}>
                <strong>Total: ₹{order.total}</strong>
              </p>

              {/* ================= ACTION BUTTONS ================= */}

              {order.status === "Pending" && (
                <button
                  onClick={() =>
                    updateStatus(order.id, "Accepted")
                  }
                  style={{
                    background: "green",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    marginRight: "10px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Accept Order
                </button>
              )}

              {order.status === "Accepted" && (
                <button
                  onClick={() =>
                    updateStatus(order.id, "Delivered")
                  }
                  style={{
                    background: "orange",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Mark Delivered
                </button>
              )}

            </li>

          ))}

        </ul>

      )}

    </div>

  );

}

export default Order;