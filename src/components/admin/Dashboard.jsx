import React, { useEffect, useState } from "react";
import "./admin.css";
import { db } from "../../firebase";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where
} from "firebase/firestore";

import {
  FaChartBar,
  FaClipboardList,
  FaCheck,
  FaTimes,
  FaTruck,
  FaEye
} from "react-icons/fa";

const AdminPanel = () => {

  const [orders,setOrders] = useState([]);
  const [expanded,setExpanded] = useState({});

  const adminName = localStorage.getItem("adminUser") || "Admin";
  const adminId = localStorage.getItem("adminHotelId") || "DEFAULT_ADMIN";



  /* ================= LOAD ORDERS ================= */

  useEffect(()=>{

    const q = query(
      collection(db,"orders"),
      where("adminId","==",adminId)
    );

    const unsub = onSnapshot(q,(snap)=>{

      const data = snap.docs.map(docItem=>{

        const d = docItem.data();

        return{
          id:docItem.id,
          ...d,
          items:Array.isArray(d.items)?d.items:[],
          userName:d.userName || "Customer",
          status:d.status || "Pending",
          total:d.total || 0,
          mobile:d.mobile || "-"
        };

      });

      setOrders(data);

    });

    return ()=>unsub();

  },[adminId]);



  /* ================= EXPAND ITEMS ================= */

  const toggleExpand = (id)=>{

    setExpanded(prev=>({
      ...prev,
      [id]:!prev[id]
    }));

  };


  /* ================= UPDATE STATUS ================= */

  const updateOrderStatus = async(id,status)=>{

    await updateDoc(doc(db,"orders",id),{
      status,
      assignedTo:adminName
    });

  };


  /* ================= STATUS BADGE ================= */

  const getStatusClass = (status)=>{

    switch(status){

      case "Pending":
      case "Order Received":
        return "badge received";

      case "Preparing":
        return "badge preparing";

      case "Out for Delivery":
        return "badge delivery";

      case "Delivered":
        return "badge delivered";

      case "Rejected":
        return "badge rejected";

      default:
        return "badge";
    }

  };


  return(

  <div className="admin-panel">

  <h2 className="page-title">Incoming Orders</h2>


  <div className="orders-container">

  {orders.map(o => (

  <div key={o.id} className="order-card">


  {/* HEADER */}

  <div className="order-header">

  <div>

  <h3>{o.userName}</h3>

  <small>ID: {o.id.slice(0,8)}</small>

  </div>

  <span className={getStatusClass(o.status)}>
  {o.status}
  </span>

  </div>



  {/* ORDER DETAILS */}

  <div className="order-info">

  <p><b>Total:</b> ₹{o.total}</p>

  <p><b>Phone:</b> {o.mobile}</p>

  </div>



  {/* ITEMS BUTTON */}

  <button
  className="btn secondary"
  onClick={()=>toggleExpand(o.id)}
  >

  <FaEye/> {o.items.length} Items

  </button>



  {/* ITEMS LIST */}

  {expanded[o.id] && (

  <div className="items-box">

  {o.items.map((i,idx)=>{

  const price = Number(i.discountedPrice ?? i.price ?? 0);
  const qty = Number(i.qty ?? 1);

  return(

  <div
  key={idx}
  className="item-row"
  >

  <span>{i.name} × {qty}</span>

  <span>₹{price * qty}</span>

  </div>

  )

  })}

  </div>

  )}



  {/* ACTIONS */}

  <div className="actions">


  {(o.status==="Pending" || o.status==="Order Received") && (

  <>
  <button
  className="btn"
  onClick={()=>updateOrderStatus(o.id,"Preparing")}
  >
  <FaCheck/> Accept
  </button>

  <button
  className="btn danger"
  onClick={()=>updateOrderStatus(o.id,"Rejected")}
  >
  <FaTimes/> Reject
  </button>
  </>

  )}


  {o.status==="Preparing" && (

  <button
  className="btn"
  onClick={()=>updateOrderStatus(o.id,"Out for Delivery")}
  >
  <FaTruck/> Dispatch
  </button>

  )}


  {o.status==="Out for Delivery" && (

  <button
  className="btn"
  onClick={()=>updateOrderStatus(o.id,"Delivered")}
  >
  Complete
  </button>

  )}

  </div>


  </div>

  ))}

  </div>

  </div>

  );

};

export default AdminPanel;