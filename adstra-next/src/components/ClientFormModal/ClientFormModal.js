"use client";
import { useState } from "react";

export default function ClientFormModal({ onClose, onSave }) {
  const [client, setClient] = useState({
    company_name: "",
    name: "",
    address: "",
    gstin: "",
    lut: "",
    email: "",
    contact: "",
  });

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clientWithId = { ...client, id: Date.now().toString() };
    onSave(clientWithId);
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content border-0 rounded shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Register New Client</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-2">
                <label className="form-label">Company Name</label>
                <input type="text" name="company_name" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Client Name</label>
                <input type="text" name="name" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Address</label>
                <input type="text" name="address" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Email ID</label>
                <input type="email" name="email" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Contact No</label>
                <input type="tel" name="contact" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">GSTIN</label>
                <input type="text" name="gstin" className="form-control" onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label className="form-label">LUT</label>
                <input type="text" name="lut" className="form-control" onChange={handleChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" type="submit">Save Client</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
