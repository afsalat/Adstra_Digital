"use client";
import html2pdf from "html2pdf.js";

export default function ExportButton({ rootId = "proposal-content" }) {
  const handleExport = () => {
    const element = document.getElementById(rootId);
    if (!element) return;
    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: "proposal.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .save();
  };

  return (
    <button
      onClick={handleExport}
      style={{ background: "#fff", border: "1px solid #d1d5db", color: "#374151", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download PDF
    </button>
  );
}
