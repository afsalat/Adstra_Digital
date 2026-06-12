"use client";

import { toWords } from "number-to-words";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import { serviceExtraDetails } from "@/data/clientData";

export default function ProposalPreview({
  services = [],
  sections: propSections = [],
  headerData = {},
}) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/settings/?_=${Date.now()}`).then((res) => {
      setSettings(res.data);
    }).catch((err) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("Settings Fetch Error:", err);
      }
    });
  }, []);

  // Convert numbers to words
  function numberToWords(num) {
    try {
      return toWords(num).replace(/\b\w/g, (c) => c.toUpperCase()) + " Only";
    } catch (e) {
      return "";
    }
  }

  // Group services by category
  const groupedServices = services.reduce((acc, item) => {
    const category = item.category || "Other Services";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Calculate totals consistently (row-level GST)
  let subtotal = 0;
  let totalGST = 0;

  services.forEach((item) => {
    const qty = parseFloat(item.quantity || 1);
    const rate = parseFloat(item.rate || 0);
    const gstRate = parseFloat(item.gst || "18");
    const baseAmount = qty * rate;
    const gstAmount = (baseAmount * gstRate) / 100;

    subtotal += baseAmount;
    totalGST += gstAmount;
  });

  const total = subtotal + totalGST;

  // Build dynamic sections from services + serviceExtraDetails
  function generateServiceSection(category, items) {
    const details = serviceExtraDetails[category];
    if (!details) return null;

    const lines = details
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const matchedItems = items.map((item) => item.description);

    const filteredLines = lines.filter((line) => {
      const match = line.match(/^-?\s*\*\*(.*?)\*\*:\s*/);
      if (!match) return true; // keep general lines
      return matchedItems.includes(match[1].trim());
    });

    return {
      title: category,
      type: "text",
      alignment: "left",
      content: filteredLines.join("\n"),
    };
  }

  const dynamicSections = Object.entries(groupedServices)
    .map(([category, items]) => generateServiceSection(category, items))
    .filter(Boolean);

  // ✅ Deduplicate: manual sections have priority, skip duplicate titles
  const existingTitles = new Set((propSections || []).map(sec => sec.title));
  const sections = [
    ...(propSections || []),
    ...dynamicSections.filter(sec => !existingTitles.has(sec.title)),
  ];

  // Helper to split text into paragraphs/bullet points
  const renderSectionContent = (content) => {
    const lines = content?.split("\n").map((line) => line.trim()).filter(Boolean) || [];
    const elements = [];
    let currentList = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} style={{ paddingLeft: '18px', margin: '4px 0 8px 0', listStyleType: 'disc' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px', fontSize: '11px', lineHeight: '1.4' }}>
                {item.title ? (
                  <>
                    <strong style={{ color: '#111' }}>{item.title}</strong>: {item.desc}
                  </>
                ) : (
                  item.desc
                )}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line) => {
      let isList = false;
      let title = null;
      let desc = line;

      // 1. Starts with a bullet (- or *)
      const bulletMatch = line.match(/^[-*]\s*(.*)/);
      if (bulletMatch) {
        isList = true;
        const inner = bulletMatch[1].trim();
        const boldMatch = inner.match(/^\*\*(.*?)\*\*:\s*(.*)/);
        if (boldMatch) {
          title = boldMatch[1].trim();
          desc = boldMatch[2].trim();
        } else {
          const plainMatch = inner.match(/^([A-Za-z0-9\s&/()_-]{2,35}):\s*(.*)/);
          if (plainMatch) {
            title = plainMatch[1].trim();
            desc = plainMatch[2].trim();
          } else {
            desc = inner;
          }
        }
      } else {
        // 2. No bullet prefix, but starts with bold title like **Backend**:
        const boldMatch = line.match(/^\*\*(.*?)\*\*:\s*(.*)/);
        if (boldMatch) {
          isList = true;
          title = boldMatch[1].trim();
          desc = boldMatch[2].trim();
        } else {
          // 3. No bullet prefix, starts with a plain title followed by a colon
          const plainMatch = line.match(/^([A-Za-z0-9\s&/()_-]{2,35}):\s*(.*)/);
          if (plainMatch) {
            isList = true;
            title = plainMatch[1].trim();
            desc = plainMatch[2].trim();
          }
        }
      }

      if (isList) {
        currentList.push({ title, desc });
      } else {
        flushList();
        elements.push(
          <p key={`p-${elements.length}`} style={{ margin: '6px 0', fontSize: '11.5px', lineHeight: '1.4', color: '#222' }}>
            {line}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  // Intro sections (typically "Proposal by ADSTRA DIGITAL" or similar)
  const introSections = sections.filter(sec => 
    sec.title?.toLowerCase().includes("proposal by") || 
    sec.title?.toLowerCase().includes("introduction") || 
    sec.title?.toLowerCase().includes("intro")
  );

  // Body/Conclusion sections (everything else)
  const otherSections = sections.filter(sec => 
    !sec.title?.toLowerCase().includes("proposal by") && 
    !sec.title?.toLowerCase().includes("introduction") && 
    !sec.title?.toLowerCase().includes("intro")
  );

  return (
    <div id="proposal-preview-pdf" className="proposal-preview-wrapper text-[15px] text-gray-800 leading-relaxed no-shadow">
      <div className="pdf-page">
        {/* Boxed GST Style Proposal Content */}
        <div style={{ border: '2px solid black', fontFamily: 'Arial, sans-serif', color: 'black', background: 'white' }}>
          
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid black', fontSize: '10px', fontWeight: 'bold' }}>
            <span>Page No. 1 of 1</span>
            <span style={{ fontSize: '22px', letterSpacing: '4px', fontWeight: '900' }}>
              PROPOSAL
            </span>
            <span>Original Copy</span>
          </div>

          {/* Row 1: Proposal Details and Logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid black' }}>
            <div style={{ fontSize: '11px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>Quotation Details:</div>
              <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 8px 2px 0', color: '#555' }}>Quotation No</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{headerData?.quotationNo || "—"}</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 8px 2px 0', color: '#555' }}>Date</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{headerData?.quotationDate ? new Date(headerData.quotationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}</span></td>
                  </tr>
                  {headerData?.reference && (
                    <tr>
                      <td style={{ padding: '2px 8px 2px 0', color: '#555' }}>Reference</td>
                      <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{headerData.reference}</span></td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '2px 8px 2px 0', color: '#555' }}>Place</td>
                    <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>Kerala</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <img
                src="/assets/logo_new-01.png"
                alt="Adstra Logo"
                style={{ maxWidth: '220px', height: 'auto' }}
              />
            </div>
          </div>

          {/* Row 2: From & To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid black' }}>
            <div style={{ padding: '8px', borderRight: '1px solid black', fontSize: '10px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>From:</div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{settings?.name || "Adstra Digital"}</div>
              <div style={{ fontSize: '9px', color: '#666', marginBottom: '8px' }}>ISO 9001:2015 & IAF Certified</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4', wordBreak: 'break-word' }}>
                {(settings?.address || "Husna Complex, 1st Floor, Nadakkavu, Kozhikode, Kerala - 673011").replace(', Kozhikode', ',\nKozhikode')}
              </div>
              <div style={{ marginTop: '4px', wordBreak: 'break-word' }}>
                <strong>GSTIN:</strong> {settings?.gstin || "32CMJPK3035L1Z2"} 
                {(settings?.lut_no || "AD320224004945V") && ` | LUT: ${settings?.lut_no || "AD320224004945V"}`}
              </div>
              <div style={{ wordBreak: 'break-word' }}><strong>Mobile:</strong> {settings?.mobile || "+91 974 477 9574 | 956 756 8185"}</div>
              <div style={{ wordBreak: 'break-word' }}><strong>Email:</strong> {settings?.email || "info.adstradigital@gmail.com"}</div>
            </div>
            <div style={{ padding: '8px', fontSize: '11px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>To:</div>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>{headerData?.billTo?.name || "Client Name"}</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4', wordBreak: 'break-word' }}>{headerData?.billTo?.address || "—"}</div>
              {headerData?.billTo?.gstin && headerData?.billTo?.gstin !== "N/A" && (
                <div><strong>GSTIN:</strong> {headerData.billTo.gstin}</div>
              )}
              {headerData?.billTo?.email && (
                <div><strong>Email:</strong> {headerData.billTo.email}</div>
              )}
            </div>
          </div>

          {/* Purpose */}
          {headerData?.purpose && (
            <div style={{ padding: '8px', borderBottom: '1px solid black', fontSize: '11px' }}>
              <strong>Purpose:</strong> {headerData.purpose}
            </div>
          )}

          {/* Intro Sections */}
          {introSections.length > 0 && (
            <div style={{ padding: '12px', borderBottom: '1px solid black', fontSize: '12px', lineHeight: '1.5' }}>
              {introSections.map((sec, i) => (
                <div key={i} style={{ marginBottom: i < introSections.length - 1 ? '12px' : '0' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0', color: '#111' }}>{sec.title}</h4>
                  <div style={{ color: '#333' }}>
                    {renderSectionContent(sec.content)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Items/Services Table Section */}
          {services.length > 0 && (
            <div style={{ borderBottom: '1px solid black' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid black', backgroundColor: '#f9fafb' }}>
                    <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '40px' }}>Sr.</th>
                    <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'left' }}>Item / Service Description</th>
                    <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '60px' }}>Qty</th>
                    <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', width: '100px' }}>Rate (Rs)</th>
                    <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '90px' }}>Tax (Amt/%)</th>
                    <th style={{ padding: '6px', textAlign: 'right', width: '100px' }}>Amount (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedServices).map(([category, items], groupIdx) => (
                    <React.Fragment key={category || groupIdx}>
                      <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
                        <td colSpan={6} style={{ padding: '4px 8px', borderBottom: '1px solid #eee', fontSize: '10px' }}>
                          {category}
                        </td>
                      </tr>
                      {items.map((item, idx) => {
                        const qty = Number(item.quantity) || 1;
                        const rate = Number(item.rate) || 0;
                        const gst = Number(item.gst) || 18;
                        const base = rate * qty;
                        const gstAmt = (base * gst) / 100;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                            <td style={{ borderRight: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.description}</td>
                            <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{qty.toFixed(2)}</td>
                            <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>{rate.toFixed(2)}</td>
                            <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', fontSize: '10px' }}>{gstAmt.toFixed(2)} ({gst}%)</td>
                            <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{base.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot>
                  {/* Financial Breakdown */}
                  <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                    <td colSpan="5" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Sub Total</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                    <td colSpan="5" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Total Tax (GST)</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{totalGST.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid black', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                    <td colSpan="5" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', fontSize: '13px' }}>Grand Total (Rs)</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontSize: '14px' }}>{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Amount in words */}
          {total > 0 && (
            <div style={{ padding: '8px', borderBottom: '1px solid black', fontSize: '11px' }}>
              <span style={{ fontWeight: 'bold' }}>Rs.</span> {numberToWords(total)}
            </div>
          )}

          {/* Other Sections (Conclusions / details) */}
          {otherSections.length > 0 && (
            <div style={{ padding: '12px', borderBottom: '1px solid black', fontSize: '12px', lineHeight: '1.5', pageBreakBefore: 'always', breakBefore: 'always' }}>
              {otherSections.map((sec, i) => (
                <div key={i} style={{ marginBottom: i < otherSections.length - 1 ? '12px' : '0' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0', color: '#111' }}>{sec.title}</h4>
                  <div style={{ color: '#333' }}>
                    {renderSectionContent(sec.content)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Section: Terms, Bank Details, Signatory */}
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
                    <li>Proposal / Quotation is valid for 30 days.</li>
                    <li>Payment terms: As agreed in terms of reference.</li>
                    <li>All disputes are subject to Kozhikode jurisdiction.</li>
                  </>
                )}
              </ul>
            </div>
            <div style={{ padding: '8px', borderRight: '1px solid black' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>Official Bank Details:</div>
              <div style={{ fontSize: '9px', lineHeight: '1.4' }}>
                Acc Holder: <span style={{ fontWeight: 'bold' }}>Adstra Digital</span><br />
                Acc No: <span style={{ fontWeight: 'bold' }}>50200091927202</span><br />
                Bank: <span style={{ fontWeight: 'bold' }}>HDFC Bank</span><br />
                IFSC: <span style={{ fontWeight: 'bold' }}>HDFC0001595</span>
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

          <div style={{ padding: '4px', borderTop: '1px solid black', textAlign: 'center', fontSize: '9px', color: '#666' }}>
            This is a computer-generated proposal. No signature is required.
          </div>

        </div>
      </div>
    </div>
  );
}
