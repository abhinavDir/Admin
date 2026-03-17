import { useState, useEffect, useRef } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  updateDoc, 
  doc, 
  setDoc,
  serverTimestamp 
} from "firebase/firestore";
import { getToken, onMessage } from "firebase/messaging";
import { db, messaging } from "../firebase";
import { useToast } from "../context/ToastContext";

export const useNotifications = (adminId) => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastNotifiedIdRef = useRef(null);
  // Using a professional external sound URL so it works immediately
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));

  useEffect(() => {
    // Pre-load audio
    audioRef.current.load();
    
    if (!adminId) return;

    // 1. Real-time Firestore Listener (Notifications Collection)
    const q = collection(db, "notifications");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter and Sort in JS (No Index Required)
      const docs = allDocs
        .filter(n => n.role === "admin" || !n.role) // Relaxed filter
        .sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (typeof a.timestamp === 'number' ? a.timestamp : 0);
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (typeof b.timestamp === 'number' ? b.timestamp : 0);
          return timeB - timeA;
        });

      setNotifications(docs);
      const unread = docs.filter(n => !n.read).length;
      setUnreadCount(unread);

      // Handle sound/toast triggers for NEW notifications
      if (docs.length > 0) {
        const latest = docs[0]; 
        
        if (lastNotifiedIdRef.current === null) {
          lastNotifiedIdRef.current = latest.id;
          return;
        }

        if (latest.id !== lastNotifiedIdRef.current) {
          lastNotifiedIdRef.current = latest.id;
          if (!latest.read) {
            showToast(latest.message || latest.title || "New order alert!", "success");
            triggerAlert();
          }
        }
      }
    }, (error) => {
      console.error("🔥 Notification Listener Error:", error);
    });

    // 2. Order Sync (Automated creation of notifications from orders)
    // This allows the system to work even without a backend trigger
    const syncOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const orderData = change.doc.data();
          const orderId = change.doc.id;
          
          // Only create notification if it's a fresh order (within last hour)
          const orderTime = orderData.createdAt?.toMillis ? orderData.createdAt.toMillis() : (orderData.createdAt || Date.now());
          const isRecent = Date.now() - orderTime < 3600000;

          if (isRecent && (orderData.adminId === adminId || !orderData.adminId)) {
            const notifId = `notif_${orderId}`;
            
            // Generate notification doc
            try {
              await setDoc(doc(db, "notifications", notifId), {
                title: "New Incoming Order",
                message: `Order #${orderId.slice(-5)} from ${orderData.userName || "Customer"} - ₹${orderData.total || 0}`,
                orderId: orderId,
                type: "order",
                role: "admin",
                read: false,
                timestamp: serverTimestamp()
              }, { merge: true });
            } catch (err) {
              console.error("Error syncing order to notification:", err);
            }
          }
        }
      });
    });

    // 3. Setup Push Notifications (FCM)
    setupFCM(adminId);

    // 4. Foreground Message Listener
    const unsubscribeMessage = onMessage(messaging, (payload) => {
      console.log("Push received:", payload);
    });

    // 5. Test Trigger Listener
    const handleTest = () => {
      showToast("Test Notification: Active!", "success");
      triggerAlert();
    };
    window.addEventListener("test-notification-trigger", handleTest);

    return () => {
      unsubscribe();
      syncOrders();
      unsubscribeMessage();
      window.removeEventListener("test-notification-trigger", handleTest);
    };
  }, [adminId]);

  const setupFCM = async (uid) => {
    // ... preserved ...
  };

  const triggerAlert = () => {
    // Play Sound
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.warn("Audio play blocked. Waiting for interaction.");
            if (!window.hasShownAudioWarning) {
              showToast("New order! (Tap anywhere to enable sound)", "info");
              window.hasShownAudioWarning = true;
            }
          });
        }
      }
    } catch (e) {
      console.error("Sound trigger error:", e);
    }

    // Vibrate
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const promises = unreadNotifications.map(n => 
        updateDoc(doc(db, "notifications", n.id), { read: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
