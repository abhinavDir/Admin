import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaQrcode, FaCreditCard, FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaTimes } from "react-icons/fa";
import "./PaymentSettings.css";
import { useToast } from "../../context/ToastContext";

const PaymentSettings = () => {
  const { showToast } = useToast();
  const [upiId, setUpiId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const adminHotelId = localStorage.getItem("adminHotelId") || "DEFAULT_ADMIN";

  useEffect(() => {
    fetchPaymentSettings();
  }, [adminHotelId]);

  const fetchPaymentSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "payment_settings", adminHotelId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUpiId(data.upiId || "");
        setQrUrl(data.qrUrl || "");
        setPreview(data.qrUrl || "");
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // 🛡️ Basic Validation: At least one payment method should exist
    if (!upiId.trim() && !imageFile && !qrUrl) {
      showToast("Please provide at least a UPI ID or a QR Code", "warning");
      return;
    }

    setSaving(true);
    try {
      let finalQrUrl = qrUrl;

      // Only upload if a NEW file was selected
      if (imageFile) {
        const qrRef = ref(storage, `payment_qrs/${adminHotelId}/qr_code`);
        await uploadBytes(qrRef, imageFile);
        finalQrUrl = await getDownloadURL(qrRef);
      }

      const payload = {
        upiId: upiId.trim(),
        qrUrl: finalQrUrl,
        adminHotelId,
        updatedAt: new Date()
      };

      await setDoc(doc(db, "payment_settings", adminHotelId), payload);

      setQrUrl(finalQrUrl);
      setPreview(finalQrUrl); // ✅ Ensure preview matches the saved URL
      setImageFile(null); 
      showToast("Financial Parameters Synchronized", "success");
    } catch (error) {
      console.error("Error saving payment settings:", error);
      showToast("Synchronization Error", "error");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="payment-settings-terminal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FaSpinner className="upload-icon-pulse" />
      </div>
    );
  }

  return (
    <div className="payment-settings-terminal">
      <div className="payment-header">
        <h2>Financial Nexus</h2>
        <p>Configure your terminal's payment acceptance protocols</p>
      </div>

      <div className="settings-grid">
        <div className="settings-card-premium">
          <h3><FaQrcode style={{ color: '#6366f1' }} /> QR Protocol</h3>
          <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.9rem' }}>
            Upload your official UPI QR code for customer scan-to-pay verification.
          </p>

          <label className="qr-upload-zone">
            {preview ? (
              <img 
                src={preview} 
                alt="QR Preview" 
                className="qr-preview" 
                onError={(e) => {
                  console.error("Image Load Failed:", e);
                  // Only alert if there is actually a URL attempt
                  if (preview && preview.startsWith('http')) {
                    showToast("CORS Block: Firebase Storage permissions required.", "error");
                  }
                }}
              />
            ) : (
              <>
                <FaCloudUploadAlt className="upload-icon-pulse" />
                <span style={{ fontWeight: 800 }}>Deploy QR Asset</span>
                <span style={{ color: '#6366f1', fontSize: '0.8rem', marginTop: '10px' }}>JPG/PNG FORMATS ONLY</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
        </div>

        <div className="settings-card-premium">
          <h3><FaCreditCard style={{ color: '#a855f7' }} /> Digital gateway</h3>
          <form onSubmit={handleSave} className="input-terminal-group">
            <div style={{ marginBottom: '20px' }}>
              <label>UPI ID (OPTIONAL)</label>
              <input
                placeholder="e.g. merchant@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>QR IMAGE URL (OPTIONAL)</label>
              <input
                placeholder="https://example.com/qr.png"
                value={qrUrl}
                onChange={(e) => {
                  setQrUrl(e.target.value);
                  if (!imageFile) setPreview(e.target.value);
                }}
              />
              <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '10px' }}>
                Paste a direct link to your QR image, or upload a file on the left.
              </p>
            </div>

            <button type="submit" className="save-payment-btn" disabled={saving}>
              {saving ? <FaSpinner className="fa-spin" /> : <><FaCheckCircle /> Synchronize Settings</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
