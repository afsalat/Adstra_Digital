"use client";


import React, { Suspense } from "react";
import InvoicePreview from "../../../components/InvoicePreview/InvoicePreview";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvoicePreview />
    </Suspense>
  );
}
