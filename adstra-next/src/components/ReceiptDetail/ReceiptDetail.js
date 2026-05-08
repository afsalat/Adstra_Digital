"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import API_BASE_URL from "@/utils/apiBase";
import ReceiptTemplate from "./ReceiptTemplate";

export default function ReceiptDetail({ id }) {
  const [receipt, setReceipt] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const captureRef = useRef();

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE_URL}/transactions/details/${id}/`)
      .then((res) => setReceipt(res.data))
      .catch(() => setError("Failed to load receipt."));

    // Fetch company settings with cache-busting
    axios.get(`${API_BASE_URL}/settings/?_=${Date.now()}`)
      .then((res) => setSettings(res.data))
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Settings Fetch Error:", err);
        }
      });
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const input = captureRef.current;
    if (!input) return;
    await new Promise((r) => setTimeout(r, 50));
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    pdf.save(`receipt_${receipt?.id || id}.pdf`);
  };

  if (error) return <p style={{ color: "red", textAlign: "center", padding: "2rem" }}>{error}</p>;
  if (!receipt) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem", gap: "0.75rem", color: "#6B7280" }}>
        <div style={{ width: 20, height: 20, border: "2px solid #D1D5DB", borderTopColor: "#2B6CB0", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        Loading receipt…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const invoice = receipt.invoice || {};

  return (
    <>
      {/* ── Action Bar ── */}
      <div
        className="no-print"
        style={{ display: "flex", justifyContent: "center", gap: 12, padding: "16px 0 0" }}
      >
        {[
          { label: "← Back", bg: "#6B7280", hover: "#4B5563", action: () => window.history.back() },
          { label: "🖨 Print", bg: "#2B6CB0", hover: "#1A4A80", action: handlePrint },
          { label: "⬇ Download PDF", bg: "#059669", hover: "#047857", action: handleDownloadPDF },
        ].map(({ label, bg, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              backgroundColor: bg,
              color: "#fff",
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Receipt Document ── */}
      <div ref={captureRef} style={{ margin: "24px auto", maxWidth: 848 }}>
        <ReceiptTemplate
          clientName={receipt.client_name}
          clientAddress={receipt.client?.address}
          clientEmail={receipt.client?.email}
          clientPhone={receipt.client?.phone}
          invoiceNo={invoice.invoice_no || receipt.invoice_no}
          date={receipt.date}
          purpose={receipt.purpose}
          amount={receipt.amount}
          paymentMode={receipt.payment_mode}
          referenceNo={receipt.reference_no}
          notes={receipt.notes}
          invoiceTotal={invoice.total_amount || 0}
          discountAmount={invoice.discount_amount || 0}
          taxAmount={invoice.tax_amount || 0}
          additionalFee={invoice.additional_fee || 0}
          balanceDue={receipt.balance_amount}
          isPreview={false}
          companySettings={settings}
        />
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </>
  );
}
