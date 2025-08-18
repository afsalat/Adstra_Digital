"use client";

import React, { Suspense } from "react";
import ReceiptResultContent from "./ReceiptResultContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <button
        onClick={() => window.history.back()}
        className="btn btn-secondary m-3 no-print"
      >
        Back
      </button>
      <ReceiptResultContent />

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Suspense>
  );
}
