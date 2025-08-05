"use client";

import { useState } from "react";
import { toWords } from "number-to-words";
import React from "react";

// Service Description Templates
import { serviceExtraDetails } from "@/data/clientData";

export default function ProposalPreview({ services = [] }) {
  function numberToWords(num) {
    return toWords(num).replace(/\b\w/g, (c) => c.toUpperCase()) + " Only";
  }

  const subtotal = services.reduce((sum, item) => sum + item.amount, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const groupedServices = services.reduce((acc, item) => {
    const category = item.category || "Other Services";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

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
      const match = line.match(/^\-?\s*\*\*(.*?)\*\*:/);
      if (!match) return true;
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

  const sections = [
    {
      title: "Introduction",
      type: "text",
      alignment: "left",
      content:
        "Welcome to the proposal. This section outlines the purpose and key highlights of the engagement.",
    },
    ...dynamicSections,
  ];

  return (
    <div className="proposal-preview-wrapper text-[15px] text-gray-800 leading-relaxed">
      <div className="pdf-page">
        <div className="mb-2 text-center">
          <div className="border-b-2 border-indigo-200 mt-5 w-24 mx-auto" />
        </div>

        {services.length > 0 && (
          <div className="border-t mt-3">
            <h4 className="text-xl font-bold text-indigo-800">
              💼 Services Brief
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
                      <React.Fragment key={groupIdx}>
                        <tr
                          className="bg-gray-200 text-gray-700"
                          style={{ backgroundColor: "lightgray" }}
                        >
                          <td
                            colSpan={5}
                            className="px-4 py-2 font-semibold border border-gray-300"
                          >
                            {category}
                          </td>
                        </tr>
                        {items.map((item, idx) => {
                          const qty = item.quantity || 1;
                          const rate = item.rate || 0;
                          const gstRate = parseFloat(item.gst || "18");
                          const baseAmount = qty * rate;
                          const gstAmount = (baseAmount * gstRate) / 100;
                          const totalAmount = baseAmount + gstAmount;
                          return (
                            <tr
                              key={idx}
                              className={`$%{idx % 2 === 0 ? "bg-white" : "bg-indigo-50"} hover:bg-indigo-100 transition`}
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

      {/* Sections */}
      <div className="pdf-page" style={{ breakBefore: "page" }}>
        {sections.map((sec, i) => {
          const lines = sec.content
            ?.split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

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
              key={i}
              className="mb-8 pb-6 border-b border-dashed border-gray-300 last:border-none last:pb-0"
            >
              <h2
                className="text-xl sm:text-2xl font-bold text-indigo-700 mb-2"
                style={{ textAlign: sec.alignment || "left" }}
              >
                {sec.title}
              </h2>

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
      <div className="mt-6 p-4 text-center rounded-md bg-gray-50">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          🏦 We bank with HDFC Bank
        </h4>
        <p>
          <strong>Account Holder:</strong> Adstra Digital Pvt. Ltd. <br />
          <strong>A/C No:</strong> 50200091927202 | <strong>IFSC:</strong>
          HDFC0001595
        </p>
        <p></p>
      </div>

      {/* --- Conclusion --- */}
      <div className="mt-6 mb-2 text-gray-700 leading-relaxed text-center">
        <h4 className="text-xl font-semibold mb-2 text-indigo-700">
          Conclusion
        </h4>
        <p style={{ fontSize: "0.8rem" }}>
          We are committed to delivering quality services with full
          transparency,
          <br />
          measurable outcomes, and a focus on long-term success.
          <br />
          Thank you for considering Adstra Digital as your strategic partner.
        </p>

        {/* --- Footer --- */}
        <div style={{ fontSize: "0.7rem" }} className="footer-small">
          <p>
            <strong>LUT Registered:</strong> hence ZERO taxation for Overseas
            billing.
            <br />© {new Date().getFullYear()} <strong>Adstra Digital</strong>.
            All rights reserved.
            <br />
            Powered by Passion • Driven by Strategy • Delivered with Creativity
          </p>
        </div>
      </div>
    </div>
  );
}
