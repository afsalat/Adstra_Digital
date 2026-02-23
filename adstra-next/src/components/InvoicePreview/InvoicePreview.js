"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Printer, FileDown, ArrowLeft, LayoutList } from "lucide-react";

export default function InvoicePreview() {
  const invoiceRef = useRef();
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceID")?.replace(/\/+$/, "");

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);

  const API_BASE =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://adstradigital.com/api";

  useEffect(() => {
    if (!invoiceId) return;
    axios.get(`${API_BASE}/invoice/view/${invoiceId}/?_=${Date.now()}`).then((res) => {
      setInvoice(res.data);
      console.log("DEBUG: Fetched invoice:", res.data);
      setItems(res.data.items);
    });
  }, [invoiceId, API_BASE]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0,
      filename: "invoice.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const goToCreate = () => router.push("/invoices/create/");
  const goToList = () => router.push("/invoices/");

  return (
    <>
      {/* Buttons */}
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 p-6 no-print bg-slate-50/50">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#0B2545] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm font-semibold"
          onClick={handlePrint}
        >
          <Printer size={18} />
          Print
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#1CA3C4] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm font-semibold"
          onClick={handleDownloadPDF}
        >
          <FileDown size={18} />
          Download PDF
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95 text-sm font-semibold"
          onClick={goToCreate}
        >
          <ArrowLeft size={18} />
          Back to Create Form
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95 text-sm font-semibold"
          onClick={goToList}
        >
          <LayoutList size={18} />
          Invoice List
        </button>
      </div>

      {/* Invoice Content */}
      <div
        className="container my-3 p-4 bg-white border shadow-sm rounded"
        ref={invoiceRef}
        style={{ maxWidth: "720px" }}
      >
        {/* Header */}
        <div
          className="px-3 py-2 mb-1 d-flex align-items-center rounded"
          style={{
            backgroundColor: "#136270ff",
            color: "white",
            fontWeight: "bold",
            fontSize: "20px",
            justifyContent: "space-between",
          }}
        >
          {/* Left Side: Brand Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "10%",
            }}
          >
            <span>ADSTRA DIGITAL</span>
          </div>

          {/* Right Side: Logo in larger white box */}
          <div
            className="rounded"
            style={{
              display: "flex",
              position: "absolute",
              justifyContent: "start",
              alignItems: "center",
              width: "80px",
              height: "80px",
              backgroundColor: "white",
              padding: "5px",
              marginLeft: "500px",
              border: "1px black solid",
            }}
          >
            <img
              src="/assets/logo_gellery.png"
              alt="Logo"
              style={{
                height: "100%", // taller than container
                width: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        <div
          className="text-end"
          style={{
            fontSize: "2rem",
            marginRight: "50px",
            marginTop: "30px",
            marginBottom: "30px",
            fontWeight: "bold",
          }}
        >
          INVOICE
        </div>

        {/* Client Info */}
        <div className="row px-3">
          <div className="col-md-5">
            <h6 className="fw-bold">Bill To</h6>
            <p style={{ fontSize: "14px" }}>
              {invoice?.client?.name || "N/A"}
              <br />
              {invoice?.client?.company_name &&
                `${invoice.client.company_name}\n`}
              {invoice?.client?.address}
              <br />
              {invoice?.client?.contact && `📞 ${invoice.client.contact}`}
              <br />
              {invoice?.client?.email && `✉️ ${invoice.client.email}`}
              <br />
              {invoice?.client?.gstin && `GSTIN: ${invoice.client.gstin}`}
              <br />
              {invoice?.client?.lut && `LUT: ${invoice.client.lut}`}
            </p>
          </div>

          <div className="col-md-7">
            <table className="table table-sm table-borderless">
              <tbody>
                <tr>
                  <th>Invoice No:</th>
                  <td style={{ fontSize: "0.8rem" }}>{invoice?.invoice_no}</td>
                </tr>
                <tr>
                  <th>Date:</th>
                  <td>
                    {invoice?.date
                      ? new Date(invoice.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <th>Due Date:</th>
                  <td>
                    {invoice?.due_date
                      ? new Date(invoice.due_date).toLocaleDateString("en-IN")
                      : "Upon Delivery"}
                  </td>
                </tr>
                <tr>
                  <th>Payment status:</th>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice?.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice?.status === 'partially_paid' ? 'bg-blue-100 text-blue-700' :
                        invoice?.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {invoice?.status ? invoice.status.replace("_", " ").toUpperCase() : "UNPAID"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-3 px-3">
          <table className="table table-bordered table-sm">
            <thead className="table-dark">
              <tr>
                <th className="text-center">Description</th>
                <th className="text-center">Qty</th>
                <th className="text-center">Rate</th>
                <th className="text-center">GST</th>
                <th className="text-center">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.items?.map((item, i) => {
                const rate = Number(item.rate) || 0;
                const quantity = Number(item.quantity) || 0;
                const gstPercent = Number(item.gst) || 0;
                const base = rate * quantity;
                const gstAmount = (base * gstPercent) / 100;
                const total = base + gstAmount;

                return (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{quantity}</td>
                    <td className="text-end">₹{rate.toFixed(2)}</td>
                    <td className="text-end">
                      ₹{gstAmount.toFixed(2)}{" "}
                      <small className="text-muted">({gstPercent}%)</small>
                    </td>
                    <td className="text-end">₹{total.toFixed(2)}</td>
                  </tr>
                );
              })}
              {/* Subtotal Row */}
              <tr>
                <td colSpan="4" className="text-end text-muted" style={{ fontSize: "12px" }}>
                  Subtotal
                </td>
                <td className="text-end" style={{ fontSize: "12px" }}>
                  ₹{(invoice?.items?.reduce((sum, item) => {
                    const base = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
                    const gst = (base * (Number(item.gst) || 0)) / 100;
                    return sum + base + gst;
                  }, 0) || 0).toFixed(2)}
                </td>
              </tr>

              {/* Discount Row */}
              {Number(invoice?.discount_amount) > 0 && (
                <tr>
                  <td colSpan="4" className="text-end text-danger" style={{ fontSize: "12px" }}>
                    Discount (-)
                  </td>
                  <td className="text-end text-danger" style={{ fontSize: "12px" }}>
                    - ₹{Number(invoice.discount_amount).toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Fee Row */}
              {Number(invoice?.additional_fee) > 0 && (
                <tr>
                  <td colSpan="4" className="text-end text-muted" style={{ fontSize: "12px" }}>
                    Additional Fee (+)
                  </td>
                  <td className="text-end" style={{ fontSize: "12px" }}>
                    + ₹{Number(invoice.additional_fee).toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Tax Row */}
              {Number(invoice?.tax_amount) > 0 && (
                <tr>
                  <td colSpan="4" className="text-end text-muted" style={{ fontSize: "12px" }}>
                    Taxes / Adjustments (+)
                  </td>
                  <td className="text-end" style={{ fontSize: "12px" }}>
                    + ₹{Number(invoice.tax_amount).toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Grand Total Row */}
              <tr>
                <td colSpan="4" className="text-end fw-bold">
                  Grand Total
                </td>
                <td className="text-end fw-bold text-primary">
                  ₹
                  {invoice?.total_amount
                    ? Number(invoice.total_amount).toFixed(2)
                    : "0.00"}
                </td>
              </tr>
              {invoice?.total_in_words && (
                <tr>
                  <td colSpan="5" className="fst-italic text-end text-muted" style={{ fontSize: "11px" }}>
                    (In Words): {invoice.total_in_words}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bank Info */}
        <div className="px-3 mt-4 text-start">
          <b className="fw-bold">Bank Details</b>
          <p className="mb-0">
            HDFC Bank, Sulthan Bathery Branch, Wayanad, Kerala
          </p>
          <p className="mb-0">Account Number: 50200091927202</p>
          <p className="mb-0">IFSC Code: HDFC0001595</p>
        </div>

        <div
          className="mt-3 p-3 border border-dark rounded bg-light"
          style={{
            fontSize: "10px",
            lineHeight: "1.3",
            fontWeight: "500",
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
          }}
        >
          <strong>Terms & Conditions:</strong>
          <ul className="mb-0 mt-2">
            <li>
              Advance Payment: 40% of the total project value is payable in
              advance to initiate work.
            </li>
            <li>
              Balance Payment: Remaining 60% is due upon final delivery of the
              agreed scope.
            </li>
            <li>
              Taxes: Applicable taxes (GST or others) will be charged extra, as
              per prevailing rates.
            </li>
            <li>
              Disclaimer: Errors and omissions may be expected in the invoice;
              any discrepancies will be addressed promptly upon notification.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="row mt-5">
          {/* Company Info */}
          <div className="col-md-6 text-start">
            <p className="fw-bold mb-1">Adstra Digital</p>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              Husna Complex, 1st Floor
              <br />
              Nadakkavu, Kozhikode 673011
            </p>
            <p
              className="text-muted"
              style={{ fontSize: "13px", fontWeight: "bold" }}
            >
              Elevating brands. Humanizing technology.
            </p>
          </div>

          {/* GST & LUT */}
          <div className="col-md-6 text-end">
            <p className="fw-bold mb-1" style={{ fontSize: "13px" }}>
              <span className="text-muted">GSTIN:</span> 32CMJPK3035L1Z2
            </p>
            <p className="fw-bold" style={{ fontSize: "13px" }}>
              <span className="text-muted">LUT No:</span> AD320625010204R
            </p>
          </div>
        </div>

        {/* Final Message */}
        <div
          className="text-muted text-center mt-4"
          style={{ fontStyle: "italic", fontSize: "13px" }}
        >
          This is a computer-generated invoice. No signature is required.
        </div>
      </div>

      <style jsx>{`
        .skyline-bg {
          background: url("/skyline.png") no-repeat center bottom;
          background-size: contain;
          height: 160px;
          margin-top: 40px;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          p {
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}
