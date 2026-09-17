"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Film,
  Video,
  Clock,
  MapPin,
  Hash,
  Type,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Send,
  Save,
  Music2,
  Phone,
  Info,
  Sliders,
  Check,
  Building,
  AlertTriangle,
  FolderArchive,
  Search,
  Folder,
  Boxes,
  Eye,
} from "lucide-react";
import ClientCompanySearchSelect from "./ClientCompanySearchSelect";

export default function ScriptCreationModal({
  isOpen,
  onClose,
  clients = [],
  mediaAssets = [],
  selectedClientId = "all",
  initialData = null,
  onSuccess,
}) {
  const [clientId, setClientId] = useState(
    initialData?.client_profile
      ? initialData.client_profile
      : selectedClientId !== "all"
      ? selectedClientId
      : clients[0]?.id || 1
  );

  // Format selection: 'poster' | 'carousel' | 'video'
  const [format, setFormat] = useState(() => {
    if (initialData?.script_data?.format) return initialData.script_data.format;
    if (initialData?.post_type === "carousel") return "carousel";
    if (initialData?.post_type === "reel" || initialData?.post_type === "video") return "video";
    return "poster";
  });

  // Video subtype selection: 'clips' | 'ai' | 'motion_graphics'
  const [videoType, setVideoType] = useState(
    initialData?.script_data?.video_type || "clips"
  );

  // SECTION 1: FOR DESIGNERS (Shared & Format-specific)
  const [headline, setHeadline] = useState(
    initialData?.script_data?.for_designers?.headline || initialData?.title || ""
  );
  const [sub, setSub] = useState(
    initialData?.script_data?.for_designers?.sub || ""
  );
  const [visualContentText, setVisualContentText] = useState(
    initialData?.script_data?.for_designers?.visual_content_text ||
      initialData?.script_notes ||
      ""
  );
  const [cta, setCta] = useState(
    initialData?.script_data?.for_designers?.cta || ""
  );
  const [logoAssets, setLogoAssets] = useState(
    initialData?.script_data?.for_designers?.logo_assets || ""
  );
  const [contactDetails, setContactDetails] = useState(
    initialData?.script_data?.for_designers?.contact_details || ""
  );

  // Client Asset Storage & Multi-Select Integration
  const [clientAssets, setClientAssets] = useState(
    Array.isArray(mediaAssets) && mediaAssets.length > 0
      ? mediaAssets.filter((a) => String(a.client_profile) === String(clientId))
      : []
  );
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Multi-selected asset IDs (Array of asset IDs e.g. [1, 5, 8])
  const [selectedAssetIds, setSelectedAssetIds] = useState(() => {
    if (initialData?.media_assets && Array.isArray(initialData.media_assets)) {
      return initialData.media_assets.map((a) => (typeof a === "object" ? a.id : a));
    }
    if (initialData?.script_data?.for_designers?.selected_asset_ids) {
      return initialData.script_data.for_designers.selected_asset_ids;
    }
    return [];
  });

  // Asset Picker Modal State
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [assetFolderFilter, setAssetFolderFilter] = useState("all");
  const [assetTypeFilter, setAssetTypeFilter] = useState("all");

  // Fetch client assets dynamically whenever clientId changes
  useEffect(() => {
    if (!clientId) return;
    let isMounted = true;
    setLoadingAssets(true);
    axios
      .get(`${API_BASE_URL}/social/media/?client_id=${clientId}`)
      .then((res) => {
        if (isMounted) {
          setClientAssets(res.data || []);
        }
      })
      .catch((err) => {
        console.error("Error loading client assets:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingAssets(false);
      });
    return () => {
      isMounted = false;
    };
  }, [clientId]);

  // Sync selected assets when initialData changes
  useEffect(() => {
    if (initialData?.media_assets && Array.isArray(initialData.media_assets)) {
      setSelectedAssetIds(initialData.media_assets.map((a) => (typeof a === "object" ? a.id : a)));
    } else if (initialData?.script_data?.for_designers?.selected_asset_ids) {
      setSelectedAssetIds(initialData.script_data.for_designers.selected_asset_ids);
    }
  }, [initialData]);

  // Toggle single asset in multi-selection
  const handleToggleAsset = (assetId) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  // Select all currently filtered assets
  const handleSelectAllFiltered = (filteredList) => {
    const idsToAdd = filteredList.map((a) => a.id);
    setSelectedAssetIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  // Deselect currently filtered assets
  const handleDeselectAllFiltered = (filteredList) => {
    const idsToRemove = new Set(filteredList.map((a) => a.id));
    setSelectedAssetIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  // Available unique folders for the current client's assets
  const availableFolders = useMemo(() => {
    const folders = new Set();
    clientAssets.forEach((a) => {
      if (a.folder) folders.add(a.folder);
    });
    return Array.from(folders);
  }, [clientAssets]);

  // Filtered assets inside the modal picker
  const filteredModalAssets = useMemo(() => {
    return clientAssets.filter((a) => {
      if (assetFolderFilter !== "all" && a.folder !== assetFolderFilter) return false;
      if (assetTypeFilter !== "all" && a.asset_type !== assetTypeFilter) return false;
      if (assetSearchQuery.trim()) {
        const q = assetSearchQuery.toLowerCase();
        const matchesTitle = a.title?.toLowerCase().includes(q);
        const matchesTags = Array.isArray(a.tags) && a.tags.some((t) => t.toLowerCase().includes(q));
        const matchesFolder = a.folder?.toLowerCase().includes(q);
        return matchesTitle || matchesTags || matchesFolder;
      }
      return true;
    });
  }, [clientAssets, assetFolderFilter, assetTypeFilter, assetSearchQuery]);

  // Selected asset objects
  const selectedAssetsList = useMemo(() => {
    const matched = clientAssets.filter((a) => selectedAssetIds.includes(a.id));
    if (matched.length > 0) return matched;
    if (initialData?.script_data?.for_designers?.selected_assets) {
      return initialData.script_data.for_designers.selected_assets.filter((a) =>
        selectedAssetIds.includes(a.id)
      );
    }
    return [];
  }, [clientAssets, selectedAssetIds, initialData]);

  // Carousel Slides Manager: array of { slide_num, headline, visual_text, content_text }
  const [carouselSlides, setCarouselSlides] = useState(() => {
    if (
      initialData?.script_data?.for_designers?.slides &&
      initialData.script_data.for_designers.slides.length > 0
    ) {
      return initialData.script_data.for_designers.slides;
    }
    return [
      {
        slide_num: 1,
        headline: "Slide 1 (Hook Cover)",
        visual_text: "High contrast hook graphic with bold typography and curiosity icon",
        content_text: "Are you losing 40% of your qualified leads?",
      },
      {
        slide_num: 2,
        headline: "Slide 2 (Core Problem)",
        visual_text: "Data breakdown graphic with red negative growth trendline",
        content_text: "Mistake #1: Slow response time kills buyer intent within 5 minutes.",
      },
      {
        slide_num: 3,
        headline: "Slide 3 (The Solution)",
        visual_text: "Clean workflow diagram showing automated lead routing",
        content_text: "How top agencies fix it: Implement instant WhatsApp & CRM automations.",
      },
      {
        slide_num: 4,
        headline: "Slide 4 (Action / CTA)",
        visual_text: "Client brand badge with bookmark icon and comment callout",
        content_text: "Save this post for later. Comment 'LEADS' to get our free implementation SOP.",
      },
    ];
  });
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Video / Reel specific states
  const [duration, setDuration] = useState(
    initialData?.script_data?.for_designers?.duration || "30s"
  );
  const [musicReference, setMusicReference] = useState(
    initialData?.script_data?.for_designers?.music_reference || ""
  );
  const [clips, setClips] = useState(
    initialData?.script_data?.for_designers?.clips || ""
  );
  const [clipTexts, setClipTexts] = useState(
    initialData?.script_data?.for_designers?.texts || ""
  );

  // Multiple Scenes Manager for AI Videos & Motion Graphics
  const [scenes, setScenes] = useState(() => {
    if (
      initialData?.script_data?.for_designers?.scenes &&
      initialData.script_data.for_designers.scenes.length > 0
    ) {
      return initialData.script_data.for_designers.scenes;
    }
    return [
      {
        scene_num: 1,
        duration: "0-5s",
        visual_text: "Hook scene: Fast zoom into frustrated business owner staring at analytics laptop",
        content_text: "POV: You spent $5,000 on ads this month with zero closed deals...",
      },
      {
        scene_num: 2,
        duration: "5-15s",
        visual_text: "Problem breakdown: Dynamic split screen comparing manual vs AI automated workflows",
        content_text: "Here is the exact leak inside your marketing funnel that is bleeding cash.",
      },
      {
        scene_num: 3,
        duration: "15-25s",
        visual_text: "Demonstration: 3D kinetic graph showing conversion rate jumping from 1.2% to 4.8%",
        content_text: "By fixing lead speed-to-call, our client scaled from 10 to 45 clients in 90 days.",
      },
      {
        scene_num: 4,
        duration: "25-30s",
        visual_text: "Outro CTA: Clean animated brand bumper with follow button & link bio indicator",
        content_text: "Tap the link in bio to book your free pipeline audit today.",
      },
    ];
  });
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // SECTION 2: FOR POSTING (Final publishing metadata)
  const [title, setTitle] = useState(
    initialData?.script_data?.for_posting?.title || initialData?.title || ""
  );
  const [description, setDescription] = useState(
    initialData?.script_data?.for_posting?.description ||
      initialData?.primary_caption ||
      ""
  );
  const [location, setLocation] = useState(
    initialData?.script_data?.for_posting?.location || initialData?.location || ""
  );
  const [hashtags, setHashtags] = useState(
    initialData?.script_data?.for_posting?.hashtag || initialData?.hashtags || ""
  );
  const [priority, setPriority] = useState(initialData?.priority || "medium");
  const [submitting, setSubmitting] = useState(false);

  // Auto-sync client change & initialData
  useEffect(() => {
    if (initialData) {
      setClientId(
        initialData.client_profile
          ? initialData.client_profile
          : selectedClientId !== "all"
          ? selectedClientId
          : clients[0]?.id || 1
      );
      const scriptData = initialData.script_data || {};
      const fmt =
        scriptData.format ||
        (initialData.post_type === "carousel"
          ? "carousel"
          : initialData.post_type === "reel" || initialData.post_type === "video"
          ? "video"
          : "poster");
      setFormat(fmt);
      setVideoType(scriptData.video_type || "clips");
      setHeadline(scriptData.for_designers?.headline || initialData.title || "");
      setSub(scriptData.for_designers?.sub || "");
      setVisualContentText(
        scriptData.for_designers?.visual_content_text ||
          initialData.script_notes ||
          ""
      );
      setCta(scriptData.for_designers?.cta || "");
      setLogoAssets(scriptData.for_designers?.logo_assets || "");
      setContactDetails(scriptData.for_designers?.contact_details || "");
      if (
        scriptData.for_designers?.slides &&
        scriptData.for_designers.slides.length > 0
      ) {
        setCarouselSlides(scriptData.for_designers.slides);
      }
      setDuration(scriptData.for_designers?.duration || "30s");
      setMusicReference(scriptData.for_designers?.music_reference || "");
      setClips(scriptData.for_designers?.clips || "");
      setClipTexts(scriptData.for_designers?.texts || "");
      if (
        scriptData.for_designers?.scenes &&
        scriptData.for_designers.scenes.length > 0
      ) {
        setScenes(scriptData.for_designers.scenes);
      }
      setTitle(scriptData.for_posting?.title || initialData.title || "");
      setDescription(
        scriptData.for_posting?.description || initialData.primary_caption || ""
      );
      setLocation(scriptData.for_posting?.location || initialData.location || "");
      setHashtags(scriptData.for_posting?.hashtag || initialData.hashtags || "");
      setPriority(initialData.priority || "medium");
    } else if (selectedClientId !== "all") {
      setClientId(selectedClientId);
    }
  }, [initialData, selectedClientId, clients]);

  if (!isOpen) return null;

  const selectedClient =
    clients.find((c) => String(c.id) === String(clientId)) || clients[0] || {};

  // Slide helpers
  const handleAddSlide = () => {
    if (carouselSlides.length >= 10) return;
    const nextNum = carouselSlides.length + 1;
    setCarouselSlides([
      ...carouselSlides,
      {
        slide_num: nextNum,
        headline: `Slide ${nextNum}`,
        visual_text: "Visual content & composition for this slide...",
        content_text: "Key takeaway point or visual copy...",
      },
    ]);
    setActiveSlideIndex(carouselSlides.length);
  };

  const handleRemoveSlide = (idx) => {
    if (carouselSlides.length <= 2) return;
    const filtered = carouselSlides.filter((_, i) => i !== idx);
    setCarouselSlides(filtered);
    if (activeSlideIndex >= filtered.length) {
      setActiveSlideIndex(filtered.length - 1);
    }
  };

  const handleUpdateSlide = (index, field, val) => {
    setCarouselSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Scene helpers for AI Video / Motion Graphics
  const handleAddScene = () => {
    if (scenes.length >= 8) return;
    const nextNum = scenes.length + 1;
    setScenes([
      ...scenes,
      {
        scene_num: nextNum,
        duration: "5s",
        visual_text: "Visual motion / AI animation prompt for this scene...",
        content_text: "On-screen kinetic text / voiceover narration...",
      },
    ]);
    setActiveSceneIndex(scenes.length);
  };

  const handleRemoveScene = (idx) => {
    if (scenes.length <= 2) return;
    const filtered = scenes.filter((_, i) => i !== idx);
    setScenes(filtered);
    if (activeSceneIndex >= filtered.length) {
      setActiveSceneIndex(filtered.length - 1);
    }
  };

  const handleUpdateScene = (index, field, val) => {
    setScenes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (targetStatus = "script") => {
    if (!title.trim() && !headline.trim() && !description.trim()) {
      alert("Please provide at least a Title, Headline, or Description for the script.");
      return;
    }

    setSubmitting(true);

    // Gather full attached assets and URLs from multi-select
    const attachedAssets = selectedAssetsList;
    const attachedUrls = attachedAssets
      .map((a) => a.file_url || a.file)
      .filter(Boolean);
    const assetNames = attachedAssets
      .map((a) => `${a.title} [${(a.asset_type || "asset").toUpperCase()}]`)
      .join(", ");

    // Build structured script_data according to the requirements
    const scriptData = {
      format, // 'poster' | 'carousel' | 'video'
      video_type: format === "video" ? videoType : null,
      for_designers: {
        headline,
        sub,
        visual_content_text: visualContentText,
        cta,
        logo_assets: logoAssets,
        selected_asset_ids: selectedAssetIds,
        selected_assets: attachedAssets.map((a) => ({
          id: a.id,
          title: a.title,
          asset_type: a.asset_type,
          url: a.file_url || a.file,
          folder: a.folder,
        })),
        contact_details: contactDetails,
        music_reference: musicReference,
        clips,
        texts: clipTexts,
        duration,
        slides: format === "carousel" ? carouselSlides : [],
        scenes: format === "video" && videoType !== "clips" ? scenes : [],
      },
      for_posting: {
        title,
        description,
        location,
        hashtag: hashtags,
      },
    };

    // Formatted readable script notes for all dashboard cards & pipeline stages
    let formattedScriptNotes = "";
    if (format === "poster") {
      formattedScriptNotes = `[POSTER / IMAGE]\nHeadline: ${headline || "—"}\nSub: ${sub || "—"}\nVisual Concept: ${visualContentText || "—"}\nCTA: ${cta || "—"}\nLogo & Assets: ${logoAssets || "—"}\nContacts: ${contactDetails || "—"}`;
    } else if (format === "carousel") {
      formattedScriptNotes =
        `[CAROUSEL (${carouselSlides.length} SLIDES)]\nCover Headline: ${headline || "—"}\nCover Sub: ${sub || "—"}\n` +
        carouselSlides
          .map(
            (s, i) =>
              `• Slide ${i + 1} (${s.headline || "Slide"}): Visual: "${s.visual_text || "—"}" | Copy: "${s.content_text || "—"}"`
          )
          .join("\n") +
        `\nCTA: ${cta || "—"}\nLogo & Contacts: ${logoAssets || "—"}`;
    } else if (format === "video") {
      const typeLabel =
        videoType === "clips"
          ? "Clips from Client / Anchoring"
          : videoType === "ai"
          ? "AI Video Generation"
          : "Motion Graphics";
      if (videoType === "clips") {
        formattedScriptNotes = `[VIDEO - ${typeLabel} (${duration})]\nMusic Reference: ${musicReference || "—"}\nClips / Footage: ${clips || "—"}\nOn-Screen Texts: ${clipTexts || "—"}\nLogo, Assets & CTA/Contacts: ${logoAssets || "—"}`;
      } else {
        formattedScriptNotes =
          `[VIDEO - ${typeLabel} (${duration})]\nMusic & Style: ${musicReference || "—"}\n` +
          scenes
            .map(
              (sc, i) =>
                `• Scene ${i + 1} (${sc.duration}): Visual: "${sc.visual_text || "—"}" | Script: "${sc.content_text || "—"}"`
            )
            .join("\n") +
          `\nLogo, Assets & CTA/Contacts: ${logoAssets || "—"}`;
      }
    }

    // Formatted designer notes specifically for the design team in Stage 3
    let formattedDesignerNotes = "";
    if (format === "poster") {
      formattedDesignerNotes = `HEADLINE: ${headline}\nSUB: ${sub}\nVISUAL TEXT: ${visualContentText}\nCTA: ${cta}\nLOGO/ASSETS: ${logoAssets}\nCONTACTS: ${contactDetails}`;
    } else if (format === "carousel") {
      formattedDesignerNotes =
        `CAROUSEL DECK (${carouselSlides.length} SLIDES)\nCOVER HEADLINE: ${headline}\nSUB: ${sub}\n` +
        carouselSlides
          .map((s, i) => `SLIDE ${i + 1}: [Visual] ${s.visual_text} | [Copy] ${s.content_text}`)
          .join("\n") +
        `\nCTA: ${cta}\nLOGO/ASSETS/CONTACTS: ${logoAssets}`;
    } else if (format === "video") {
      formattedDesignerNotes =
        `VIDEO TYPE: ${videoType.toUpperCase()} | DURATION: ${duration}\nMUSIC REF: ${musicReference}\n` +
        (videoType === "clips"
          ? `CLIPS: ${clips}\nTEXTS: ${clipTexts}\n`
          : scenes
              .map((sc, i) => `SCENE ${i + 1} (${sc.duration}): [Visual] ${sc.visual_text} | [Voiceover/Text] ${sc.content_text}`)
              .join("\n")) +
        `\nLOGO, ASSETS & CTA: ${logoAssets}`;
    }

    const payload = {
      client_profile: clientId,
      title:
        title.trim() ||
        headline.trim() ||
        (format === "poster"
          ? `${selectedClient.name || "Client"} Poster Script`
          : format === "carousel"
          ? `${selectedClient.name || "Client"} Carousel Script`
          : `${selectedClient.name || "Client"} Video Script`),
      post_type:
        format === "poster"
          ? "image"
          : format === "carousel"
          ? "carousel"
          : "reel",
      primary_caption: description,
      hashtags,
      location,
      media_assets: selectedAssetIds,
      media_urls: attachedUrls.length > 0 ? attachedUrls : (initialData?.media_urls || []),
      script_notes: formattedScriptNotes,
      designer_notes: formattedDesignerNotes,
      script_data: scriptData,
      status: targetStatus, // 'script' (Draft) or 'script_approval' (Review)
      priority,
      platforms: ["instagram", "facebook", "linkedin"],
    };

    try {
      if (initialData?.id) {
        await axios.put(`${API_BASE_URL}/social/posts/${initialData.id}/`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/social/posts/`, payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Error saving script. Please check all required fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderClientAssetsSelector = (theme = {
    labelColor: "#581c87",
    accentColor: "#7c3aed",
    borderColor: "#d8b4fe",
    bgLight: "#faf5ff",
  }) => {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          border: `1.5px solid ${theme.borderColor}`,
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Header with Title & Action Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FolderArchive size={16} color={theme.accentColor} />
              <label style={{ fontSize: "0.8rem", fontWeight: 800, color: theme.labelColor }}>
                Logo & Client Assets (Connected to Asset Storage)
              </label>
              {selectedAssetIds.length > 0 && (
                <span
                  style={{
                    background: theme.accentColor,
                    color: "#ffffff",
                    borderRadius: 10,
                    padding: "1px 8px",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                  }}
                >
                  {selectedAssetIds.length} Selected
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
              Multi-select brand logos, product photos, or creative assets from {selectedClient?.name || "Client"}'s storage
            </div>
          </div>

          {/* Button to open multi-select asset picker modal */}
          <button
            type="button"
            onClick={() => setAssetPickerOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: theme.bgLight,
              color: theme.accentColor,
              border: `1.5px solid ${theme.borderColor}`,
              padding: "6px 13px",
              borderRadius: 8,
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Plus size={14} /> Browse & Multi-Select Assets ({clientAssets.length})
          </button>
        </div>

        {/* Attached Assets Visual List / Grid */}
        {selectedAssetsList.length > 0 ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: theme.labelColor }}>
                Attached Assets for Designer ({selectedAssetsList.length}):
              </span>
              <button
                type="button"
                onClick={() => setSelectedAssetIds([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 8,
                maxHeight: 180,
                overflowY: "auto",
                padding: 6,
                background: theme.bgLight,
                borderRadius: 8,
                border: `1px solid ${theme.borderColor}`,
              }}
            >
              {selectedAssetsList.map((asset) => {
                const previewUrl = asset.file_url || asset.file;
                return (
                  <div
                    key={asset.id}
                    style={{
                      position: "relative",
                      background: "#ffffff",
                      borderRadius: 8,
                      border: `1px solid ${theme.borderColor}`,
                      padding: 6,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "100%",
                        height: 60,
                        borderRadius: 6,
                        background: "#f8fafc",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={asset.title}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <FileText size={22} color="#94a3b8" />
                      )}
                    </div>

                    {/* Title & Badge */}
                    <div style={{ minWidth: 0 }}>
                      <div
                        title={asset.title}
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {asset.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <span
                          style={{
                            background: "#ede9fe",
                            color: "#6d28d9",
                            padding: "1px 4px",
                            borderRadius: 4,
                            fontSize: "0.62rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                          }}
                        >
                          {asset.asset_type || "Asset"}
                        </span>
                        {asset.folder && (
                          <span
                            style={{
                              fontSize: "0.62rem",
                              color: "#64748b",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {asset.folder}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAsset(asset.id)}
                      title="Remove asset from script"
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            onClick={() => setAssetPickerOpen(true)}
            style={{
              padding: "12px",
              borderRadius: 8,
              border: `1.5px dashed ${theme.borderColor}`,
              background: theme.bgLight,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontSize: "0.76rem", color: theme.accentColor, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Plus size={13} /> Click to Multi-Select Client Logos, Creatives & Guidelines
            </div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: 2 }}>
              {clientAssets.length} assets available in {selectedClient?.name || "Client"}'s library
            </div>
          </div>
        )}

        {/* Placement & Additional Link Input */}
        <div>
          <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: theme.labelColor, marginBottom: 3 }}>
            Placement Notes & Additional Links for Designer (Optional)
          </label>
          <input
            type="text"
            value={logoAssets}
            onChange={(e) => setLogoAssets(e.target.value)}
            placeholder="e.g. White logo top right, feature attached product photo #1 in center, cyan brand accent..."
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${theme.borderColor}`,
              fontSize: "0.82rem",
              outline: "none",
              background: "#fff",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="social-modal-overlay">
      <div
        className="social-modal-content"
        style={{
          maxWidth: 1060,
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header */}
        <div className="social-modal-header" style={{ padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#eef2ff",
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                {initialData ? "Edit Script & Creative Outline" : "Create New Script & Content Outline"}
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Define design directions for the creative team and copy for social media publishing
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                color: "#4f46e5",
                background: "#eef2ff",
                padding: "4px 10px",
                borderRadius: 8,
                border: "1px solid #c7d2fe",
              }}
            >
              Stage 1: Scripts
            </span>
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="social-modal-body"
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Loopback Critique Banner if rejected from Review */}
          {initialData?.client_feedback && (
            <div
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <AlertTriangle size={18} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#991b1b", fontSize: "0.84rem", display: "block", marginBottom: 2 }}>
                  Reviewer Critique / Revision Notes:
                </strong>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#b91c1c", lineHeight: 1.4 }}>
                  {initialData.client_feedback}
                </p>
              </div>
            </div>
          )}

          {/* Top Bar: Client Selection & Format Selector */}
          <div
            style={{
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, alignItems: "center" }}>
              {/* Client Profile */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "#334155",
                    marginBottom: 5,
                  }}
                >
                  Client Company *
                </label>
                <ClientCompanySearchSelect
                  clients={clients}
                  value={clientId}
                  onChange={(val) => setClientId(val)}
                  allowAll={false}
                  placeholder="Search & select client company..."
                  variant="form"
                />
              </div>

              {/* Format Switcher (Handwritten notes: Poster/Image, Carousel, Videos/Reel) */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "#334155",
                    marginBottom: 5,
                  }}
                >
                  Content Format *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {[
                    { id: "poster", label: "Poster / Image", icon: <ImageIcon size={15} />, color: "#8b5cf6" },
                    { id: "carousel", label: "Carousel", icon: <Layers size={15} />, color: "#4f46e5" },
                    { id: "video", label: "Videos / Reel", icon: <Film size={15} />, color: "#e11d48" },
                  ].map((fmt) => {
                    const isSelected = format === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setFormat(fmt.id)}
                        style={{
                          padding: "9px 12px",
                          borderRadius: 10,
                          border: isSelected ? `2px solid ${fmt.color}` : "1.5px solid #cbd5e1",
                          background: isSelected ? "#ffffff" : "#ffffff",
                          color: isSelected ? fmt.color : "#64748b",
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          boxShadow: isSelected ? `0 2px 8px ${fmt.color}25` : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>{fmt.icon}</span>
                        <span>{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Video Sub-Type Selector (Only when format === "video") */}
            {format === "video" && (
              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#9f1239" }}>
                  Video Type:
                </span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { id: "clips", label: "Clips from client / anchoring clip" },
                    { id: "ai", label: "AI videos generation" },
                    { id: "motion_graphics", label: "Motion Graphics" },
                  ].map((vt) => {
                    const isSelected = videoType === vt.id;
                    return (
                      <button
                        key={vt.id}
                        type="button"
                        onClick={() => setVideoType(vt.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: isSelected ? "1.5px solid #e11d48" : "1px solid #fda4af",
                          background: isSelected ? "#e11d48" : "#fff1f2",
                          color: isSelected ? "#ffffff" : "#9f1239",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {vt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* TWO MAIN SECTIONS: For Designers & For Posting (Exactly per handwritten layout) */}
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.95fr", gap: 24, alignItems: "start" }}>
            
            {/* ============================================================ */}
            {/* LEFT COLUMN: FOR DESIGNERS (Visual Creative Content)        */}
            {/* ============================================================ */}
            <div
              style={{
                background: format === "poster" ? "#faf5ff" : format === "carousel" ? "#f5f3ff" : "#fff1f2",
                border:
                  format === "poster"
                    ? "1.5px solid #e9d5ff"
                    : format === "carousel"
                    ? "1.5px solid #ddd6fe"
                    : "1.5px solid #fecdd3",
                borderRadius: 14,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Section Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background:
                        format === "poster" ? "#8b5cf6" : format === "carousel" ? "#4f46e5" : "#e11d48",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sliders size={16} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#1e293b" }}>
                    For Designers Content
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color:
                      format === "poster" ? "#7c3aed" : format === "carousel" ? "#4338ca" : "#be123c",
                  }}
                >
                  {format === "poster"
                    ? "Poster / Image Brief"
                    : format === "carousel"
                    ? "Carousel Deck Brief"
                    : `Video Brief • ${videoType}`}
                </span>
              </div>

              {/* -------------------------------------------------------- */}
              {/* CASE 1: POSTER / IMAGE                                  */}
              {/* -------------------------------------------------------- */}
              {format === "poster" && (
                <>
                  {/* Headline */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#581c87", marginBottom: 4 }}>
                      Headline (Main text on graphic) *
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Stop Losing 40% of Your Ad Spend Every Month"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d8b4fe", fontSize: "0.85rem", outline: "none", background: "#fff" }}
                    />
                  </div>

                  {/* Sub */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#581c87", marginBottom: 4 }}>
                      Sub (Subheadline on graphic)
                    </label>
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => setSub(e.target.value)}
                      placeholder="e.g. Proven B2B Growth Strategy for High-Ticket Brands"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d8b4fe", fontSize: "0.85rem", outline: "none", background: "#fff" }}
                    />
                  </div>

                  {/* Visual content text */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#581c87", marginBottom: 4 }}>
                      Visual content text (Design Direction & Composition) *
                    </label>
                    <textarea
                      rows={3}
                      value={visualContentText}
                      onChange={(e) => setVisualContentText(e.target.value)}
                      placeholder="Describe imagery, icon styles, graph visual, background gradient, layout placement for graphic designer..."
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d8b4fe", fontSize: "0.84rem", outline: "none", background: "#fff", resize: "vertical" }}
                    />
                  </div>

                  {/* CTA */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#581c87", marginBottom: 4 }}>
                      CTA (Call to Action on graphic)
                    </label>
                    <input
                      type="text"
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                      placeholder="e.g. Book Free Consultation / Swipe Up / Register Now"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d8b4fe", fontSize: "0.85rem", outline: "none", background: "#fff" }}
                    />
                  </div>

                  {/* Logo, Client Assets & Multi-Select Integration */}
                  {renderClientAssetsSelector({
                    labelColor: "#581c87",
                    accentColor: "#7c3aed",
                    borderColor: "#d8b4fe",
                    bgLight: "#faf5ff",
                  })}

                  {/* Contact details */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#581c87", marginBottom: 4 }}>
                      Contact details (To feature on graphic)
                    </label>
                    <input
                      type="text"
                      value={contactDetails}
                      onChange={(e) => setContactDetails(e.target.value)}
                      placeholder="e.g. +91 98765 43210 | www.adstradigital.com | Kochi, Kerala"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #d8b4fe", fontSize: "0.85rem", outline: "none", background: "#fff" }}
                    />
                  </div>
                </>
              )}

              {/* -------------------------------------------------------- */}
              {/* CASE 2: CAROUSEL                                        */}
              {/* -------------------------------------------------------- */}
              {format === "carousel" && (
                <>
                  {/* Headline & Sub for Cover Slide */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#3730a3", marginBottom: 4 }}>
                        Headline (Cover Slide Hook) *
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. 5 Growth Mistakes In B2B Marketing"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #c7d2fe", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#3730a3", marginBottom: 4 }}>
                        Sub (Cover Subheadline)
                      </label>
                      <input
                        type="text"
                        value={sub}
                        onChange={(e) => setSub(e.target.value)}
                        placeholder="e.g. And the exact 3-step fix to double leads"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #c7d2fe", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                      />
                    </div>
                  </div>

                  {/* Multiple Slides: Interactive Slide Tabs */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "#3730a3" }}>
                        Multiple slides ({carouselSlides.length} Slides configured)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSlide}
                        disabled={carouselSlides.length >= 10}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "#4f46e5",
                          color: "#fff",
                          border: "none",
                          padding: "4px 9px",
                          borderRadius: 6,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={12} /> Add Slide
                      </button>
                    </div>

                    {/* Slide Selector Pills */}
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                      {carouselSlides.map((s, idx) => {
                        const isCurrent = activeSlideIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveSlideIndex(idx)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              border: isCurrent ? "1.5px solid #4f46e5" : "1px solid #c7d2fe",
                              background: isCurrent ? "#4f46e5" : "#ffffff",
                              color: isCurrent ? "#ffffff" : "#4338ca",
                              transition: "all 0.15s ease",
                            }}
                          >
                            Slide {idx + 1}
                            {idx === 0 ? " (Cover)" : idx === carouselSlides.length - 1 ? " (CTA)" : ""}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Slide Editor Box */}
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #c7d2fe",
                        borderRadius: 10,
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#3730a3" }}>
                          Editing Slide {activeSlideIndex + 1} of {carouselSlides.length}
                        </span>
                        {carouselSlides.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(activeSlideIndex)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={12} /> Remove Slide
                          </button>
                        )}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 3 }}>
                          Slide {activeSlideIndex + 1} Visual Content Text (For designer):
                        </label>
                        <input
                          type="text"
                          value={carouselSlides[activeSlideIndex]?.visual_text || ""}
                          onChange={(e) => handleUpdateSlide(activeSlideIndex, "visual_text", e.target.value)}
                          placeholder="e.g. Infographic diagram, split comparison, client quote card..."
                          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #c7d2fe", fontSize: "0.82rem", outline: "none" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 3 }}>
                          Slide {activeSlideIndex + 1} Inside Content Text (Text on slide):
                        </label>
                        <textarea
                          rows={2}
                          value={carouselSlides[activeSlideIndex]?.content_text || ""}
                          onChange={(e) => handleUpdateSlide(activeSlideIndex, "content_text", e.target.value)}
                          placeholder="e.g. Headline on slide, bullet points, statistics, or actionable advice..."
                          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #c7d2fe", fontSize: "0.82rem", outline: "none", resize: "vertical" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#3730a3", marginBottom: 4 }}>
                      CTA (Call to Action on final slide)
                    </label>
                    <input
                      type="text"
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                      placeholder="e.g. Save for later | Comment 'SLIDES' to get the free template"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #c7d2fe", fontSize: "0.85rem", outline: "none", background: "#fff" }}
                    />
                  </div>

                  {/* Logo, Client Assets & Multi-Select Integration */}
                  {renderClientAssetsSelector({
                    labelColor: "#3730a3",
                    accentColor: "#4f46e5",
                    borderColor: "#c7d2fe",
                    bgLight: "#f5f3ff",
                  })}
                </>
              )}

              {/* -------------------------------------------------------- */}
              {/* CASE 3: VIDEOS / REEL                                   */}
              {/* -------------------------------------------------------- */}
              {format === "video" && (
                <>
                  {/* Duration of the video */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                      Duration of the video *
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                      {["15s", "30s", "60s", "90s"].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          style={{
                            padding: "6px",
                            borderRadius: 8,
                            border: duration === d ? "1.5px solid #e11d48" : "1px solid #fecdd3",
                            background: duration === d ? "#e11d48" : "#ffffff",
                            color: duration === d ? "#ffffff" : "#9f1239",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtype A: Clips from client / anchoring clip */}
                  {videoType === "clips" && (
                    <>
                      {/* Music Reference */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                          Music Reference (Audio track / mood) *
                        </label>
                        <div style={{ position: "relative" }}>
                          <Music2 size={14} color="#e11d48" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                          <input
                            type="text"
                            value={musicReference}
                            onChange={(e) => setMusicReference(e.target.value)}
                            placeholder="e.g. Trending upbeat instrumental / Spotify link / sound name"
                            style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8, border: "1px solid #fda4af", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                          />
                        </div>
                      </div>

                      {/* Clips */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                          Clips (Raw Footage link / Cloud Drive URL) *
                        </label>
                        <input
                          type="text"
                          value={clips}
                          onChange={(e) => setClips(e.target.value)}
                          placeholder="e.g. Google Drive folder link, Dropbox, or raw clip URL..."
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fda4af", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                        />
                      </div>

                      {/* Texts */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                          Texts (On-screen text overlays, captions, hooks) *
                        </label>
                        <textarea
                          rows={3}
                          value={clipTexts}
                          onChange={(e) => setClipTexts(e.target.value)}
                          placeholder="e.g. [0:00-0:03] 'The #1 Mistake Clinics Make' | [0:10] Bold stat '80% Patients Search Online' | [0:25] 'Call now to consult'..."
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fda4af", fontSize: "0.84rem", outline: "none", background: "#fff", resize: "vertical" }}
                        />
                      </div>

                      {/* Logo, Client Assets & Multi-Select Integration */}
                      {renderClientAssetsSelector({
                        labelColor: "#9f1239",
                        accentColor: "#e11d48",
                        borderColor: "#fda4af",
                        bgLight: "#fff1f2",
                      })}
                    </>
                  )}

                  {/* Subtype B & C: AI Videos Generation OR Motion Graphics */}
                  {(videoType === "ai" || videoType === "motion_graphics") && (
                    <>
                      {/* Music Reference and video or images */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                          Music Reference and video or images *
                        </label>
                        <input
                          type="text"
                          value={musicReference}
                          onChange={(e) => setMusicReference(e.target.value)}
                          placeholder={
                            videoType === "ai"
                              ? "e.g. Cyberpunk cinematic synthwave + style reference images drive link"
                              : "e.g. Modern electronic tech beat with swoosh SFX + brand vector graphics link"
                          }
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fda4af", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                        />
                      </div>

                      {/* Multiple scenes visual content text + inside contents texts */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "#9f1239" }}>
                            Multiple scenes & on-screen content ({scenes.length} Scenes)
                          </label>
                          <button
                            type="button"
                            onClick={handleAddScene}
                            disabled={scenes.length >= 8}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              background: "#e11d48",
                              color: "#fff",
                              border: "none",
                              padding: "4px 9px",
                              borderRadius: 6,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={12} /> Add Scene
                          </button>
                        </div>

                        {/* Scene tabs */}
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                          {scenes.map((sc, idx) => {
                            const isCurrent = activeSceneIndex === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveSceneIndex(idx)}
                                style={{
                                  padding: "4px 9px",
                                  borderRadius: 6,
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  border: isCurrent ? "1.5px solid #e11d48" : "1px solid #fecdd3",
                                  background: isCurrent ? "#e11d48" : "#ffffff",
                                  color: isCurrent ? "#ffffff" : "#9f1239",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                Scene {idx + 1} ({sc.duration})
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Scene Editor Box */}
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1.5px solid #fda4af",
                            borderRadius: 10,
                            padding: 12,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#9f1239" }}>
                                Scene {activeSceneIndex + 1} Details
                              </span>
                              <input
                                type="text"
                                value={scenes[activeSceneIndex]?.duration || "5s"}
                                onChange={(e) => handleUpdateScene(activeSceneIndex, "duration", e.target.value)}
                                style={{ width: 60, padding: "2px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: "0.72rem", textAlign: "center" }}
                              />
                            </div>
                            {scenes.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveScene(activeSceneIndex)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                  background: "none",
                                  border: "none",
                                  color: "#ef4444",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={12} /> Remove Scene
                              </button>
                            )}
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 3 }}>
                              Scene {activeSceneIndex + 1} Visual Content Text (Visual prompt / Animation style):
                            </label>
                            <input
                              type="text"
                              value={scenes[activeSceneIndex]?.visual_text || ""}
                              onChange={(e) => handleUpdateScene(activeSceneIndex, "visual_text", e.target.value)}
                              placeholder="e.g. AI prompt or motion animation description for this scene..."
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #fecdd3", fontSize: "0.82rem", outline: "none" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 3 }}>
                              Inside Contents Texts for Every Scene (Voiceover / On-screen text):
                            </label>
                            <textarea
                              rows={2}
                              value={scenes[activeSceneIndex]?.content_text || ""}
                              onChange={(e) => handleUpdateScene(activeSceneIndex, "content_text", e.target.value)}
                              placeholder="e.g. Dialogue narration, kinetic headline text, or voiceover script for this scene..."
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #fecdd3", fontSize: "0.82rem", outline: "none", resize: "vertical" }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Logo, Client Assets & Multi-Select Integration */}
                      {renderClientAssetsSelector({
                        labelColor: "#9f1239",
                        accentColor: "#e11d48",
                        borderColor: "#fda4af",
                        bgLight: "#fff1f2",
                      })}
                    </>
                  )}
                </>
              )}
            </div>

            {/* ============================================================ */}
            {/* RIGHT COLUMN: FOR POSTING (Publishing Copy & Metadata)       */}
            {/* ============================================================ */}
            <div
              style={{
                background: "#f0f9ff",
                border: "1.5px solid #bae6fd",
                borderRadius: 14,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Section Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#0284c7",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Send size={15} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#0c4a6e" }}>
                    For Posting Content
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "#0369a1",
                  }}
                >
                  Social Feed Metadata
                </span>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>
                  Title (Internal Title / Campaign Identifier) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    format === "poster"
                      ? "e.g. Q3 Cloud Scalability Banner #1"
                      : format === "carousel"
                      ? "e.g. 5 Growth Marketing Mistakes Carousel"
                      : "e.g. 30s Reel: AI Agency Workflow Automation"
                  }
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #7dd3fc", fontSize: "0.85rem", outline: "none", background: "#fff" }}
                />
              </div>

              {/* Description */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "#0369a1" }}>
                    Description (Social Caption / Post Body) *
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                    {description.length} chars
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write the full social post copy, caption narrative, bullet points, and engagement question (English or Malayalam)..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #7dd3fc", fontSize: "0.85rem", outline: "none", background: "#fff", resize: "vertical", lineHeight: 1.5 }}
                />
              </div>

              {/* Location & Hashtags */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>
                    Location (Location Tag)
                  </label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={14} color="#0284c7" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Infopark Kochi, Kerala"
                      style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8, border: "1px solid #7dd3fc", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>
                    Hashtag (Comma or space separated)
                  </label>
                  <div style={{ position: "relative" }}>
                    <Hash size={14} color="#0284c7" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      placeholder="#AdstraDigital #MarketingAgency #BusinessGrowth #KochiBusiness"
                      style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8, border: "1px solid #7dd3fc", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                    />
                  </div>
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#0369a1", marginBottom: 5 }}>
                  Script Priority
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {[
                    { id: "urgent", label: "Urgent", color: "#dc2626", bg: "#fef2f2" },
                    { id: "high", label: "High", color: "#ea580c", bg: "#fff7ed" },
                    { id: "medium", label: "Medium", color: "#0284c7", bg: "#f0f9ff" },
                    { id: "low", label: "Low", color: "#16a34a", bg: "#f0fdf4" },
                  ].map((pr) => {
                    const isSelected = priority === pr.id;
                    return (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => setPriority(pr.id)}
                        style={{
                          padding: "6px 4px",
                          borderRadius: 6,
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: isSelected ? `1.5px solid ${pr.color}` : "1px solid #cbd5e1",
                          background: isSelected ? pr.bg : "#ffffff",
                          color: isSelected ? pr.color : "#64748b",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {pr.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div
          className="social-modal-footer"
          style={{
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Save as Script Draft */}
            <button
              onClick={() => handleSubmit("script")}
              disabled={submitting}
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                border: "1px solid #c7d2fe",
                background: "#f5f3ff",
                color: "#4f46e5",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Save size={15} />
              {submitting ? "Saving..." : "Save as Script Draft"}
            </button>

            {/* Submit for Script Approval */}
            <button
              onClick={() => handleSubmit("script_approval")}
              disabled={submitting}
              style={{
                padding: "9px 22px",
                borderRadius: 10,
                border: "none",
                background: "#4f46e5",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
              }}
            >
              <Send size={15} />
              {submitting ? "Submitting..." : "Submit for Script Approval →"}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ASSET PICKER MODAL: MULTI-SELECT CLIENT ASSETS               */}
      {/* ============================================================ */}
      {assetPickerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setAssetPickerOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 960,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#e0e7ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderArchive size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                      Select Assets for {selectedClient?.name || "Client"}
                    </h3>
                    <span
                      style={{
                        background: "#e0e7ff",
                        color: "#4338ca",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: "0.72rem",
                        fontWeight: 800,
                      }}
                    >
                      {selectedAssetIds.length} Selected
                    </span>
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 2 }}>
                    Multi-select logos, guidelines, creatives, and media files to provide directly to the design team
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssetPickerOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter, Search & Bulk Actions Bar */}
            <div
              style={{
                padding: "12px 22px",
                borderBottom: "1px solid #f1f5f9",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {/* Search Input */}
                <div style={{ position: "relative", flex: "1 1 240px" }}>
                  <Search
                    size={15}
                    color="#94a3b8"
                    style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    type="text"
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    placeholder="Search by title, tag, or folder..."
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 32px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.82rem",
                      outline: "none",
                    }}
                  />
                  {assetSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAssetSearchQuery("")}
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Format Filter Dropdown */}
                <select
                  value={assetTypeFilter}
                  onChange={(e) => setAssetTypeFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.82rem",
                    outline: "none",
                    background: "#fff",
                    color: "#334155",
                    fontWeight: 600,
                  }}
                >
                  <option value="all">All Formats</option>
                  <option value="logo">Brand Logos</option>
                  <option value="image">Images & Creatives</option>
                  <option value="reel">Reels & Videos</option>
                  <option value="video">Videos</option>
                  <option value="carousel">Carousel Assets</option>
                  <option value="document">Documents & PDFs</option>
                </select>

                {/* Quick Selection Buttons */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleSelectAllFiltered(filteredModalAssets)}
                    disabled={filteredModalAssets.length === 0}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "1px solid #c7d2fe",
                      background: "#e0e7ff",
                      color: "#4338ca",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: filteredModalAssets.length === 0 ? "not-allowed" : "pointer",
                      opacity: filteredModalAssets.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Select All ({filteredModalAssets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeselectAllFiltered(filteredModalAssets)}
                    disabled={filteredModalAssets.length === 0}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#64748b",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Deselect
                  </button>
                </div>
              </div>

              {/* Folder Filter Pills */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  paddingBottom: 4,
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => setAssetFolderFilter("all")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: assetFolderFilter === "all" ? "1.5px solid #4f46e5" : "1px solid #e2e8f0",
                    background: assetFolderFilter === "all" ? "#4f46e5" : "#f8fafc",
                    color: assetFolderFilter === "all" ? "#ffffff" : "#475569",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  All Folders ({clientAssets.length})
                </button>
                {availableFolders.map((folder) => {
                  const count = clientAssets.filter((a) => a.folder === folder).length;
                  const isSelected = assetFolderFilter === folder;
                  return (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => setAssetFolderFilter(folder)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        border: isSelected ? "1.5px solid #4f46e5" : "1px solid #e2e8f0",
                        background: isSelected ? "#4f46e5" : "#f8fafc",
                        color: isSelected ? "#ffffff" : "#475569",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Folder size={12} /> {folder} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assets Grid List */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 18,
                background: "#f8fafc",
                minHeight: 280,
                maxHeight: 460,
              }}
            >
              {loadingAssets ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Loading client assets...</div>
                </div>
              ) : filteredModalAssets.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <Boxes size={36} color="#94a3b8" style={{ margin: "0 auto 10px auto" }} />
                  <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1e293b" }}>
                    No Assets Found
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 4 }}>
                    {clientAssets.length === 0
                      ? `${selectedClient?.name || "Client"} does not have any assets uploaded yet in Client Assets Storage.`
                      : "No assets match your search or filter criteria. Try resetting filters."}
                  </div>
                  {clientAssets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssetSearchQuery("");
                        setAssetFolderFilter("all");
                        setAssetTypeFilter("all");
                      }}
                      style={{
                        marginTop: 12,
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#4f46e5",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  {filteredModalAssets.map((asset) => {
                    const isSelected = selectedAssetIds.includes(asset.id);
                    const previewUrl = asset.file_url || asset.file;
                    const isVideo = asset.asset_type === "reel" || asset.asset_type === "video";
                    return (
                      <div
                        key={asset.id}
                        onClick={() => handleToggleAsset(asset.id)}
                        style={{
                          background: "#ffffff",
                          borderRadius: 10,
                          border: isSelected ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                          overflow: "hidden",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          boxShadow: isSelected
                            ? "0 4px 12px rgba(79, 70, 229, 0.18)"
                            : "0 1px 3px rgba(0, 0, 0, 0.05)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Checkbox badge overlay */}
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 10,
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: isSelected ? "none" : "2px solid #cbd5e1",
                            background: isSelected ? "#4f46e5" : "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                        </div>

                        {/* Format tag badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            zIndex: 10,
                            background: "rgba(15, 23, 42, 0.75)",
                            backdropFilter: "blur(2px)",
                            color: "#ffffff",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: "0.62rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {asset.asset_type || "asset"}
                        </div>

                        {/* Thumbnail / Preview container */}
                        <div
                          style={{
                            width: "100%",
                            height: 110,
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          {previewUrl && !isVideo ? (
                            <img
                              src={previewUrl}
                              alt={asset.title}
                              style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                            />
                          ) : previewUrl && isVideo ? (
                            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                              <video
                                src={previewUrl}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                muted
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "rgba(0,0,0,0.3)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Video size={24} color="#ffffff" />
                              </div>
                            </div>
                          ) : (
                            <FileText size={32} color="#94a3b8" />
                          )}
                        </div>

                        {/* Asset Info */}
                        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
                          <div
                            title={asset.title}
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              color: "#1e293b",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {asset.title}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.68rem", color: "#64748b" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <Folder size={11} /> {asset.folder || "General"}
                            </span>
                            {asset.file_format && (
                              <span style={{ fontWeight: 700, textTransform: "uppercase" }}>
                                {asset.file_format}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div
              style={{
                padding: "14px 22px",
                borderTop: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
                  {selectedAssetIds.length} asset{selectedAssetIds.length === 1 ? "" : "s"} selected
                </span>
                {selectedAssetIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedAssetIds([])}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setAssetPickerOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setAssetPickerOpen(false)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#4f46e5",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  Attach Selected Assets ({selectedAssetIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
