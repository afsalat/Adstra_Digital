"use client";

import { toWords } from "number-to-words";
import React from "react";
import { serviceExtraDetails } from "@/data/clientData";

export default function ProposalPreview({
  services = [],
  sections: propSections = [],
}) {
  // Convert numbers to words
  function numberToWords(num) {
    return toWords(num).replace(/\b\w/g, (c) => c.toUpperCase()) + " Only";
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

  return (
    <div className="proposal-preview-wrapper text-[15px] text-gray-800 leading-relaxed">
      {/* --- Services Table --- */}
      <div className="pdf-page">


        {services.length > 0 && (
          <div className="border-t pt-6" style={{ marginTop: "60px", paddingTop: "24px" }}>
            <h4 className="text-xl font-bold text-indigo-800" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
              Services In Brief
            </h4>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm border border-gray-800 shadow-md rounded overflow-hidden">
                <thead>
                  <tr>
                    {["Description", "Qty", "Rate", "GST", "Amount"].map(
                      (col, i) => (
                        <th
                          key={i}
                          style={{
                            backgroundColor: "#29292fff",
                            color: "#fff",
                            padding: "12px",
                            border: "1px solid #727276ff",
                          }}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedServices).map(
                    ([category, items], groupIdx) => (
                      <React.Fragment key={category || groupIdx}>
                        <tr
                          className="bg-gray-200 text-gray-700"
                          style={{ backgroundColor: "lightgrey" }}
                        >
                          <td
                            colSpan={5}
                            className="px-4 py-2 font-semibold border border-gray-300"
                          >
                            {category}
                          </td>
                        </tr>
                        {items.map((item, idx) => {
                          const qty = parseFloat(item.quantity || 1);
                          const rate = parseFloat(item.rate || 0);
                          const gstRate = parseFloat(item.gst || "18");
                          const baseAmount = qty * rate;
                          const gstAmount = (baseAmount * gstRate) / 100;
                          const totalAmount = baseAmount + gstAmount;

                          return (
                            <tr
                              key={`${category}-${idx}-${item.id ?? item.description
                                }`}
                              className={`${idx % 2 === 0 ? "bg-white" : "bg-indigo-50"
                                } hover:bg-indigo-100 transition`}
                            >
                              <td className="px-4 py-2 border border-gray-200">
                                {item.description}
                              </td>
                              <td className="px-4 py-2 border border-gray-200 text-center">
                                {qty}
                              </td>
                              <td className="px-4 py-2 border border-gray-200 text-right text-indigo-700 font-medium">
                                ₹{rate.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 border border-gray-200 text-center">
                                ₹{gstAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 border border-gray-200 text-right text-indigo-800 font-semibold">
                                ₹{totalAmount.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    )
                  )}
                  <tr className="bg-indigo-100 text-indigo-800 font-semibold text-sm">
                    <td
                      colSpan={4}
                      style={{ fontSize: "0.8rem", paddingLeft: "5%" }}
                      className="footer-small py-3 text-left border border-gray-300 uppercase"
                    >
                      <b>Amount in Words:</b> ₹ {numberToWords(total)}
                    </td>
                    <td className="px-4 py-3 text-right border border-gray-300">
                      ₹{total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- Merged Sections (Manual + Dynamic) --- */}
      <div className="pdf-page" style={{ breakBefore: "page" }}>
        {sections.map((sec, i) => {
          const lines =
            sec.content
              ?.split("\n")
              .map((line) => line.trim())
              .filter(Boolean) || [];

          const contentElements = lines.map((line, idx) => {
            const match = line.match(/^-?\s*\*\*(.*?)\*\*:\s*(.*)/);
            if (match) {
              return (
                <p key={idx}>
                  <strong>{match[1]}:</strong> {match[2]}
                </p>
              );
            }
            return <p key={idx}>{line}</p>;
          });

          return (
            <div
              key={`${sec.title || "section"}-${i}`}
              className="mb-8 pb-6 last:pb-0"
            >
              <h4
                className="text-xl sm:text-2xl font-bold text-indigo-700 mb-2"
                style={{ textAlign: sec.alignment || "left" }}
              >
                {sec.title}
              </h4>
              <div
                className="text-[14px] sm:text-[15px] text-gray-800 leading-relaxed space-y-2"
                style={{ textAlign: sec.alignment || "left" }}
              >
                {contentElements}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Bank Details --- */}
      <div className="mt-8 pt-6 p-4 text-center rounded-md bg-gray-50" style={{ marginTop: "50px" }}>
        <h4 className="text-lg font-semibold text-gray-800 mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22" /><rect x="2" y="11" width="20" height="11" /><path d="M12 2L2 7h20z" /><line x1="12" y1="11" x2="12" y2="22" /><line x1="7" y1="11" x2="7" y2="22" /><line x1="17" y1="11" x2="17" y2="22" /></svg>
          We bank with HDFC Bank
        </h4>
        <p>
          <strong>Account Holder:</strong> Adstra Digital<br />
          <strong>A/C No:</strong> 50200091927202 | <strong>IFSC:</strong>{" "}
          HDFC0001595
        </p>
      </div>

      {/* --- Conclusion --- */}
      <div className="mt-6 mb-2 text-gray-700 leading-relaxed text-center">
        <h4 className="text-xl font-semibold mb-2 text-indigo-700">
          Conclusion
        </h4>
        <p style={{ fontSize: "0.8rem" }}>
          We are committed to delivering quality services with full <br />
          transparency, measurable outcomes, and a focus on long-term success.
          <br />
          Thank you for considering Adstra Digital as your strategic partner.
        </p>

        <div style={{ fontSize: "0.7rem" }} className="footer-small">
          <p>
            <strong>LUT Registered:</strong> hence ZERO taxation for Overseas
            billing.
            <br />© {new Date().getFullYear()} <strong>Adstra Digital</strong>.
            All rights reserved.
            <br />
            Powered by Passion - Driven by Strategy - Delivered with Creativity
          </p>
        </div>
      </div>
    </div>
  );
}
