"use client";
import { useState, useEffect } from "react";

// Initial Data
const defaultServiceExtraDetails = {
  "Digital Marketing": `
Our digital marketing services include SEO, SEM, and SMM focused on lead generation.
You'll receive monthly reports and full strategy support.
`,
  "Social Media Marketing": `
Complete content strategy, post scheduling, and analytics for Instagram & Facebook.
Includes visuals, captions, and paid campaign optimization.
`,
  "ERP Development": `
Tailored modules for HR, Finance, and Inventory with complete user training.
`,
};

export default function ExtraDetailsEditor() {
  const [extraDetails, setExtraDetails] = useState({});
  const [selectedService, setSelectedService] = useState("");

  // Load from localStorage or use default
  useEffect(() => {
    const saved = localStorage.getItem("serviceExtraDetails");
    if (saved) {
      setExtraDetails(JSON.parse(saved));
    } else {
      setExtraDetails(defaultServiceExtraDetails);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("serviceExtraDetails", JSON.stringify(extraDetails));
  }, [extraDetails]);

  const handleSelectChange = (e) => {
    setSelectedService(e.target.value);
  };

  const handleDetailChange = (e) => {
    const updated = {
      ...extraDetails,
      [selectedService]: e.target.value,
    };
    setExtraDetails(updated);
  };

  const handleClear = () => {
    if (confirm("Reset to default?")) {
      setExtraDetails(defaultServiceExtraDetails);
      localStorage.removeItem("serviceExtraDetails");
    }
  };

  return (
    <div className="border p-4 rounded shadow-sm bg-white">
      <h4 className="mb-3 text-primary">📝 Service Extra Details Editor</h4>

      <select
        className="form-select mb-3"
        value={selectedService}
        onChange={handleSelectChange}
      >
        <option value="">-- Select a Service --</option>
        {Object.keys(extraDetails).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      {selectedService && (
        <>
          <textarea
            className="form-control mb-3"
            rows={6}
            value={extraDetails[selectedService] || ""}
            onChange={handleDetailChange}
          />
        </>
      )}

      <button className="btn btn-outline-danger mt-2" onClick={handleClear}>
        🔄 Reset All to Default
      </button>
    </div>
  );
}
