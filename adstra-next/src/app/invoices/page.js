"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/invoice/`)
      .then((res) => setInvoices(res.data))
      .catch((err) => console.error("Failed to fetch invoices:", err));
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(13);
    doc.text("Invoice List", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "#",
          "Invoice No",
          "Proposal No",
          "Purpose",
          "Client",
          "Amount",
          "Status",
        ],
      ],
      body: invoices.map((inv, index) => [
        index + 1,
        inv.invoice_no,
        inv.proposal?.proposal_no || "N/A",
        inv.proposal?.purpose || "N/A",
        inv.client?.name || "N/A",
        `${Number(inv.total_amount).toLocaleString("en-IN")}`,
        inv.status,
      ]),
      styles: {
        fontSize: 7,
        cellPadding: 1.2,
        overflow: "linebreak",
      },
      didDrawPage: (data) => {
        doc.setFontSize(10);
      },
    });

    doc.save("invoices.pdf");
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          onClick={() => router.push("/admindashboard/")}
          className="btn btn-secondary"
        >
          Back
        </button>
        <br />
        <h2 className="mb-0">Invoice List</h2>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={downloadPDF}
          >
            Download PDF
          </button>
          <Link href="/invoices/create" className="btn btn-primary">
            + Create New Invoice
          </Link>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>Invoice No</th>
              <th>Proposal No</th>
              <th>Purpose</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoice_no}</td>
                  <td>{inv.proposal?.proposal_no || "N/A"}</td>
                  <td>{inv.proposal?.purpose || "N/A"}</td>
                  <td>{inv.client?.name || "N/A"}</td>
                  <td>₹{inv.total_amount}</td>
                  <td>
                    <span
                      className={`badge ${
                        inv.status === "Paid"
                          ? "bg-success"
                          : inv.status === "Pending"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() =>
                        router.push(
                          `/invoices/result/?invoiceID=${inv.invoice_no}`
                        )
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
