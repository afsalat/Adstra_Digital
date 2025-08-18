"use client";

import { useSearchParams } from "next/navigation";
import ReceiptDetail from "../../../components/ReceiptDetail/ReceiptDetail";

export default function ReceiptResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return <div>No receipt ID provided</div>;
  }

  return <ReceiptDetail id={id} />;
}
