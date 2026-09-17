"use client";

import React, { useState, useMemo, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  FolderArchive,
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
  Building2,
  Filter,
  Sparkles,
  Boxes,
  Download,
  Copy,
  Check,
  ExternalLink,
  LayoutGrid,
  List,
  RefreshCw,
  Play,
  FileUp,
  Tag,
  AlertCircle,
  Pencil,
} from "lucide-react";

export default function MediaLibraryTab({
  mediaAssets = [],
  clients = [],
  selectedClientId = "all",
  onRefresh,
  onOpenCreateWithAsset,
}) {
  // Filters & view
  const [activeFolder, setActiveFolder] = useState("all");
  const [selectedClientFilter, setSelectedClientFilter] = useState(selectedClientId || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Modals
  const [previewAsset, setPreviewAsset] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Edit Form State
  const [editModal, setEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editFolder, setEditFolder] = useState("Brand Assets");
  const [editIsCustomFolder, setEditIsCustomFolder] = useState(false);
  const [editCustomFolder, setEditCustomFolder] = useState("");
  const [editAssetType, setEditAssetType] = useState("image");
  const [editTags, setEditTags] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Upload Form State
  const [uploadMode, setUploadMode] = useState("file"); // 'file' | 'url'
  const [uploadClientId, setUploadClientId] = useState(
    selectedClientId !== "all" ? selectedClientId : (clients[0]?.id || "")
  );
  const [assetTitle, setAssetTitle] = useState("");
  const [assetType, setAssetType] = useState("image");
  const [folderName, setFolderName] = useState("Brand Assets");
  const [isCustomFolder, setIsCustomFolder] = useState(false);
  const [customFolderName, setCustomFolderName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  // Preset folders
  const PRESET_FOLDERS = [
    "Brand Assets",
    "Logos",
    "Creatives",
    "Reels & Shorts",
    "Product Shoots",
    "Ad Banners",
    "Documents & Guidelines",
  ];

  // Dynamic list of unique folders
  const allFolders = useMemo(() => {
    const fromAssets = (mediaAssets || []).map((a) => a.folder).filter(Boolean);
    const combined = Array.from(new Set([...PRESET_FOLDERS, ...fromAssets]));
    return combined;
  }, [mediaAssets]);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return (mediaAssets || []).filter((a) => {
      // Client filter
      const effClientFilter = selectedClientFilter !== "all" ? selectedClientFilter : (selectedClientId !== "all" ? selectedClientId : "all");
      if (effClientFilter !== "all" && String(a.client_profile) !== String(effClientFilter)) {
        return false;
      }
      // Folder filter
      if (activeFolder !== "all" && a.folder !== activeFolder) return false;
      // Type filter
      if (selectedType !== "all") {
        if (selectedType === "video_all") {
          if (a.asset_type !== "video" && a.asset_type !== "reel") return false;
        } else if (a.asset_type !== selectedType) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (a.title || "").toLowerCase().includes(q);
        const matchesClient = (a.client_name || "").toLowerCase().includes(q);
        const matchesFolder = (a.folder || "").toLowerCase().includes(q);
        const matchesTags = (a.tags || []).some((t) => String(t).toLowerCase().includes(q));
        if (!matchesTitle && !matchesClient && !matchesFolder && !matchesTags) return false;
      }
      return true;
    });
  }, [mediaAssets, selectedClientFilter, selectedClientId, activeFolder, selectedType, searchQuery]);

  // Summary counts
  const stats = useMemo(() => {
    const total = (mediaAssets || []).length;
    const images = (mediaAssets || []).filter((a) => a.asset_type === "image" || a.asset_type === "carousel").length;
    const videos = (mediaAssets || []).filter((a) => a.asset_type === "video" || a.asset_type === "reel").length;
    const logos = (mediaAssets || []).filter((a) => a.asset_type === "logo").length;
    const docs = (mediaAssets || []).filter((a) => a.asset_type === "document").length;
    return { total, images, videos, logos, docs };
  }, [mediaAssets]);

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError("");

    // Auto-detect asset type & format
    const mime = file.type || "";
    const ext = file.name.split(".").pop()?.toUpperCase() || "";

    if (mime.startsWith("video/")) {
      setAssetType(file.size > 20000000 ? "video" : "reel");
    } else if (mime.startsWith("image/")) {
      if (ext === "SVG" || file.name.toLowerCase().includes("logo")) {
        setAssetType("logo");
      } else {
        setAssetType("image");
      }
    } else if (mime.includes("pdf") || mime.includes("document") || ext === "PDF") {
      setAssetType("document");
    }

    if (!assetTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setAssetTitle(cleanName);
    }

    // Preview
    if (mime.startsWith("image/") || mime.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFilePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview("");
    }
  };

  // Helper to format bytes
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Helper to get asset URL
  const getAssetUrl = (asset) => {
    if (!asset) return "";
    let url = asset.file_url || asset.file || "";
    if (url.startsWith("/media/")) {
      url = API_BASE_URL.replace("/api", "") + url;
    }
    return url;
  };

  // Copy link to clipboard
  const handleCopyLink = async (asset, e) => {
    e?.stopPropagation();
    const url = getAssetUrl(asset);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  // Delete asset
  const handleDeleteAsset = async (assetId, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this asset from the library?")) {
      return;
    }

    setDeletingId(assetId);
    try {
      await axios.delete(`${API_BASE_URL}/social/media/${assetId}/`);
      if (previewAsset?.id === assetId) {
        setPreviewAsset(null);
      }
      onRefresh?.();
    } catch (err) {
      alert("Failed to delete asset: " + (err.response?.data?.detail || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // Download asset file
  const handleDownloadAsset = async (asset, e) => {
    e?.stopPropagation();
    const url = getAssetUrl(asset);
    if (!url) return;

    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = asset.file_format ? `.${asset.file_format.toLowerCase()}` : "";
      const safeTitle = (asset.title || "asset").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `${safeTitle}${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement("a");
      a.href = url;
      a.download = asset.title || "asset";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  // Open edit modal for an asset
  const handleOpenEdit = (asset, e) => {
    e?.stopPropagation();
    setEditingAsset(asset);
    setEditTitle(asset.title || "");
    setEditClientId(asset.client_profile || (clients[0]?.id || ""));
    setEditFolder(asset.folder || "Brand Assets");
    setEditIsCustomFolder(false);
    setEditCustomFolder("");
    setEditAssetType(asset.asset_type || "image");
    setEditTags(Array.isArray(asset.tags) ? asset.tags.join(", ") : "");
    setEditError("");
    setEditModal(true);
  };

  // Save edited asset
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAsset) return;
    setEditError("");

    if (!editTitle.trim()) {
      setEditError("Please provide an asset title.");
      return;
    }

    const finalFolder = editIsCustomFolder ? (editCustomFolder.trim() || "General") : editFolder;
    const parsedTags = editTags
      ? editTags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean)
      : [];

    setSavingEdit(true);
    try {
      const payload = {
        client_profile: editClientId,
        title: editTitle.trim(),
        asset_type: editAssetType,
        folder: finalFolder,
        tags: parsedTags,
      };

      const res = await axios.patch(`${API_BASE_URL}/social/media/${editingAsset.id}/`, payload);
      
      // Update preview if currently viewing this asset
      if (previewAsset?.id === editingAsset.id) {
        setPreviewAsset((prev) => ({ ...prev, ...res.data }));
      }

      setEditModal(false);
      setEditingAsset(null);
      onRefresh?.();
    } catch (err) {
      const errData = err.response?.data;
      let errMsg = "Failed to update asset details.";
      if (typeof errData === "string") {
        errMsg = errData;
      } else if (errData && typeof errData === "object") {
        const errorList = [];
        for (const [key, val] of Object.entries(errData)) {
          const valText = Array.isArray(val) ? val.join(" ") : String(val);
          errorList.push(key !== "detail" && key !== "non_field_errors" ? `${key}: ${valText}` : valText);
        }
        if (errorList.length > 0) errMsg = errorList.join(" | ");
      } else if (err.message) {
        errMsg = err.message;
      }
      setEditError(errMsg);
    } finally {
      setSavingEdit(false);
    }
  };

  // Save new asset
  const handleSubmitAsset = async (e) => {
    e.preventDefault();
    setUploadError("");

    if (!assetTitle.trim()) {
      setUploadError("Please provide an asset title.");
      return;
    }

    if (uploadMode === "file" && !selectedFile) {
      setUploadError("Please select a file to upload from your device.");
      return;
    }

    if (uploadMode === "url" && !fileUrl.trim()) {
      setUploadError("Please enter a valid media URL.");
      return;
    }

    const finalFolder = isCustomFolder ? (customFolderName.trim() || "General") : folderName;
    const parsedTags = tagsInput
      ? tagsInput.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean)
      : [];

    setUploading(true);

    try {
      if (uploadMode === "file" && selectedFile) {
        // Truncate overly long filenames (>70 chars) to prevent server/storage path overflow
        let safeFileName = selectedFile.name;
        if (safeFileName.length > 70) {
          const lastDot = safeFileName.lastIndexOf(".");
          const ext = lastDot !== -1 ? safeFileName.substring(lastDot) : "";
          const nameOnly = lastDot !== -1 ? safeFileName.substring(0, lastDot) : safeFileName;
          safeFileName = `${nameOnly.substring(0, 50)}_${Date.now().toString().slice(-4)}${ext}`;
        }

        const formData = new FormData();
        formData.append("client_profile", uploadClientId);
        formData.append("title", assetTitle.trim());
        formData.append("asset_type", assetType);
        formData.append("folder", finalFolder);
        formData.append("file", selectedFile, safeFileName);
        formData.append("file_size_bytes", selectedFile.size);
        formData.append("file_format", selectedFile.name.split(".").pop()?.toUpperCase() || "JPG");
        formData.append("approval_status", "approved");
        formData.append("tags", JSON.stringify(parsedTags));

        await axios.post(`${API_BASE_URL}/social/media/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_BASE_URL}/social/media/`, {
          client_profile: uploadClientId,
          title: assetTitle.trim(),
          asset_type: assetType,
          folder: finalFolder,
          file_url: fileUrl.trim(),
          file_size_bytes: 1250000,
          file_format: assetType === "video" || assetType === "reel" ? "MP4" : "PNG",
          approval_status: "approved",
          tags: parsedTags,
        });
      }

      // Reset
      setUploadModal(false);
      setAssetTitle("");
      setFileUrl("");
      setSelectedFile(null);
      setFilePreview("");
      setTagsInput("");
      setIsCustomFolder(false);
      setCustomFolderName("");
      onRefresh?.();
    } catch (err) {
      const errData = err.response?.data;
      let errMsg = "Error saving asset to client library.";
      if (typeof errData === "string") {
        errMsg = errData;
      } else if (errData && typeof errData === "object") {
        const errorList = [];
        for (const [key, val] of Object.entries(errData)) {
          const valText = Array.isArray(val) ? val.join(" ") : String(val);
          errorList.push(key !== "detail" && key !== "non_field_errors" ? `${key}: ${valText}` : valText);
        }
        if (errorList.length > 0) errMsg = errorList.join(" | ");
      } else if (err.message) {
        errMsg = err.message;
      }
      setUploadError(errMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* 1. Header & Overview Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderArchive size={22} color="#4f46e5" />
            </div>
            <h3 style={{ margin: 0, fontSize: "1.28rem", fontWeight: 800, color: "#0f172a" }}>
              Client Assets & Media Storage
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b" }}>
            Centralized cloud repository for client logos, high-res creatives, reel video footage, and brand guidelines
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => onRefresh?.()}
            title="Refresh assets"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#475569",
              padding: "9px 14px",
              borderRadius: 10,
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          <button
            onClick={() => {
              setUploadError("");
              const effClientId =
                selectedClientFilter !== "all"
                  ? selectedClientFilter
                  : selectedClientId !== "all"
                  ? selectedClientId
                  : clients[0]?.id || "";
              if (effClientId) setUploadClientId(effClientId);
              setUploadModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#4f46e5",
              color: "#ffffff",
              border: "none",
              padding: "9px 20px",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            <Upload size={16} /> Upload Client Asset
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Boxes size={18} color="#4f46e5" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Assets</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>{stats.total}</div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon size={18} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Images & Graphics</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>{stats.images}</div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Video size={18} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Reels & Videos</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>{stats.videos}</div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color="#ec4899" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Brand Logos</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>{stats.logos}</div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={18} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Documents & PDFs</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>{stats.docs}</div>
          </div>
        </div>
      </div>

      {/* 3. Filter, Folder Tabs & Search Bar */}
      <div
        style={{
          background: "#ffffff",
          padding: 16,
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
        }}
      >
        {/* Row 1: Client Filter & Search & Format */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Client Picker */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "5px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
              <Building2 size={15} color="#64748b" />
              <select
                value={selectedClientFilter}
                onChange={(e) => setSelectedClientFilter(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", cursor: "pointer" }}
              >
                <option value="all">All Clients & Brands</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Format Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "5px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
              <Filter size={15} color="#64748b" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.82rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}
              >
                <option value="all">All Formats</option>
                <option value="image">Images & Graphics</option>
                <option value="reel">Reels / Shorts</option>
                <option value="video">Long Videos</option>
                <option value="logo">Brand Logos</option>
                <option value="document">Documents & PDFs</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search Input */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 220 }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, tag, folder..."
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.82rem", width: "100%", color: "#1e293b" }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <X size={13} color="#94a3b8" />
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div style={{ display: "flex", background: "#f1f5f9", padding: 2, borderRadius: 8 }}>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid view"
                style={{
                  border: "none",
                  background: viewMode === "grid" ? "#ffffff" : "transparent",
                  color: viewMode === "grid" ? "#0f172a" : "#64748b",
                  padding: "5px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List view"
                style={{
                  border: "none",
                  background: viewMode === "list" ? "#ffffff" : "transparent",
                  color: viewMode === "list" ? "#0f172a" : "#64748b",
                  padding: "5px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Folder Pills Strip */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", overflowX: "auto", paddingBottom: 2 }}>
          <button
            type="button"
            onClick={() => setActiveFolder("all")}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              background: activeFolder === "all" ? "#0f172a" : "#f1f5f9",
              color: activeFolder === "all" ? "#ffffff" : "#475569",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            All Folders ({mediaAssets.length})
          </button>

          {allFolders.map((f) => {
            const count = (mediaAssets || []).filter((a) => a.folder === f).length;
            const isActive = activeFolder === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFolder(f)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 11px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: isActive ? "#4f46e5" : "#f8fafc",
                  color: isActive ? "#ffffff" : "#475569",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                <Folder size={13} color={isActive ? "#ffffff" : "#6366f1"} />
                <span>{f}</span>
                <span
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                    color: isActive ? "#ffffff" : "#64748b",
                    padding: "1px 6px",
                    borderRadius: 10,
                    fontSize: "0.7rem",
                    marginLeft: 2,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Assets Display Area */}
      {filteredAssets.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            padding: "50px 20px",
            borderRadius: 16,
            border: "1.5px dashed #cbd5e1",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <FolderArchive size={28} color="#4f46e5" />
          </div>
          <h4 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
            No client assets found
          </h4>
          <p style={{ margin: "0 0 18px", fontSize: "0.84rem", color: "#64748b", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            {searchQuery
              ? `No assets matching "${searchQuery}" in this folder.`
              : "Upload and store brand logos, raw reel footage, creative banners, and guidelines for your client accounts."}
          </p>
          <button
            type="button"
            onClick={() => setUploadModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#4f46e5",
              color: "#ffffff",
              border: "none",
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Upload size={16} /> Upload Asset Now
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 18,
          }}
        >
          {filteredAssets.map((asset) => {
            const url = getAssetUrl(asset);
            const isVideo = asset.asset_type === "video" || asset.asset_type === "reel";
            const isLogo = asset.asset_type === "logo";
            const isDoc = asset.asset_type === "document";

            return (
              <div
                key={asset.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 3px 10px rgba(15, 23, 42, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Media Thumbnail */}
                <div
                  onClick={() => setPreviewAsset(asset)}
                  style={{
                    height: 160,
                    background: isLogo
                      ? "repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 16px 16px"
                      : "#0f172a",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {isDoc ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#0284c7" }}>
                      <FileText size={42} />
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", background: "#e0f2fe", padding: "2px 8px", borderRadius: 4 }}>
                        {asset.file_format || "PDF"}
                      </span>
                    </div>
                  ) : url ? (
                    <img
                      src={url}
                      alt={asset.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: isLogo ? "contain" : "cover",
                        padding: isLogo ? 16 : 0,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div style={{ color: "#94a3b8" }}>
                      <ImageIcon size={36} />
                    </div>
                  )}

                  {/* Video Play Overlay */}
                  {isVideo && (
                    <div
                      style={{
                        position: "absolute",
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "rgba(15, 23, 42, 0.75)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <Play size={16} fill="#ffffff" style={{ marginLeft: 2 }} />
                    </div>
                  )}

                  {/* Asset Type Badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      background: "rgba(15, 23, 42, 0.8)",
                      color: "#ffffff",
                      fontSize: "0.68rem",
                      padding: "2px 7px",
                      borderRadius: 6,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.3,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {isLogo ? <Sparkles size={10} /> : isVideo ? <Video size={10} /> : <ImageIcon size={10} />}
                    <span>{asset.asset_type}</span>
                  </span>

                  {/* File Format & Size Badge */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "rgba(15, 23, 42, 0.75)",
                      color: "#ffffff",
                      fontSize: "0.64rem",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    {asset.file_format || "PNG"} • {formatBytes(asset.file_size_bytes)}
                  </span>
                </div>

                {/* Card Details */}
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div
                    title={asset.title}
                    style={{
                      fontSize: "0.86rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: 4,
                    }}
                  >
                    {asset.title}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.74rem", color: "#64748b", marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#4f46e5", fontWeight: 700 }}>
                      <Building2 size={12} /> {asset.client_name || "General"}
                    </span>
                    <span>•</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
                      <Folder size={12} /> {asset.folder}
                    </span>
                  </div>

                  {/* Tags */}
                  {(asset.tags || []).length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                      {asset.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "0.68rem",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions Strip */}
                  <div style={{ marginTop: "auto", display: "flex", gap: 5, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => onOpenCreateWithAsset?.(url)}
                      title="Create social post with this media"
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: 7,
                        background: "#eef2ff",
                        color: "#4f46e5",
                        border: "1px solid #c7d2fe",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Share2 size={12} /> Use
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadAsset(asset, e)}
                      title="Download asset"
                      style={{
                        padding: "6px 8px",
                        borderRadius: 7,
                        background: "#f0f9ff",
                        color: "#0284c7",
                        border: "1px solid #bae6fd",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Download size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(asset, e)}
                      title="Edit asset details"
                      style={{
                        padding: "6px 8px",
                        borderRadius: 7,
                        background: "#f8fafc",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(asset, e)}
                      title="Copy asset URL"
                      style={{
                        padding: "6px 8px",
                        borderRadius: 7,
                        background: copiedId === asset.id ? "#ecfdf5" : "#f8fafc",
                        color: copiedId === asset.id ? "#16a34a" : "#64748b",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {copiedId === asset.id ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewAsset(asset)}
                      title="Preview asset"
                      style={{
                        padding: "6px 8px",
                        borderRadius: 7,
                        background: "#f8fafc",
                        color: "#64748b",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Eye size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteAsset(asset.id, e)}
                      disabled={deletingId === asset.id}
                      title="Delete asset"
                      style={{
                        padding: "6px 8px",
                        borderRadius: 7,
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Asset</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Client Brand</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Folder</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Format & Size</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Added Date</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => {
                const url = getAssetUrl(asset);
                const isVideo = asset.asset_type === "video" || asset.asset_type === "reel";
                return (
                  <tr
                    key={asset.id}
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.12s ease" }}
                  >
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          onClick={() => setPreviewAsset(asset)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            background: "#0f172a",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          {url ? (
                            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <ImageIcon size={20} color="#94a3b8" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0f172a" }}>
                            {asset.title}
                          </div>
                          <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "#4f46e5" }}>
                              {asset.asset_type}
                            </span>
                            {(asset.tags || []).length > 0 && (
                              <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                                • #{asset.tags[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Building2 size={13} color="#64748b" /> {asset.client_name || "General"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.8rem", color: "#64748b" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>
                        <Folder size={12} /> {asset.folder}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.8rem", color: "#64748b" }}>
                      {asset.file_format || "PNG"} • {formatBytes(asset.file_size_bytes)}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.78rem", color: "#64748b" }}>
                      {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 5 }}>
                        <button
                          type="button"
                          onClick={() => onOpenCreateWithAsset?.(url)}
                          title="Use in Post"
                          style={{ padding: "5px 10px", borderRadius: 6, background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <Share2 size={12} /> Use
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadAsset(asset, e)}
                          title="Download"
                          style={{ padding: "5px 8px", borderRadius: 6, background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", cursor: "pointer" }}
                        >
                          <Download size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(asset, e)}
                          title="Edit"
                          style={{ padding: "5px 8px", borderRadius: 6, background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", cursor: "pointer" }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(asset, e)}
                          title="Copy URL"
                          style={{ padding: "5px 8px", borderRadius: 6, background: copiedId === asset.id ? "#ecfdf5" : "#f8fafc", color: copiedId === asset.id ? "#16a34a" : "#64748b", border: "1px solid #cbd5e1", cursor: "pointer" }}
                        >
                          {copiedId === asset.id ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewAsset(asset)}
                          title="View"
                          style={{ padding: "5px 8px", borderRadius: 6, background: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", cursor: "pointer" }}
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAsset(asset.id, e)}
                          title="Delete"
                          style={{ padding: "5px 8px", borderRadius: 6, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Lightbox / Asset Inspector Modal */}
      {previewAsset && (
        <div className="social-modal-overlay">
          <div
            className="social-modal-content"
            style={{
              maxWidth: 780,
              width: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div className="social-modal-header" style={{ padding: "14px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FolderArchive size={18} color="#4f46e5" />
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                  {previewAsset.title}
                </h4>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(previewAsset, e)}
                  title="Edit Asset"
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: 7,
                    padding: "5px 10px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#334155",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => setPreviewAsset(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                >
                  <X size={20} color="#64748b" />
                </button>
              </div>
            </div>

            <div
              className="social-modal-body"
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr",
                gap: 20,
                padding: 20,
                overflowY: "auto",
              }}
            >
              {/* Left: Media Display */}
              <div
                style={{
                  background: previewAsset.asset_type === "logo"
                    ? "repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 16px 16px"
                    : "#0f172a",
                  borderRadius: 12,
                  minHeight: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                }}
              >
                {previewAsset.asset_type === "video" || previewAsset.asset_type === "reel" ? (
                  <video
                    src={getAssetUrl(previewAsset)}
                    controls
                    autoPlay
                    style={{ maxWidth: "100%", maxHeight: 380, borderRadius: 8 }}
                  />
                ) : previewAsset.asset_type === "document" ? (
                  <div style={{ textAlign: "center", color: "#0284c7", padding: 20 }}>
                    <FileText size={64} style={{ margin: "0 auto 10px" }} />
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Document / PDF Asset</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>
                      {previewAsset.file_format || "PDF"} • {formatBytes(previewAsset.file_size_bytes)}
                    </div>
                  </div>
                ) : (
                  <img
                    src={getAssetUrl(previewAsset)}
                    alt={previewAsset.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 380,
                      objectFit: "contain",
                      padding: previewAsset.asset_type === "logo" ? 20 : 0,
                    }}
                  />
                )}
              </div>

              {/* Right: Metadata Inspector */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Client Profile
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <Building2 size={16} color="#4f46e5" />
                    <span>{previewAsset.client_name || "General Client"}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Folder
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginTop: 2 }}>
                      {previewAsset.folder}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Asset Type
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", textTransform: "capitalize", marginTop: 2 }}>
                      {previewAsset.asset_type}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Format
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginTop: 2 }}>
                      {previewAsset.file_format || "PNG"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      File Size
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginTop: 2 }}>
                      {formatBytes(previewAsset.file_size_bytes)}
                    </div>
                  </div>
                </div>

                {previewAsset.tags && previewAsset.tags.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>
                      Tags
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {previewAsset.tags.map((t, idx) => (
                        <span key={idx} style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>
                    Direct Asset URL
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="text"
                      readOnly
                      value={getAssetUrl(previewAsset)}
                      style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.75rem", background: "#f8fafc" }}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(previewAsset, e)}
                      style={{ padding: "6px 10px", borderRadius: 8, background: "#f1f5f9", border: "1px solid #cbd5e1", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      {copiedId === previewAsset.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCreateWithAsset?.(getAssetUrl(previewAsset));
                      setPreviewAsset(null);
                    }}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 8,
                      background: "#4f46e5",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Share2 size={15} /> Create Post with this Asset
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadAsset(previewAsset, e)}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 8,
                      background: "#0284c7",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Download size={15} /> Download Asset
                  </button>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(previewAsset, e)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "#f8fafc",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Pencil size={14} /> Edit Details
                    </button>

                    <a
                      href={getAssetUrl(previewAsset)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "#f8fafc",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <ExternalLink size={14} /> Open High-Res
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Upload / Add Client Asset Modal */}
      {uploadModal && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 540, width: "92vw", borderRadius: 16 }}>
            <div className="social-modal-header" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Upload size={18} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                  Add Asset to Client Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmitAsset}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 20px" }}>
                {uploadError && (
                  <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 12px", borderRadius: 8, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Upload Mode Switcher: Device File vs Cloud URL */}
                <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode("file");
                      setUploadError("");
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: uploadMode === "file" ? "#ffffff" : "transparent",
                      color: uploadMode === "file" ? "#0f172a" : "#64748b",
                      boxShadow: uploadMode === "file" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <FileUp size={14} /> Upload from Device
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode("url");
                      setUploadError("");
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: uploadMode === "url" ? "#ffffff" : "transparent",
                      color: uploadMode === "url" ? "#0f172a" : "#64748b",
                      boxShadow: uploadMode === "url" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <ExternalLink size={14} /> External CDN / URL
                  </button>
                </div>

                {/* File Upload Zone */}
                {uploadMode === "file" ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      accept="image/*,video/*,application/pdf"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: "2px dashed #cbd5e1",
                        borderRadius: 12,
                        padding: "22px 16px",
                        textAlign: "center",
                        background: selectedFile ? "#f0fdf4" : "#f8fafc",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {filePreview ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <img
                            src={filePreview}
                            alt=""
                            style={{ maxHeight: 90, borderRadius: 8, objectFit: "contain" }}
                          />
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#16a34a" }}>
                            {selectedFile.name} ({formatBytes(selectedFile.size)})
                          </div>
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Click to replace file</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FileUp size={20} color="#4f46e5" />
                          </div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                            Choose a file or click to browse
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                            Supports JPG, PNG, SVG, MP4, MOV, PDF up to 50MB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Media URL (CDN / Cloud Link) *
                    </label>
                    <input
                      type="url"
                      required
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                )}

                {/* Client Profile */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Target Client Brand Profile *
                  </label>
                  <select
                    value={uploadClientId}
                    onChange={(e) => setUploadClientId(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600, background: "#fff" }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Asset Title */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Asset Title / Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={assetTitle}
                    onChange={(e) => setAssetTitle(e.target.value)}
                    placeholder="e.g. Master Brand Logo (Vector Transparent)"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>

                {/* Asset Type & Folder Selection */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Asset Classification
                    </label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#fff" }}
                    >
                      <option value="image">Image / Graphic</option>
                      <option value="reel">Reel / Short (Vertical)</option>
                      <option value="video">Long Video</option>
                      <option value="logo">Brand Logo</option>
                      <option value="carousel">Carousel Asset</option>
                      <option value="document">Document / PDF</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                        Folder
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomFolder(!isCustomFolder)}
                        style={{ border: "none", background: "none", color: "#4f46e5", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
                      >
                        {isCustomFolder ? "Pick Existing" : "+ New Folder"}
                      </button>
                    </div>

                    {isCustomFolder ? (
                      <input
                        type="text"
                        value={customFolderName}
                        onChange={(e) => setCustomFolderName(e.target.value)}
                        placeholder="e.g. Onam Creatives 2026"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #4f46e5", fontSize: "0.85rem", outline: "none" }}
                      />
                    ) : (
                      <select
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#fff" }}
                      >
                        {allFolders.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. logo, dark, header, vector"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>
              </div>

              <div className="social-modal-footer" style={{ padding: "14px 20px" }}>
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.84rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    border: "none",
                    background: "#4f46e5",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: uploading ? 0.7 : 1,
                  }}
                >
                  {uploading ? <RefreshCw size={14} className="spin-icon" /> : <Upload size={14} />}
                  <span>{uploading ? "Uploading..." : "Save to Library"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 7. Edit Client Asset Modal */}
      {editModal && editingAsset && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 540, width: "92vw", borderRadius: 16 }}>
            <div className="social-modal-header" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Pencil size={18} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                  Edit Client Asset Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditModal(false);
                  setEditingAsset(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 20px" }}>
                {editError && (
                  <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 12px", borderRadius: 8, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Current Asset Thumbnail Preview */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: "#0f172a", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {getAssetUrl(editingAsset) ? (
                      <img src={getAssetUrl(editingAsset)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <ImageIcon size={20} color="#94a3b8" />
                    )}
                  </div>
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {editingAsset.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                      {editingAsset.file_format || "PNG"} • {formatBytes(editingAsset.file_size_bytes)}
                    </div>
                  </div>
                </div>

                {/* Client Brand Profile */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Target Client Brand Profile *
                  </label>
                  <select
                    value={editClientId}
                    onChange={(e) => setEditClientId(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#fff" }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Asset Title */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Asset Title / Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Master Brand Logo (Vector Transparent)"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>

                {/* Asset Classification & Folder Selection */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Asset Classification
                    </label>
                    <select
                      value={editAssetType}
                      onChange={(e) => setEditAssetType(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#fff" }}
                    >
                      <option value="image">Image / Graphic</option>
                      <option value="reel">Reel / Short (Vertical)</option>
                      <option value="video">Long Video</option>
                      <option value="logo">Brand Logo</option>
                      <option value="carousel">Carousel Asset</option>
                      <option value="document">Document / PDF</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                        Folder
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditIsCustomFolder(!editIsCustomFolder)}
                        style={{ border: "none", background: "none", color: "#4f46e5", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
                      >
                        {editIsCustomFolder ? "Pick Existing" : "+ New Folder"}
                      </button>
                    </div>

                    {editIsCustomFolder ? (
                      <input
                        type="text"
                        value={editCustomFolder}
                        onChange={(e) => setEditCustomFolder(e.target.value)}
                        placeholder="e.g. Brand Refresh 2026"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #4f46e5", fontSize: "0.85rem", outline: "none" }}
                      />
                    ) : (
                      <select
                        value={editFolder}
                        onChange={(e) => setEditFolder(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#fff" }}
                      >
                        {allFolders.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="e.g. logo, dark, header, vector"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>
              </div>

              <div className="social-modal-footer" style={{ padding: "14px 20px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditModal(false);
                    setEditingAsset(null);
                  }}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.84rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    border: "none",
                    background: "#4f46e5",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: savingEdit ? 0.7 : 1,
                  }}
                >
                  {savingEdit ? <RefreshCw size={14} className="spin-icon" /> : <Check size={14} />}
                  <span>{savingEdit ? "Saving Changes..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
