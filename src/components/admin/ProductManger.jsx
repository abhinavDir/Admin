import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "../../firebase";

import {
  FaEdit,
  FaTrash,
  FaPowerOff,
  FaCloudUploadAlt,
  FaBoxes,
  FaTags,
  FaRupeeSign,
  FaCircle,
  FaPercent,
} from "react-icons/fa";

import { useToast } from "../../context/ToastContext";

function ProductManager() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    originalPrice: "",
    quantity: "",
    category: "",
    imageUrl: "",
    discount: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* 🔑 ADMIN INFO */

  const adminId =
    localStorage.getItem("adminHotelId") || "DEFAULT_ADMIN";

  const adminName =
    localStorage.getItem("adminName") ||
    localStorage.getItem("adminUsername") ||
    localStorage.getItem("adminEmail")?.split("@")[0] ||
    "Canteen Admin";

  /* 🔄 LOAD PRODUCTS */

  useEffect(() => {

    const q = query(
      collection(db, "products"),
      where("adminId", "==", adminId)
    );

    const unsub = onSnapshot(q, (snap) => {

      setProducts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

    });

    return () => unsub();

  }, [adminId]);

  /* 📸 IMAGE HANDLER */

  const handleImageFile = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ➕ ADD / UPDATE PRODUCT */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.name || !form.originalPrice || !form.category || !form.quantity) {
      showToast("Required fields are missing", "warning");
      return;
    }

    setLoading(true);

    try {

      let finalImage = form.imageUrl.trim();

      if (imageFile) {

        const imageRef = ref(
          storage,
          `products/${adminId}/${Date.now()}_${imageFile.name}`
        );

        await uploadBytes(imageRef, imageFile);

        finalImage = await getDownloadURL(imageRef);
      }

      const originalPrice = Number(form.originalPrice);

      const discountPct = Number(form.discount) || 0;

      const discountedPrice =
        discountPct > 0
          ? Math.round(originalPrice * (1 - discountPct / 100))
          : originalPrice;

      const payload = {

        name: form.name.trim(),
        title: form.name.trim(),

        price: originalPrice,
        originalPrice: originalPrice,

        discountPct: discountPct,
        discountedPrice: discountedPrice,

        quantity: Number(form.quantity),

        category: form.category.toLowerCase().trim(),

        image: finalImage || "",
        imageUrl: finalImage || "",

        adminId,
        hotelId: adminId,
        adminName: adminName,

        isActive: true,
      };

      if (!editId) {

        payload.createdAt = serverTimestamp();

        await addDoc(collection(db, "products"), payload);

      } else {

        await updateDoc(doc(db, "products", editId), payload);

        setEditId(null);
      }

      setForm({
        name: "",
        originalPrice: "",
        quantity: "",
        category: "",
        imageUrl: "",
        discount: "",
      });

      setImageFile(null);
      setPreview("");

      showToast("Inventory Synchronized Successfully", "success");

    } catch (err) {
      console.error(err);
      showToast("Update Failed: " + err.message, "error");

    } finally {
      setLoading(false);
    }
  };

  /* 🗑 DELETE */

  const handleDelete = async (id) => {

    if (window.confirm("Delete this product permanently?")) {

      await deleteDoc(doc(db, "products", id));

    }
  };

  /* 🔒 ENABLE / DISABLE */

  const toggleActive = async (product) => {

    await updateDoc(doc(db, "products", product.id), {
      isActive: !product.isActive,
    });

  };

  /* ✏️ EDIT */

  const handleEdit = (p) => {

    setForm({
      name: p.name,
      originalPrice: p.originalPrice || p.price,
      quantity: p.quantity || "",
      category: p.category,
      imageUrl: p.image || "",
      discount: p.discountPct || "",
    });

    setPreview(p.image || "");

    setEditId(p.id);

    setImageFile(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (

    <div className="product-manager-premium">
      <div className="pm-header">
        <div>
          <span className="pm-header-subtitle">Inventory Control Center</span>
          <h2 className="premium-gradient-text">Canteen Inventory</h2>
        </div>
      </div>

      <div className="pm-form-container">
        <form onSubmit={handleSubmit} className="pm-form">
          <div className="form-group">
            <label><FaBoxes /> Product Name</label>
            <input
              placeholder="e.g. Cheese Pizza"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><FaRupeeSign /> Market Price (MRP)</label>
            <input
              type="number"
              placeholder="Enter MRP"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><FaPercent /> Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 10"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><FaCircle style={{ fontSize: "0.6rem" }} /> Stock Level</label>
            <input
              type="number"
              placeholder="Units in stock"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label><FaTags /> Category Selection</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select Category</option>
              <option value="drinks">Refreshing Drinks</option>
              <option value="fastfood">Snacks & Fastfood</option>
              <option value="meals">Full Course Meals</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label><FaCloudUploadAlt /> Remote Image URL</label>
            <input
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>

          <div className="file-input-wrapper">
            <label className="custom-file-upload">
              <FaCloudUploadAlt style={{ fontSize: '1.5rem' }} />
              {imageFile ? imageFile.name : "Local Asset Upload"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {preview && (
            <div className="pm-preview-container">
              <img src={preview} alt="preview" className="pm-preview-image" />
            </div>
          )}

          <button type="submit" className="pm-submit-btn" disabled={loading}>
            {loading ? "Synchronizing..." : editId ? "Update Parameters" : "Deploy Product"}
          </button>
        </form>
      </div>

      <div className="pm-grid">
        {products.map((p) => (
          <div key={p.id} className={`pm-card ${!p.isActive ? "disabled" : ""}`}>
            <div className="pm-card-img-wrapper">
              <img
                src={p.image || "https://placehold.co/400x400/1e293b/white?text=No+Image"}
                alt={p.name}
                className="pm-card-img"
              />
              <div className="pm-tag">{p.category}</div>
            </div>

            <div className="pm-card-info">
              <h4>{p.name}</h4>

              <div className="pm-price-wrap">
                {p.discountPct > 0 ? (
                  <>
                    <span className="pm-price">₹{p.discountedPrice}</span>
                    <span className="pm-original-price">₹{p.originalPrice || p.price}</span>
                    <span className="pm-discount-badge">{p.discountPct}% OFF</span>
                  </>
                ) : (
                  <span className="pm-price">₹{p.originalPrice || p.price}</span>
                )}
                <span className="pm-qty">STOCK: {p.quantity}</span>
              </div>

              <div className="pm-actions">
                <button className="pm-btn pm-btn-edit" onClick={() => handleEdit(p)}>
                  <FaEdit /> Edit
                </button>

                <button
                  className={`pm-btn pm-btn-toggle ${p.isActive ? "active" : ""}`}
                  onClick={() => toggleActive(p)}
                  title={p.isActive ? "Deactivate" : "Activate"}
                >
                  <FaPowerOff />
                </button>

                <button
                  className="pm-btn pm-btn-delete"
                  onClick={() => handleDelete(p.id)}
                  title="Delete Product"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductManager;