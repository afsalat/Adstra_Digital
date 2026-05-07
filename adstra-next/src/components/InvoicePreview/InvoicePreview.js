"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Printer, FileDown, ArrowLeft, LayoutList, Edit } from "lucide-react";
import API_BASE_URL from "@/utils/apiBase";

export default function InvoicePreview() {
  const invoiceRef = useRef();
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceID")?.replace(/\/+$/, "");

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);

  const API_BASE = API_BASE_URL;

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!invoiceId) return;
    axios.get(`${API_BASE}/invoice/view/${invoiceId}/?_=${Date.now()}`).then((res) => {
      setInvoice(res.data);
      setItems(res.data.items);
      // Update document title for professional printing
      const clientName = res.data?.client?.company_name || res.data?.client?.name || "";
      const sanitizedName = clientName.replace(/[^a-z0-9]/gi, '_').toUpperCase();
      document.title = sanitizedName ? `invoice_${invoiceId}_${sanitizedName}` : `invoice_${invoiceId}`;
    });

    // Fetch Company Settings with cache busting
    axios.get(`${API_BASE}/settings/?_=${Date.now()}`).then((res) => {
      setSettings(res.data);
    }).catch(err => console.error("Settings Fetch Error:", err));
  }, [invoiceId, API_BASE]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;
    
    const clientName = invoice?.client?.company_name || invoice?.client?.name || "";
    const sanitizedName = clientName.replace(/[^a-z0-9]/gi, '_').toUpperCase();
    const pdfFileName = sanitizedName ? `invoice_${invoiceId}_${sanitizedName}.pdf` : `invoice_${invoiceId}.pdf`;

    const opt = {
      margin: 0,
      filename: pdfFileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const goToCreate = () => {
    if (invoice?.is_proforma) {
      router.push("/invoices/proforma/create/");
    } else {
      router.push("/invoices/create/");
    }
  };
  
  const goToList = () => {
    if (invoice?.is_proforma) {
      router.push("/invoices/proforma/");
    } else {
      router.push("/invoices/");
    }
  };

  const handleEdit = () => {
    if (invoice?.id) {
      router.push(`/invoices/edit/?id=${invoice.id}`);
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 p-6 no-print bg-slate-50/50 flex-wrap">
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
        {(user?.username?.toLowerCase() === "wilson" || user?.fullname?.toLowerCase() === "wilson" || user?.is_staff || user?.is_superuser) && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#3182ce] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm font-semibold"
            onClick={handleEdit}
          >
            <Edit size={18} />
            Edit
          </button>
        )}
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
          Go to List
        </button>
      </div>

      {/* Invoice Content */}
      <div
        className="container my-3 p-4 bg-white border shadow-sm rounded"
        ref={invoiceRef}
        style={{ maxWidth: "720px" }}
      >
        {/* Boxed GST Style Invoice Content - Combined First Row */}
        <div style={{ border: '2px solid black', fontFamily: 'Arial, sans-serif', color: 'black', background: 'white' }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid black', fontSize: '10px', fontWeight: 'bold' }}>
            <span>Page No. 1 of 1</span>
            <span style={{ fontSize: '22px', letterSpacing: '4px', fontWeight: '900' }}>
              {invoice?.is_proforma ? "PROFORMA INVOICE" : "INVOICE"}
            </span>
            <span>Original Copy</span>
          </div>

          {/* Row 1: Logo and Invoice Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid black' }}>
            <div style={{ padding: '12px', borderRight: '1px solid black', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/assets/logo_new-01.png"
                alt="Adstra Logo"
                style={{ maxWidth: '220px', height: 'auto' }}
              />
            </div>
            <div style={{ padding: '8px', fontSize: '11px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>Invoice Details:</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#666' }}>{invoice?.is_proforma ? "Proforma No" : "Invoice No"}</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice?.invoice_no}</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#666' }}>Date</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice?.date ? new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#666' }}>Due Date</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : "Upon Delivery"}</span></td>
                  </tr>
                  {invoice?.reference && (
                    <tr>
                      <td style={{ padding: '2px 0', color: '#666' }}>Reference</td>
                      <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice.reference}</span></td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '2px 0', color: '#666' }}>Place</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>Kerala</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 2: From & To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid black' }}>
            <div style={{ padding: '8px', borderRight: '1px solid black', fontSize: '10px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>From:</div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{settings?.name || "Company Name not set"}</div>
              <div style={{ fontSize: '9px', color: '#666', marginBottom: '8px' }}>ISO 9001:2015 & IAF Certified</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4', wordBreak: 'break-word' }}>
                {(settings?.address || "Husna Complex, 1st Floor, Nadakkavu, Kozhikode, Kerala - 673011").replace(', Kozhikode', ',\nKozhikode')}
              </div>
              <div style={{ marginTop: '2px', wordBreak: 'break-word' }}>
                GSTIN: {settings?.gstin || "N/A"} 
                {settings?.lut_no && ` | LUT: ${settings.lut_no}`}
              </div>
              <div style={{ wordBreak: 'break-word' }}>Mobile: {settings?.mobile || "N/A"}</div>
              <div style={{ wordBreak: 'break-word' }}>Email: {settings?.email || "N/A"}</div>
            </div>
            <div style={{ padding: '8px', fontSize: '11px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>To:</div>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>{invoice?.client?.company_name || invoice?.client?.name || "N/A"}</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4', wordBreak: 'break-word' }}>{invoice?.client?.address || "N/A"}</div>
              <div>Email: {invoice?.client?.email || "-"}</div>
            </div>
          </div>
          {/* Items Table Section */}
          <div style={{ minHeight: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid black', backgroundColor: '#f9fafb' }}>
                  <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '40px' }}>Sr.</th>
                  <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'left' }}>Item Description</th>
                  <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '60px' }}>Qty</th>
                  <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', width: '100px' }}>Rate (Rs)</th>
                  {!invoice?.is_proforma && <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '90px' }}>Tax (Amt/%)</th>}
                  <th style={{ padding: '6px', textAlign: 'right', width: '100px' }}>Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {(invoice?.items || []).map((item, i) => {
                  const rate = Number(item.rate) || 0;
                  const qty = Number(item.quantity) || 0;
                  const gst = invoice?.is_proforma ? 0 : (Number(item.gst) || 0);
                  const base = rate * qty;
                  const gstAmt = (base * gst) / 100;
                  const total = base + gstAmt;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ borderRight: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.description}</td>
                      <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{qty.toFixed(2)}</td>
                      <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>{rate.toFixed(2)}</td>
                      {!invoice?.is_proforma && <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', fontSize: '10px' }}>{gstAmt.toFixed(2)} ({gst}%)</td>}
                      <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{base.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {/* Financial Breakdown */}
                <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                  <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Sub Total</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>
                    {invoice?.items?.reduce((sum, item) => sum + (Number(item.rate || 0) * Number(item.quantity || 0)), 0).toFixed(2)}
                  </td>
                </tr>
                {(!invoice?.is_proforma) && (
                  <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                    <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Total Tax (GST)</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>
                      {invoice?.items?.reduce((sum, item) => sum + ((Number(item.rate || 0) * Number(item.quantity || 0) * Number(item.gst || 0)) / 100), 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                {Number(invoice?.tax_amount || 0) > 0 && !invoice?.is_proforma && (
                   <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                    <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Other Taxes / Adjustments</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{Number(invoice.tax_amount).toFixed(2)}</td>
                  </tr>
                )}
                {invoice?.additional_charges && invoice.additional_charges.length > 0 ? (
                  invoice.additional_charges.map((charge, idx) => {
                    const subtotal = invoice.items?.reduce((sum, item) => sum + (Number(item.rate || 0) * Number(item.quantity || 0)), 0) || 0;
                    const chargeAmt = charge.charge_type === 'percentage'
                      ? (subtotal * (Number(charge.amount || 0) / 100))
                      : Number(charge.amount || 0);

                    return charge.amount > 0 && (
                      <tr key={`charge-${idx}`} style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                        <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>
                          {charge.label || 'Additional Fee'} {charge.charge_type === 'percentage' ? `(${charge.amount}%)` : ''} (+)
                        </td>
                        <td style={{ padding: '6px', textAlign: 'right' }}>{chargeAmt.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  Number(invoice?.additional_fee || 0) > 0 && (
                    <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                      <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Additional Fee (+)</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>{Number(invoice.additional_fee).toFixed(2)}</td>
                    </tr>
                  )
                )}
                 {Number(invoice?.discount_amount || 0) > 0 && (
                  <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                    <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>{invoice?.discount_label || 'Discount'} (-)</td>
                    <td style={{ padding: '6px', textAlign: 'right', color: 'red' }}>- {Number(invoice.discount_amount).toFixed(2)}</td>
                  </tr>
                )}
                <tr style={{ borderTop: '1px solid black', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                  <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', fontSize: '13px' }}>Grand Total (Rs)</td>
                  <td style={{ padding: '6px', textAlign: 'right', fontSize: '14px' }}>{Number(invoice?.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                {Number(invoice?.advance_amount || 0) > 0 && (
                  <>
                    <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                      <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Advance Paid (-)</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>- {Number(invoice.advance_amount).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid black', fontWeight: 'bold', backgroundColor: '#eef2ff' }}>
                      <td colSpan={invoice?.is_proforma ? "4" : "5"} style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', fontSize: '13px', color: '#4f46e5' }}>Balance Due (Rs)</td>
                      <td style={{ padding: '6px', textAlign: 'right', fontSize: '14px', color: '#4f46e5' }}>{(Number(invoice.total_amount) - Number(invoice.advance_amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>

          {/* Amount in words */}
          <div style={{ padding: '8px', borderTop: '1px solid black', borderBottom: '1px solid black', fontSize: '11px' }}>
            <span style={{ fontWeight: 'bold' }}>Rs.</span> {invoice?.total_in_words}
          </div>

          {/* Footer Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '10px' }}>
            <div style={{ padding: '8px', borderRight: '1px solid black' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>Terms and Conditions:</div>
              <ul style={{ paddingLeft: '15px', margin: '0', listStyleType: 'disc', fontSize: '9px' }}>
                {settings?.terms_conditions ? (
                  settings.terms_conditions.split(/\n|\/\//).filter(t => t.trim()).map((term, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{term.trim()}</li>
                  ))
                ) : (
                  <>
                    <li>Payment should be made within the due date mentioned</li>
                    <li>Please quote invoice number in all communications</li>
                    <li>Taxes and charges as per applicable govt laws</li>
                  </>
                )}
              </ul>
            </div>
            <div style={{ padding: '8px', borderRight: '1px solid black' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>Official Bank Details:</div>
              <div style={{ fontSize: '9px', lineHeight: '1.4' }}>
                Acc No: <span style={{ fontWeight: 'bold' }}>{settings?.account_no || "N/A"}</span><br />
                Bank: <span style={{ fontWeight: 'bold' }}>{settings?.bank_name || "N/A"}</span><br />
                IFSC: <span style={{ fontWeight: 'bold' }}>{settings?.ifsc || "N/A"}</span><br />
                Branch: <span style={{ fontWeight: 'bold' }}>{settings?.branch || "N/A"}</span>
              </div>
            </div>
            <div style={{ padding: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minHeight: '100px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>For {settings?.name || "Adstra Digital"}</div>
              <img
                src="/assets/seal.png"
                alt="Company Seal"
                style={{ width: '80px', height: 'auto', marginBottom: '4px', opacity: 0.85 }}
              />
              <div style={{ borderTop: '1px solid black', width: '80%', padding: '4px 0', fontWeight: 'bold' }}>Authorised Signatory</div>
            </div>
          </div>

          {invoice?.is_proforma && (
            <div style={{ padding: '4px 12px', borderTop: '1px solid black', textAlign: 'center', fontSize: '8px', color: '#666', fontStyle: 'italic' }}>
              This is a proforma invoice issued for reference and documentation purposes only. It is not a demand for payment but a preliminary statement of charges.
            </div>
          )}

          <div style={{ padding: '4px', borderTop: '1px solid black', textAlign: 'center', fontSize: '9px', color: '#666' }}>
            This is a computer-generated {invoice?.is_proforma ? "proforma invoice" : "invoice"}. No signature is required.
          </div>
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
