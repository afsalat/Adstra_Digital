"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/Context/ModalContext";
import parse from "html-react-parser";
import RichTextEditor from "./RichTextEditor";

const SectionEditor = ({ section, onChange, onRemove }) => {
  const { showAlert, showConfirm } = useModal();
  const [history, setHistory] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  // Load local history
  useEffect(() => {
    const saved = localStorage.getItem("proposalSections");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Autofill intro content only for the intro section
  useEffect(() => {
    if (
      (section.title === "Proposal by ADSTRA DIGITAL" ||
        section.type === "introduction") &&
      !section.content
    ) {
      const defaultIntro = `We are pleased to present this quotation for your kind consideration. At Adstra Digital, we strive to deliver creative, high-quality solutions tailored to your brand’s unique needs. This proposal outlines our services and pricing for the planned activities, ensuring value, clarity, and impact.`;
      onChange({ ...section, content: defaultIntro });
    }
  }, [section.title, section.type]);

  // Persist local history
  useEffect(() => {
    localStorage.setItem("proposalSections", JSON.stringify(history));
  }, [history]);

  const handleCopy = () => {
    navigator.clipboard.writeText(section.content || "");
    showAlert("Copied", "Content copied to clipboard successfully.", "success");
  };

  const handleClearHistory = () => {
    showConfirm(
      "Clear History",
      "Are you sure you want to clear all saved proposal sections from history? This cannot be undone.",
      () => {
        setHistory([]);
        localStorage.removeItem("proposalSections");
        showAlert("Cleared", "History has been cleared.", "success");
      },
      "warning"
    );
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
    setEditData(history[idx]);
  };

  const saveEdit = () => {
    const updated = [...history];
    updated[editingIndex] = { ...history[editingIndex], ...editData };
    setHistory(updated);
    setEditingIndex(null);
    setEditData({});
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData({});
  };

  return (
    <div className="mb-4 border p-3 rounded shadow-sm bg-light">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="text-primary">
          🧩 {section.title || "New Section"} - Description
        </h5>
        <button className="btn btn-sm btn-outline-danger" onClick={onRemove}>
          🗑 Remove
        </button>
      </div>

      {/* Section Type */}
      <div className="mb-2">
        <label>Section Type</label>
        <select
          className="form-select"
          value={section.type || "textarea"}
          onChange={(e) => onChange({ ...section, type: e.target.value })}
        >
          <option value="input">Input Field</option>
          <option value="textarea">Multi-line Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="select">Dropdown</option>
          <option value="checkbox">Yes/No (Checkbox)</option>
          {/* Optional semantics */}
          <option value="introduction">Introduction</option>
          <option value="objective">Objective</option>
          <option value="approach">Approach</option>
          <option value="conclusion">Conclusion</option>
        </select>
      </div>

      {/* Title */}
      <div className="mb-2">
        <label>Title</label>
        <input
          type="text"
          className="form-control"
          value={section.title}
          placeholder="e.g. Scope of Work"
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      {/* Alignment */}
      <div className="mb-2">
        <label>Content Alignment</label>
        <select
          className="form-select"
          value={section.alignment || "left"}
          onChange={(e) => onChange({ ...section, alignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* Content Field */}
      <div className="mb-3">
        <label>Content</label>
        <div style={{ textAlign: section.alignment || "left" }}>
          {(() => {
            switch (section.type) {
              case "input":
                return (
                  <input
                    type="text"
                    className="form-control"
                    value={section.content}
                    onChange={(e) =>
                      onChange({ ...section, content: e.target.value })
                    }
                  />
                );
              case "textarea":
              case "introduction":
              case "objective":
              case "approach":
              case "conclusion":
                return (
                  <RichTextEditor
                    value={section.content}
                    onChange={(val) => onChange({ ...section, content: val })}
                    alignment={section.alignment}
                  />
                );
              case "number":
                return (
                  <input
                    type="number"
                    className="form-control"
                    value={section.content}
                    onChange={(e) =>
                      onChange({ ...section, content: e.target.value })
                    }
                  />
                );
              case "date":
                return (
                  <input
                    type="date"
                    className="form-control"
                    value={section.content}
                    onChange={(e) =>
                      onChange({ ...section, content: e.target.value })
                    }
                  />
                );
              case "select":
                return (
                  <select
                    className="form-select"
                    value={section.content}
                    onChange={(e) =>
                      onChange({ ...section, content: e.target.value })
                    }
                  >
                    <option value="">-- Select an option --</option>
                    <option value="Option A">Option A</option>
                    <option value="Option B">Option B</option>
                    <option value="Option C">Option C</option>
                  </select>
                );
              case "checkbox":
                return (
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={section.content === "true"}
                      onChange={(e) =>
                        onChange({
                          ...section,
                          content: e.target.checked.toString(),
                        })
                      }
                    />
                    <label className="form-check-label">Enable</label>
                  </div>
                );
              default:
                // Fallback so unknown types are still editable
                return (
                  <RichTextEditor
                    value={section.content || ""}
                    onChange={(val) =>
                      onChange({
                        ...section,
                        content: val,
                        type: "textarea",
                      })
                    }
                    alignment={section.alignment}
                  />
                );
            }
          })()}
        </div>
      </div>

      {/* Buttons */}
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-outline-dark" onClick={handleCopy}>
          📋 Copy
        </button>
      </div>

      {/* History Section with Edit */}
      {history.length > 0 && (
        <div className="bg-white p-3 border rounded">
          <div className="d-flex justify-content-between mb-2">
            <strong>📂 History</strong>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleClearHistory}
            >
              Clear
            </button>
          </div>
          <ul className="list-unstyled">
            {history.map((item, idx) => (
              <li key={idx} className="mb-3 border-bottom pb-2">
                {editingIndex === idx ? (
                  <>
                    <input
                      className="form-control mb-2"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                    />
                    {["textarea", "introduction", "objective", "approach", "conclusion"].includes(editData.type || "textarea") ? (
                      <RichTextEditor
                        value={editData.content}
                        onChange={(val) => setEditData({ ...editData, content: val })}
                        alignment={editData.alignment}
                      />
                    ) : (
                      <textarea
                        className="form-control mb-2"
                        rows={3}
                        value={editData.content}
                        onChange={(e) =>
                          setEditData({ ...editData, content: e.target.value })
                        }
                      />
                    )}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={saveEdit}
                      >
                        ✅ Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={cancelEdit}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{item.type?.toUpperCase?.() || "TEXT"}</strong> —{" "}
                    {item.title} <br />
                    <small>{item.time}</small>
                    <div style={{ textAlign: item.alignment || "left" }} className="mb-2">
                      {/<[a-z][\s\S]*>/i.test(item.content) ? (
                        <div className="html-content-preview">{parse(item.content)}</div>
                      ) : (
                        <p>{item.content}</p>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => startEdit(idx)}
                    >
                      ✏️ Edit
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
