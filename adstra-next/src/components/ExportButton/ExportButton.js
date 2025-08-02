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
      className="bg-green-800 text-dark px-4 py-2 rounded mt-4"
    >
      📄 Export PDF
    </button>
  );
}
