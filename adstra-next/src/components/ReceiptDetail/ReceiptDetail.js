"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function MoneyReceipt({ id }) {
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const printRef = useRef();
  const captureRef = useRef();

  useEffect(() => {
    if (!id) return;
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/transactions/details/${id}/`
      )
      .then((res) => {
        setReceipt(res.data);
      })
      .catch(() => setError("Failed to load receipt."));
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const input = captureRef.current;
    if (!input) return;

    // Wait a microtask to ensure layout is fully settled
    await new Promise((r) => setTimeout(r, 0));

    const canvas = await html2canvas(input, {
      scale: 2, // crisp output
      useCORS: true, // avoid tainted canvas for same-origin assets
      backgroundColor: "#fff",
      logging: false,
      // You can also ignore any element with class "no-pdf"
      ignoreElements: (el) => el.classList?.contains("no-pdf"),
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add first page
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add extra pages as needed
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const filename = `money_receipt_${receipt?.invoice?.invoice_no || receipt?.invoice_no || receipt?.id
      }.pdf`;
    pdf.save(filename);
  };

  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!receipt) return <p style={{ textAlign: "center" }}>Loading...</p>;

  const totalAmount = parseFloat(receipt.invoice?.total_amount || 0);
  const amountReceived = parseFloat(receipt.amount || 0);
  const balanceAmount = (totalAmount - amountReceived).toFixed(2);
  const amountInWords = receipt.invoice?.total_in_words || "N/A";

  return (
    <>
      {/* Actions */}
      <div style={{ textAlign: "center" }} className="no-print">
        <button
          onClick={handlePrint}
          style={{
            backgroundColor: "#16a085",
            color: "#fff",
            padding: "12px 30px",
            fontWeight: "600",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginRight: 20,
            fontSize: 16,
            boxShadow: "0 4px 8px rgba(22,160,133,0.4)",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#138d75")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#16a085")
          }
        >
          Print
        </button>
        <button
          onClick={handleDownloadPDF}
          style={{
            backgroundColor: "#27ae60",
            color: "#fff",
            padding: "12px 30px",
            fontWeight: "600",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
            boxShadow: "0 4px 8px rgba(39,174,96,0.4)",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e8449")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#27ae60")
          }
        >
          Download PDF
        </button>
      </div>
      <div
        ref={captureRef}
        style={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 40,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          backgroundColor: "#fdfdfd",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          color: "#2c3e50",
          userSelect: "none",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "3px solid #16a085",
            paddingBottom: 20,
            marginBottom: 30,
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#16a085", fontWeight: "700" }}>
              Adstra Digital
            </h1>
            <p
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#555",
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              The Sole of a Premium Digital Marketing Brand
            </p>
            <address
              style={{
                fontStyle: "normal",
                fontSize: 11,
                color: "#777",
                lineHeight: 1.4,
                marginTop: 6,
                maxWidth: 300,
              }}
            >
              Husna Complex 1st Floor, English Church, Nadakkavu, Kozhikode -
              673011
              <br />
              Email: info@adstradigital.com | Phone: +91 9744 77 9574
            </address>
          </div>

          <img
            src="/assets/logo_gellery.png"
            alt="Adstra Digital Logo"
            style={{ height: 90, borderRadius: 8, objectFit: "contain" }}
          />
        </header>

        {/* Title */}
        <h2
          style={{
            textAlign: "center",
            color: "#34495e",
            fontWeight: "700",
            fontSize: 28,
            marginBottom: 40,
            letterSpacing: 1.2,
          }}
        >
          Payment Receipt
        </h2>

        {/* Receipt Info */}
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 30,
            fontSize: 15,
            fontWeight: "600",
            color: "#34495e",
          }}
        >
          <div>
            <div style={{ marginBottom: 10 }}>
              Receipt No:{" "}
              <span style={{ fontWeight: "400" }}>{receipt.id}</span>
            </div>
            <div>
              Date: <span style={{ fontWeight: "400" }}>{receipt.date}</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ marginBottom: 10 }}>
              Client:{" "}
              <span style={{ fontWeight: "400" }}>
                {receipt.client_name || "N/A"}
              </span>
            </div>
            <div>
              Invoice No:{" "}
              <span style={{ fontWeight: "400" }}>
                {receipt.invoice_no || receipt.invoice?.invoice_no || "N/A"}
              </span>
            </div>
          </div>
        </section>

        {/* Amount Summary */}
        <section
          style={{
            display: "flex",
            justifyContent: "space-around",
            backgroundColor: "#ecf0f1",
            borderRadius: 10,
            padding: 20,
            marginBottom: 40,
            boxShadow: "inset 0 0 10px #bdc3c7",
            fontSize: 18,
            fontWeight: "600",
            color: "#2c3e50",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: "500",
                marginBottom: 6,
                color: "#7f8c8d",
              }}
            >
              Total Amount
            </div>
            ₹{totalAmount.toFixed(2)}
          </div>
          <div
            style={{
              textAlign: "center",
              backgroundColor: "#16a085",
              color: "#fff",
              padding: "10px 30px",
              borderRadius: 6,
              boxShadow: "0 4px 10px rgba(22,160,133,0.3)",
              fontWeight: "700",
              fontSize: 20,
              letterSpacing: 0.5,
              minWidth: 180,
            }}
          >
            Amount Received
            <div style={{ fontSize: 22, marginTop: 6 }}>
              ₹{amountReceived.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: "500",
                marginBottom: 6,
                color: "#7f8c8d",
              }}
            >
              Balance Amount
            </div>
            <div
              style={{
                color: balanceAmount > 0 ? "#c0392b" : "#27ae60",
                fontWeight: "700",
                fontSize: 20,
              }}
            >
              ₹{balanceAmount}
            </div>
          </div>
        </section>

        {/* Amount in words */}
        <section
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 30,
            color: "#34495e",
          }}
        >
          <strong>Amount (in words):</strong> {amountInWords}
        </section>

        {/* Payment Details */}
        <section
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 40,
            color: "#34495e",
            borderLeft: "5px solid #16a085",
            paddingLeft: 15,
          }}
        >
          <p>
            <strong>Payment Purpose:</strong> {receipt.purpose || "N/A"}
          </p>
          <p>
            <strong>Payment Mode:</strong> {receipt.payment_mode || "N/A"}
          </p>
          <p>
            <strong>Notes:</strong> {receipt.notes || "N/A"}
          </p>
        </section>
      </div>
      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
