"use client";

import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  Folder,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  X,
  Share2,
} from "lucide-react";

export default function MediaLibraryTab({
  mediaAssets = [],
  clients = [],
  onRefresh,
  onOpenCreateWithAsset,
}) {
  const [activeFolder, setActiveFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [previewAsset, setPreviewAsset] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadClientId, setUploadClientId] = useState(clients[0]?.id || 1);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetType, setAssetType] = useState("image");
  const [folderName, setFolderName] = useState("Creatives");
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Extract unique folders
  const folders = ["Brand Assets", "Creatives", "Reels", "Logos"];

  const filteredAssets = mediaAssets.filter((a) => {
    if (activeFolder !== "all" && a.folder !== activeFolder) return false;
    if (selectedType !== "all" && a.asset_type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title?.toLowerCase().includes(q) || (a.tags || []).some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!assetTitle.trim() || !fileUrl.trim()) {
      alert("Please provide an asset title and URL.");
      return;
    }

    setUploading(true);
    try {
      await axios.post(`${API_BASE_URL}/social/media/`, {
        client_profile: uploadClientId,
        title: assetTitle,
        asset_type: assetType,
        folder: folderName,
        file_url: fileUrl,
        file_size_bytes: 1250000,
        file_format: assetType === "reel" || assetType === "video" ? "MP4" : "JPG",
        approval_status: "approved",
      });
      setUploadModal(false);
      setAssetTitle("");
      setFileUrl("");
      onRefresh();
    } catch (err) {
      alert("Error adding asset to library.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Top Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
            Brand Assets & Creative Media Library
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Organized folder assets, reels, logos, and high-res brand creatives.
          </p>
        </div>

        <button
          onClick={() => setUploadModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            padding: "9px 18px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
          }}
        >
          <Upload size={16} /> Upload Brand Media
        </button>
      </div>

      {/* Filter and Folder Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "12px 18px", borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        {/* Folders */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveFolder("all")}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              background: activeFolder === "all" ? "#0f172a" : "#f1f5f9",
              color: activeFolder === "all" ? "#ffffff" : "#475569",
            }}
          >
            All Folders ({mediaAssets.length})
          </button>
          {folders.map((f) => {
            const count = mediaAssets.filter((a) => a.folder === f).length;
            return (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: activeFolder === f ? "#4f46e5" : "#f8fafc",
                  color: activeFolder === f ? "#ffffff" : "#475569",
                }}
              >
                <Folder size={14} /> {f} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Type filter */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.82rem" }}
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", background: "#fff" }}
          >
            <option value="all">All Formats</option>
            <option value="image">Images</option>
            <option value="reel">Reels / Shorts</option>
            <option value="video">Videos</option>
            <option value="logo">Logos</option>
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            style={{
              background: "#ffffff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Visual Header */}
            <div
              onClick={() => setPreviewAsset(asset)}
              style={{
                height: 150,
                background: "#0f172a",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {asset.file_url ? (
                <img
                  src={asset.file_url}
                  alt={asset.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <ImageIcon size={32} color="#94a3b8" />
              )}
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  background: "rgba(15, 23, 42, 0.75)",
                  color: "#fff",
                  fontSize: "0.68rem",
                  padding: "2px 6px",
                  borderRadius: 6,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {asset.asset_type}
              </span>
            </div>

            {/* Content Details */}
            <div style={{ padding: 14, display: "flex", flexDirection: "column", flex: 1 }}>
              <h5 style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {asset.title}
              </h5>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 8 }}>
                {asset.client_name} • {asset.folder}
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                {(asset.tags || []).slice(0, 3).map((t, i) => (
                  <span key={i} style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.68rem", padding: "2px 6px", borderRadius: 4 }}>
                    #{t}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                <button
                  onClick={() => onOpenCreateWithAsset(asset.file_url)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: 6,
                    background: "#eef2ff",
                    color: "#4f46e5",
                    border: "1px solid #c7d2fe",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Share2 size={13} /> Use in Post
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Lightbox / Preview Modal */}
      {previewAsset && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 640 }}>
            <div className="social-modal-header">
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>{previewAsset.title}</h4>
              <button onClick={() => setPreviewAsset(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div className="social-modal-body" style={{ textAlign: "center", padding: 16 }}>
              <img
                src={previewAsset.file_url}
                alt={previewAsset.title}
                style={{ maxWidth: "100%", maxHeight: 420, borderRadius: 12, objectFit: "contain" }}
              />
              <div style={{ marginTop: 14, textAlign: "left", fontSize: "0.85rem", color: "#64748b" }}>
                <p><strong>Folder:</strong> {previewAsset.folder} | <strong>Client:</strong> {previewAsset.client_name}</p>
                <p><strong>Format:</strong> {previewAsset.file_format || "JPG"} | <strong>Approval:</strong> {previewAsset.approval_status}</p>
              </div>
            </div>
            <div className="social-modal-footer">
              <button
                onClick={() => {
                  onOpenCreateWithAsset(previewAsset.file_url);
                  setPreviewAsset(null);
                }}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                Create Post with this Media
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {uploadModal && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 500 }}>
            <div className="social-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Add Asset to Brand Library</h3>
              <button onClick={() => setUploadModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAsset}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Client Profile
                  </label>
                  <select
                    value={uploadClientId}
                    onChange={(e) => setUploadClientId(e.target.value)}
                    style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Asset Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={assetTitle}
                    onChange={(e) => setAssetTitle(e.target.value)}
                    placeholder="e.g. Vorion AI Architecture Diagram"
                    style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Asset Type
                    </label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    >
                      <option value="image">Image</option>
                      <option value="carousel">Carousel Slide</option>
                      <option value="reel">Reel / Short</option>
                      <option value="video">Video</option>
                      <option value="logo">Brand Logo</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Folder
                    </label>
                    <select
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    >
                      <option value="Brand Assets">Brand Assets</option>
                      <option value="Creatives">Creatives</option>
                      <option value="Reels">Reels</option>
                      <option value="Logos">Logos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Media URL (High-res Image / Video Link) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div className="social-modal-footer">
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
