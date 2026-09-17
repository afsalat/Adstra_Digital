"use client";

import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import { Sparkles, X, Copy, Check, Wand2, Clock, Globe2, Layers } from "lucide-react";

export default function AIAssistantModal({ isOpen, onClose, onApplyContent }) {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("both"); // 'en', 'ml', 'both'
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a campaign topic or content prompt.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/social/ai/`, {
        prompt,
        tone,
        language,
        platform,
      });
      setResult(res.data);
    } catch (err) {
      alert("Failed to generate AI content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "caption") {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
  };

  return (
    <div className="social-modal-overlay">
      <div className="social-modal-content" style={{ maxWidth: 760 }}>
        <div className="social-modal-header" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#ffffff", borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={24} />
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.15rem" }}>
                AI Social Content Studio
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.9 }}>
                Bilingual Malayalam & English captions, viral hooks & hashtag generation
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div className="social-modal-body">
          {/* Prompt input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
              What is your post or campaign about? *
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Announcing our new enterprise cloud transformation package for healthcare businesses in Kerala..."
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none", resize: "none" }}
            />
          </div>

          {/* Controls Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            {/* Tone */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
                Tone & Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#fff", fontWeight: 600 }}
              >
                <option value="Professional">Professional / Corporate</option>
                <option value="Punchy/Viral">Punchy / Viral Hook</option>
                <option value="Festive">Festive Celebration (Onam/Eid/Diwali)</option>
                <option value="Storytelling">Storytelling & Founder Journey</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#fff", fontWeight: 600 }}
              >
                <option value="both">Bilingual (English + Malayalam)</option>
                <option value="ml">Malayalam Only (മലയാളം)</option>
                <option value="en">English Only</option>
              </select>
            </div>

            {/* Platform */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#fff", fontWeight: 600 }}
              >
                <option value="instagram">Instagram Feed / Carousel</option>
                <option value="linkedin">LinkedIn Professional</option>
                <option value="facebook">Facebook Page</option>
                <option value="youtube">YouTube Short / Community</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)" }}
          >
            <Wand2 size={18} /> {loading ? "Generating Intelligent Content..." : "Generate Captions & Hashtags"}
          </button>

          {/* Results Area */}
          {result && (
            <div style={{ marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
              
              {/* Caption */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>Generated Caption</span>
                  <button
                    onClick={() => copyToClipboard(result.caption, "caption")}
                    style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {copiedCaption ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copiedCaption ? "Copied" : "Copy"}
                  </button>
                </div>
                <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 180, overflowY: "auto" }}>
                  {result.caption}
                </div>
              </div>

              {/* Hashtags */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>Hashtags</span>
                  <button
                    onClick={() => copyToClipboard(result.hashtags, "hashtags")}
                    style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {copiedHashtags ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copiedHashtags ? "Copied" : "Copy"}
                  </button>
                </div>
                <div style={{ background: "#eff6ff", padding: 10, borderRadius: 8, border: "1px solid #bfdbfe", fontSize: "0.85rem", color: "#1d4ed8", fontWeight: 600 }}>
                  {result.hashtags}
                </div>
              </div>

              {/* Best Posting Times */}
              {result.best_posting_times && (
                <div style={{ background: "#faf5ff", border: "1px solid #f3e8ff", borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 700, color: "#7e22ce", marginBottom: 8 }}>
                    <Clock size={16} /> Recommended Posting Windows
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    {result.best_posting_times.slice(0, 2).map((t, idx) => (
                      <div key={idx} style={{ background: "#ffffff", padding: "6px 10px", borderRadius: 8, fontSize: "0.78rem", border: "1px solid #e9d5ff" }}>
                        <strong style={{ color: "#581c87" }}>{t.day} @ {t.time}</strong>: {t.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action: Apply to post */}
              {onApplyContent && (
                <button
                  onClick={() => {
                    onApplyContent({
                      caption: result.caption,
                      hashtags: result.hashtags,
                    });
                    onClose();
                  }}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#10b981", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Apply Directly to Post Creator
                </button>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
