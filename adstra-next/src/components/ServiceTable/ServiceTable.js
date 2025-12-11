"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { predefinedServices } from "../../data/clientData";

export default function ServiceTable({ services, onChange, onServiceSelect }) {
  const lastInputRef = useRef(null);

  // FIX: selectedService should be an array, not a string
  const [selectedService, setSelectedService] = useState([]);

  const uniqBy = (arr, key) => Array.from(new Map(arr.map(x => [x[key], x])).values());

  const handleCheckboxChange = (serviceName, isChecked) => {
    const current = new Set(selectedService);

    if (isChecked) {
      if (!current.has(serviceName)) {
        current.add(serviceName);

        // Remove any existing rows for this category before adding fresh ones
        const servicesWithoutCategory = services.filter(s => s.category !== serviceName);

        const subItems = predefinedServices[serviceName] || [];
        const formatted = subItems.map(item => ({
          ...item,
          category: serviceName,
          amount: (item.quantity || 0) * (item.rate || 0),
        }));

        // Extra guard: avoid duplicates by description if data source overlaps
        const merged = uniqBy([...servicesWithoutCategory, ...formatted], "description");

        onChange(merged);
        setSelectedService(Array.from(current));

        if (onServiceSelect) onServiceSelect(serviceName);
      }
    } else {
      if (current.has(serviceName)) {
        current.delete(serviceName);
        const updatedServices = services.filter(s => s.category !== serviceName);
        onChange(updatedServices);
        setSelectedService(Array.from(current));
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...services];
    const val = field === "quantity" || field === "rate" ? Number(value) || 0 : value;
    updated[index][field] = val;
    updated[index].amount = (updated[index].quantity || 0) * (updated[index].rate || 0);
    onChange(updated);
  };

  const addItem = () => {
    onChange([
      ...services,
      { description: "", quantity: 1, rate: 0, amount: 0, category: "Custom" },
    ]);
    if (!selectedService.includes("Custom")) {
      setSelectedService([...selectedService, "Custom"]);
    }
  };

  const removeItem = (index) => {
    const updated = services.filter((_, i) => i !== index);
    onChange(updated);
    // Optional: if all items of a category were removed manually, clean selectedService
    const remainingCategories = new Set(updated.map(s => s.category).filter(Boolean));
    setSelectedService(prev => prev.filter(cat => remainingCategories.has(cat)));
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
      <h5 className="fw-bold text-secondary mb-3">💼 Services & Pricing</h5>

      {/* Service selector */}
      <div className="mb-4">
        <div
          className="border rounded p-3"
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            background: "#f9f9f9",
          }}
        >
          <div className="row">
            {Object.keys(predefinedServices).map((service) => (
              <div key={service} className="col-sm-6 mb-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`service-${service}`}
                    checked={selectedService.includes(service)}
                    onChange={(e) =>
                      handleCheckboxChange(service, e.target.checked)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`service-${service}`}
                  >
                    {service}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items table */}
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
                {/* Optional: show category tag */}
                {item.category && (
                  <small className="text-muted">Category: {item.category}</small>
                )}
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
