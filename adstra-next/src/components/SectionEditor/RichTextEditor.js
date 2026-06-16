import React, { useRef, useEffect, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link, Code, Image as ImageIcon,
  Type, Highlighter
} from "lucide-react";

function convertPlaintextToHtml(text) {
  if (!text) return "<p><br></p>";

  const lines = text.split("\n").map((line) => line.trim());
  let html = "";
  let inList = false;

  const flushList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  lines.forEach((line) => {
    if (line === "") {
      flushList();
      html += "<p><br></p>";
      return;
    }

    // Check if line is a bullet item
    const bulletMatch = line.match(/^[-*]\s*(.*)/);
    if (bulletMatch) {
      if (!inList) {
        html += '<ul style="padding-left: 18px; margin: 4px 0 8px 0; list-style-type: disc;">';
        inList = true;
      }
      let content = bulletMatch[1].trim();
      // Replace bold tags inside line
      content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      html += `<li style="margin-bottom: 4px; font-size: 11px; line-height: 1.4;">${content}</li>`;
    } else {
      flushList();
      // Replace bold tags inside paragraph line
      const content = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      html += `<p style="margin: 6px 0; font-size: 11.5px; line-height: 1.4; color: #222;">${content}</p>`;
    }
  });

  flushList();
  return html;
}

export default function RichTextEditor({ value, onChange, alignment }) {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState("16");

  // Load initial content or handle external value changes
  useEffect(() => {
    if (editorRef.current) {
      let contentToShow = value || "";
      const isPlaintext = contentToShow && !/<[a-z][\s\S]*>/i.test(contentToShow);
      if (isPlaintext) {
        contentToShow = convertPlaintextToHtml(contentToShow);
      }

      if (editorRef.current.innerHTML !== contentToShow) {
        editorRef.current.innerHTML = contentToShow || "<p><br></p>";
      }

      if (isPlaintext) {
        onChange(contentToShow);
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    document.execCommand("fontSize", false, "7");
    const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
    fontElements.forEach((font) => {
      font.removeAttribute("size");
      font.style.fontSize = `${size}px`;
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;
      span.innerHTML = font.innerHTML;
      font.parentNode.replaceChild(span, font);
    });
    handleInput();
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleImage = () => {
    const url = window.prompt("Enter Image URL:");
    if (url) {
      executeCommand("insertImage", url);
    }
  };

  const handleCodeBlock = () => {
    executeCommand("formatBlock", "PRE");
  };

  const handleHeading = (hTag) => {
    executeCommand("formatBlock", hTag);
  };

  const handleForeColor = (color) => {
    executeCommand("foreColor", color);
  };

  const handleBackColor = (color) => {
    document.execCommand("hiliteColor", false, color);
    document.execCommand("backColor", false, color);
    handleInput();
  };

  return (
    <div className="rte-container d-flex flex-column mb-2" style={{ textAlign: "left" }}>
      <style>{`
        .rte-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 6px 12px;
          user-select: none;
        }
        .rte-divider {
          width: 1px;
          height: 20px;
          background-color: #cbd5e1;
          margin: 0 4px;
        }
        .rte-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          position: relative;
        }
        .rte-btn:hover {
          background-color: #e2e8f0;
          color: #0f172a;
        }
        .rte-btn:active {
          transform: scale(0.95);
        }
        .rte-btn-label {
          font-weight: bold;
          font-size: 13px;
        }
        .rte-select {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 2px 24px 2px 8px;
          font-size: 13px;
          color: #334155;
          background-color: white;
          outline: none;
          cursor: pointer;
          height: 32px;
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'></polyline></svg>");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 12px;
          min-width: 60px;
        }
        .rte-editor-area {
          border: 1px solid #cbd5e1;
          border-top: none;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 14px;
          min-height: 200px;
          max-height: 500px;
          background-color: white;
          outline: none;
          overflow-y: auto;
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
        }
        .rte-editor-area:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .rte-editor-area p {
          margin-bottom: 0.5rem;
        }
        .rte-color-picker-wrapper {
          display: inline-flex;
          position: relative;
        }
        .rte-color-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>

      {/* Toolbar */}
      <div className="rte-toolbar">
        {/* Colors Group */}
        <div className="rte-color-picker-wrapper" title="Text Color">
          <button type="button" className="rte-btn">
            <Type size={16} />
            <input
              type="color"
              className="rte-color-input"
              onChange={(e) => handleForeColor(e.target.value)}
            />
          </button>
        </div>
        <div className="rte-color-picker-wrapper" title="Highlight Color">
          <button type="button" className="rte-btn">
            <Highlighter size={16} />
            <input
              type="color"
              className="rte-color-input"
              onChange={(e) => handleBackColor(e.target.value)}
            />
          </button>
        </div>

        <div className="rte-divider" />

        {/* Text style Group */}
        <button type="button" className="rte-btn" onClick={() => executeCommand("bold")} title="Bold">
          <Bold size={16} />
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("italic")} title="Italic">
          <Italic size={16} />
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("underline")} title="Underline">
          <Underline size={16} />
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("strikeThrough")} title="Strikethrough">
          <Strikethrough size={16} />
        </button>

        <div className="rte-divider" />

        {/* Font size Group */}
        <select
          className="rte-select"
          value={fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          title="Font Size"
        >
          {[10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 32, 48].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="rte-divider" />

        {/* Alignment Group */}
        <button type="button" className="rte-btn" onClick={() => executeCommand("justifyLeft")} title="Align Left">
          <AlignLeft size={16} />
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("justifyCenter")} title="Align Center">
          <AlignCenter size={16} />
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("justifyRight")} title="Align Right">
          <AlignRight size={16} />
        </button>

        <div className="rte-divider" />

        {/* Headings Group */}
        <button type="button" className="rte-btn rte-btn-label" onClick={() => handleHeading("H1")} title="Heading 1">H1</button>
        <button type="button" className="rte-btn rte-btn-label" onClick={() => handleHeading("H2")} title="Heading 2">H2</button>
        <button type="button" className="rte-btn rte-btn-label" onClick={() => handleHeading("H3")} title="Heading 3">H3</button>
        <button type="button" className="rte-btn rte-btn-label" onClick={() => handleHeading("H4")} title="Heading 4">H4</button>
        <button type="button" className="rte-btn rte-btn-label" onClick={() => handleHeading("H5")} title="Heading 5">H5</button>
        <button type="button" className="rte-btn rte-btn-label" onClick={() => handleHeading("P")} title="Paragraph">P</button>

        <div className="rte-divider" />

        {/* Lists Group */}
        <button type="button" className="rte-btn" onClick={() => executeCommand("insertOrderedList")} title="Numbered List">
          <ListOrdered size={16} />
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("insertUnorderedList")} title="Bulleted List">
          <List size={16} />
        </button>

        <div className="rte-divider" />

        {/* Insert Group */}
        <button type="button" className="rte-btn" onClick={handleLink} title="Insert Link">
          <Link size={16} />
        </button>
        <button type="button" className="rte-btn" onClick={handleCodeBlock} title="Code Block">
          <Code size={16} />
        </button>
        <button type="button" className="rte-btn" onClick={handleImage} title="Insert Image">
          <ImageIcon size={16} />
        </button>
      </div>

      {/* Content Area */}
      <div
        ref={editorRef}
        className="rte-editor-area"
        contentEditable
        onInput={handleInput}
        style={{ textAlign: alignment || "left" }}
      />
    </div>
  );
}
