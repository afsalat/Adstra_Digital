"use client";

import { useState, useEffect } from "react";

const SectionEditor = ({ section, onChange, onRemove }) => {
  const [history, setHistory] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("proposalSections");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (
      (section.title?.toLowerCase() === "introduction" ||
        section.type === "introduction") &&
      !section.content
    ) {
      const defaultIntro = `Welcome to the proposal. This section outlines the purpose and key highlights of the engagement. It sets the tone and expectation for the services being offered.`;

      onChange({ ...section, content: defaultIntro });
    }
  }, [section.title, section.type]);

  useEffect(() => {
    localStorage.setItem("proposalSections", JSON.stringify(history));
  }, [history]);

  const handleGenerate = () => {
    if (!section.title) return;

    const mockContent = `Generated mock content for "${section.title}" of type "${section.type}".`;
    onChange({ ...section, content: mockContent });
    setHistory((prev) => [
      ...prev,
      {
        ...section,
        content: mockContent,
        time: new Date().toLocaleString(),
      },
    ]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(section.content || "");
    alert("Copied to clipboard!");
  };

  const handleClearHistory = () => {
    if (confirm("Clear all saved sections?")) {
      setHistory([]);
      localStorage.removeItem("proposalSections");
    }
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
    setEditData(history[idx]);
  };

  const saveEdit = () => {
    const updated = [...history];
    updated[editingIndex] = { ...editData };
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
        <h5 className="text-primary">🧩 Section</h5>
        <button className="btn btn-sm btn-outline-danger" onClick={onRemove}>
          🗑 Remove
        </button>
      </div>

      {/* Section Type */}
      <div className="mb-2">
        <label>Section Type</label>
        <select
          className="form-select"
          value={section.type}
          onChange={(e) => onChange({ ...section, type: e.target.value })}
        >
          <option value="input">Input Field</option>
          <option value="textarea">Multi-line Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="select">Dropdown</option>
          <option value="checkbox">Yes/No (Checkbox)</option>
        </select>
      </div>

      {/* Title */}
      <div className="mb-2">
        <label>Title</label>
        <input
          type="text"
          className="form-control"
          value={section.title}
          placeholder="e.g. Social Media Marketing"
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
                  <textarea
                    rows={5}
                    className="form-control"
                    style={{ textAlign: section.alignment || "left" }}
                    value={section.content}
                    onChange={(e) =>
                      onChange({ ...section, content: e.target.value })
                    }
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
                return null;
            }
          })()}
        </div>
      </div>

      {/* Buttons */}
      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-secondary"
          onClick={handleGenerate}
          disabled={!section.title}
        >
          ⚙️ Generate
        </button>
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
                    <textarea
                      className="form-control mb-2"
                      rows={3}
                      value={editData.content}
                      onChange={(e) =>
                        setEditData({ ...editData, content: e.target.value })
                      }
                    />
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
                    <strong>{item.type.toUpperCase()}</strong> — {item.title}{" "}
                    <br />
                    <small>{item.time}</small>
                    <p style={{ textAlign: item.alignment || "left" }}>
                      {item.content}
                    </p>
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
