"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { predefinedServices, serviceExtraDetails } from "../../data/clientData";

export default function ServiceTable({ services, onChange, onServiceSelect }) {
  const lastInputRef = useRef(null);
  const [selectedService, setSelectedService] = useState("");

  const handlePredefinedSelect = (e) => {
    const selected = e.target.value;
    setSelectedService(selected);

    const subItems = predefinedServices[selected] || [];

    const formatted = subItems.map((item) => ({
      ...item,
      category: selected,
      amount: (item.quantity || 0) * (item.rate || 0),
    }));

    onChange([...services, ...formatted]);

    if (onServiceSelect) onServiceSelect(selected);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...services];
    const val =
      field === "quantity" || field === "rate" ? Number(value) || 0 : value;
    updated[index][field] = val;
    updated[index].amount =
      (updated[index].quantity || 0) * (updated[index].rate || 0);
    onChange(updated);
  };

  const addItem = () => {
    onChange([
      ...services,
      { description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeItem = (index) => {
    const updated = services.filter((_, i) => i !== index);
    onChange(updated);
  };

  const subtotal = useMemo(
    () => services.reduce((sum, item) => sum + (item.amount || 0), 0),
    [services]
  );
  const gst = useMemo(() => subtotal * 0.18, [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  useEffect(() => {
    if (lastInputRef.current) lastInputRef.current.focus();
  }, [services.length]);

  return (
    <div className="mb-4">
      <h5 className="fw-bold text-secondary mb-3">💼 Services & Payment</h5>

      <div className="mb-3">
        <select
          className="form-select"
          value={selectedService}
          onChange={handlePredefinedSelect}
        >
          <option value="">-- Select Predefined Service --</option>
          {Object.keys(predefinedServices).map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {services.map((item, idx) => (
            <tr key={idx}>
              <td>
                <input
                  className="form-control"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(idx, "description", e.target.value)
                  }
                  ref={idx === services.length - 1 ? lastInputRef : null}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={item.quantity}
                  min={1}
                  onChange={(e) =>
                    handleItemChange(idx, "quantity", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={item.rate}
                  min={0}
                  onChange={(e) =>
                    handleItemChange(idx, "rate", e.target.value)
                  }
                />
              </td>
              <td>₹{item.amount?.toFixed(2) || "0.00"}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeItem(idx)}
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-outline-primary mb-3" onClick={addItem}>
        ➕ Add Item
      </button>

      <div className="text-end mt-3">
        <p>Subtotal: ₹ {subtotal.toFixed(2)}</p>
        <p>GST (18%): ₹ {gst.toFixed(2)}</p>
        <h5>Total: ₹ {total.toFixed(2)}</h5>
      </div>
    </div>
  );
}
