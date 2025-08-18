import React, { useState } from "react";

const ReceiptForm = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    client_name: "",
    amount: "",
    date: "",
    mode: "UPI",
    note: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Add New Receipt</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input
              className="form-control mb-2"
              placeholder="Client Name"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              className="form-control mb-2"
              placeholder="Amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              className="form-control mb-2"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <select
              className="form-select mb-2"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
            >
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
            <textarea
              className="form-control mb-2"
              placeholder="Note"
              name="note"
              value={formData.note}
              onChange={handleChange}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-success" type="submit">
              Save Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptForm;
