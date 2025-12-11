"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Model from "../../components/Modal.jsx";
import ReceiptForm from "./create/page";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const ReceiptManager = () => {
  const [receipts, setReceipts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions/list-create/`);
      setReceipts(res.data);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  const handleCreate = async (newReceipt) => {
    try {
      await axios.post(`${API_URL}/transactions/list-create/`, newReceipt);
      fetchReceipts();
      setShowForm(false);
    } catch (err) {
      console.error("Error creating receipt:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">📄 Receipt List</h4>
      <button
        onClick={() => window.history.back()}
        className="btn btn-secondary m-2"
      >
        Back
      </button>
      <button
        className="btn btn-primary m-2"
        onClick={() => setShowForm(true)}
      >
        ➕ Add Receipt
      </button>

      <table className="table table-bordered">
        <thead className="thead-light">
          <tr>
            <th>#</th>
            <th>Invoice</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {receipts.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No receipts found.
              </td>
            </tr>
          ) : (
            receipts.map((receipt, index) => (
              <tr key={receipt.id}>
                <td>{index + 1}</td>
                <td>{receipt.invoice?.invoice_no}</td>
                <td>{receipt.client_name}</td>
                <td>₹{Number(receipt.amount).toLocaleString("en-IN")}</td>
                <td>{receipt.date}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() =>
                      router.push(`/receipts/result?id=${receipt.id}/`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showForm && (
        <Model onClose={() => setShowForm(false)}>
          <ReceiptForm
            onClose={() => setShowForm(false)}
            onCreate={handleCreate}
          />
        </Model>
      )}
    </div>
  );
};

export default ReceiptManager;
