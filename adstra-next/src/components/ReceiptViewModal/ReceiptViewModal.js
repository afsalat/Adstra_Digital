import React from "react";

const ReceiptViewModal = ({ receipt, onClose }) => (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Receipt Details</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <p><strong>Client:</strong> {receipt.client_name}</p>
          <p><strong>Amount:</strong> ₹{receipt.amount.toLocaleString("en-IN")}</p>
          <p><strong>Date:</strong> {receipt.date}</p>
          <p><strong>Mode:</strong> {receipt.mode}</p>
          <p><strong>Note:</strong> {receipt.note || "N/A"}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ReceiptViewModal;
