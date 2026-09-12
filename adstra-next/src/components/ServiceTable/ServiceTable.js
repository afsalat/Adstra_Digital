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
    () => services.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
    [services]
  );
  const gst = useMemo(() => subtotal * 0.18, [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  useEffect(() => {
    if (lastInputRef.current) lastInputRef.current.focus();
  }, [services.length]);

  // When services are cleared externally (e.g. New Proposal reset), untick all checkboxes
  useEffect(() => {
    if (services.length === 0) {
      setSelectedService([]);
    }
  }, [services.length]);

  return (
    <div className="mb-4">
      <h5 className="fw-bold text-secondary mb-3" style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        Services &amp; Pricing
      </h5>

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
              <div key={service} className="col-12 mb-2">
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

      {/* Items List */}
      <div className="mb-3">
        {services.map((item, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded bg-light position-relative shadow-sm">
            <button
              className="btn btn-sm btn-outline-danger position-absolute"
              style={{ top: "8px", right: "8px", padding: "2px 6px" }}
              onClick={() => removeItem(idx)}
              title="Remove Item"
            >
              ❌
            </button>
            <div className="mb-2" style={{ paddingRight: "35px" }}>
              <input
                className="form-control form-control-sm"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(idx, "description", e.target.value)
                }
                ref={idx === services.length - 1 ? lastInputRef : null}
              />
              {item.category && (
                <small className="text-muted d-block mt-1" style={{ fontSize: "11px" }}>Category: {item.category}</small>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: "65px" }}>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={item.quantity}
                  min={1}
                  title="Qty"
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => { if (e.target.value === "") handleItemChange(idx, "quantity", 1); }}
                  onChange={(e) =>
                    handleItemChange(idx, "quantity", e.target.value)
                  }
                />
              </div>
              <span className="text-muted small">x</span>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={item.rate}
                  min={0}
                  title="Rate"
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => { if (e.target.value === "") handleItemChange(idx, "rate", 0); }}
                  onChange={(e) =>
                    handleItemChange(idx, "rate", e.target.value)
                  }
                />
              </div>
              <div className="text-end" style={{ minWidth: "75px" }}>
                <strong style={{ fontSize: "13px" }}>₹{parseFloat(item.amount || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && <div className="text-center p-3 text-muted border rounded">No services added yet</div>}
      </div>

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
