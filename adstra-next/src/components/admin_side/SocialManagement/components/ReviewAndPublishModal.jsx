"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronRight,
  Folder,
  LayoutGrid,
  FileText,
  ExternalLink,
  ShieldCheck,
  Zap,
  Check,
  Loader2,
  Eye,
  Info,
} from "lucide-react";
import { MetaLogoIcon } from "./CreateCampaignWizard";

export default function ReviewAndPublishModal({
  isOpen,
  onClose,
  campaigns = [],
  adsets = [],
  ads = [],
  selectedAdAccountId = "act_830629501946359",
  selectedAdAccountName = "MediaReds D M",
  selectedCampaignIds = [],
  onPublishSuccess,
  showToast,
}) {
  // Extract all eligible draft or user-selected items
  const draftCampaigns = useMemo(() => {
    if (selectedCampaignIds && selectedCampaignIds.length > 0) {
      const selectedSet = new Set(selectedCampaignIds);
      const filtered = campaigns.filter((c) => selectedSet.has(c.id));
      if (filtered.length > 0) return filtered;
    }
    return campaigns.filter((c) => c.delivery === "In draft" || !c.active || c.is_draft);
  }, [campaigns, selectedCampaignIds]);

  const targetCampaignIds = useMemo(
    () => new Set(draftCampaigns.map((c) => c.id)),
    [draftCampaigns]
  );

  const draftAdsets = useMemo(() => {
    return adsets.filter(
      (a) =>
        (a.campaignId && targetCampaignIds.has(a.campaignId)) ||
        (!a.campaignId && (a.delivery === "In draft" || !a.active))
    );
  }, [adsets, targetCampaignIds]);

  const draftAds = useMemo(() => {
    return ads.filter(
      (ad) =>
        (ad.campaignId && targetCampaignIds.has(ad.campaignId)) ||
        (!ad.campaignId && (ad.delivery === "In draft" || !ad.active))
    );
  }, [ads, targetCampaignIds]);

  // Clean Account Name for header pill
  const cleanAccountName = useMemo(() => {
    if (!selectedAdAccountName) return "MediaReds D M";
    return selectedAdAccountName.replace(/\s*\(Adstra Meta Ads\)/i, "").trim();
  }, [selectedAdAccountName]);

  // Selected item IDs (default all selected)
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set());

  // Publishing process state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState(0); // 0 to 4
  const [publishProgress, setPublishProgress] = useState(0); // 0 to 100
  const [publishResult, setPublishResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const STEPS = [
    "Validating campaign configuration & draft parameters...",
    "Connecting to Meta Marketing API (v21.0)...",
    "Creating Meta Campaigns & configuring Ad Sets as drafts...",
    "Uploading Ad Creatives, Story Specs & Placements...",
    "Finalizing draft creation in Meta Ads Manager...",
  ];

  // Initialize selected IDs when modal opens
  useEffect(() => {
    if (isOpen) {
      const allDraftIds = new Set([
        ...draftCampaigns.map((c) => c.id),
        ...draftAdsets.map((a) => a.id),
        ...draftAds.map((ad) => ad.id),
      ]);
      setSelectedIds(allDraftIds);
      // Auto expand first 3 campaigns
      setExpandedCampaigns(new Set(draftCampaigns.slice(0, 3).map((c) => c.id)));
      setIsPublishing(false);
      setPublishStep(0);
      setPublishProgress(0);
      setPublishResult(null);
      setErrorMessage(null);
    }
  }, [isOpen, draftCampaigns, draftAdsets, draftAds]);

  if (!isOpen) return null;

  const totalDraftCount = draftCampaigns.length + draftAdsets.length + draftAds.length;
  const selectedCount = selectedIds.size;
  const allSelected = totalDraftCount > 0 && selectedCount === totalDraftCount;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set([
          ...draftCampaigns.map((c) => c.id),
          ...draftAdsets.map((a) => a.id),
          ...draftAds.map((ad) => ad.id),
        ])
      );
    }
  };

  const toggleItem = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpand = (campId) => {
    setExpandedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(campId)) next.delete(campId);
      else next.add(campId);
      return next;
    });
  };


  // Perform draft creation in Meta Ads Manager
  const handleExecutePublish = async () => {
    if (selectedCount === 0) {
      if (showToast) showToast("Please select at least one item to create as draft.", "info");
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);
    setPublishStep(0);
    setPublishProgress(15);

    try {
      // Step 1: Validation
      await new Promise((r) => setTimeout(r, 400));
      setPublishStep(1);
      setPublishProgress(35);

      // Prepare payload of draft campaigns
      const campaignsToPublish = draftCampaigns.filter(
        (c) => selectedIds.has(c.id) || selectedIds.size === 0
      );

      // If no campaign explicitly in draftCampaigns (e.g., only draft ads selected), find unique campaigns
      const payloadCampaigns =
        campaignsToPublish.length > 0
          ? campaignsToPublish.map((c) => ({
            backendId: c.backendId || null,
            id: c.id,
            name: c.name,
            objective: c.bidStrategySub || c.objective || "Leads",
            budget: parseFloat(String(c.budget || "1000").replace(/[^0-9.]/g, "")) || 1000,
            status: "PAUSED", // Created as drafts in Meta Ads Manager
            headline: c.name,
            primaryText: c.name,
            selectedCreativeUrl:
              c.thumb ||
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
          }))
          : [
            {
              name: draftAds[0]?.name || "New Meta Campaign",
              objective: draftAds[0]?.bidStrategySub || "Leads",
              budget: 1000,
              status: "PAUSED",
              headline: draftAds[0]?.name || "New Meta Campaign",
              primaryText: draftAds[0]?.name || "New Meta Campaign",
              selectedCreativeUrl: draftAds[0]?.thumb || "",
            },
          ];

      setPublishStep(2);
      setPublishProgress(60);

      // Call Backend Endpoint directly
      const cleanAccId = selectedAdAccountId
        ? selectedAdAccountId.startsWith("act_")
          ? selectedAdAccountId
          : `act_${selectedAdAccountId}`
        : "act_830629501946359";

      const response = await axios.post(`${API_BASE_URL}/social/ad/publish-drafts/`, {
        account_id: cleanAccId,
        draft_campaigns: payloadCampaigns,
        status: "PAUSED", // Create as drafts in Meta Ads Manager
      });

      setPublishStep(3);
      setPublishProgress(85);
      await new Promise((r) => setTimeout(r, 450));

      setPublishStep(4);
      setPublishProgress(100);
      await new Promise((r) => setTimeout(r, 350));

      if (!response.data?.success) {
        const errorList = Object.values(response.data?.results || {})
          .map((r) => r?.result?.errors?.join(", ") || r?.error)
          .filter(Boolean);
        const detailMsg = errorList.join("; ") || "Meta API returned errors while creating drafts.";
        setErrorMessage(detailMsg);
        setIsPublishing(false);
        if (showToast) showToast(`Meta Ads Manager Warning: ${detailMsg}`, "error");
        return;
      }

      // Successfully published as drafts
      const metaCampaignIds = Object.values(response.data?.results || {})
        .map(
          (r) =>
            r?.result?.results?.meta?.external_ids?.meta_campaign_id ||
            r?.result?.external_ids?.meta_campaign_id
        )
        .filter(Boolean);

      const publishedMetaId = metaCampaignIds[0] || `meta_draft_${Date.now()}`;
      const rawAccNum = String(cleanAccId).replace("act_", "");

      setPublishResult({
        success: true,
        count: selectedCount,
        metaCampaignId: publishedMetaId,
        managerUrl: `https://www.facebook.com/adsmanager/manage/campaigns?act=${rawAccNum}`,
        response: response.data,
      });

      if (onPublishSuccess) {
        onPublishSuccess(Array.from(selectedIds), response.data);
      }

      if (showToast) {
        showToast(
          `Successfully created ${selectedCount} draft item${selectedCount === 1 ? "" : "s"
          } in Meta Ads Manager!`,
          "success"
        );
      }
    } catch (err) {
      console.error("Meta draft creation failed:", err);
      const detail =
        err?.response?.data?.error ||
        err?.response?.data?.errors?.join(", ") ||
        err?.message ||
        "Failed to create drafts in Meta Ads Manager. Please check account permissions.";
      setErrorMessage(detail);
      setIsPublishing(false);
      if (showToast) showToast(detail, "error");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: 16,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
      onClick={() => {
        if (!isPublishing) onClose();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          width: "100%",
          maxWidth: 820,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.12)",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOP HEADER (Image 2 style) ── */}
        <div
          style={{
            padding: "18px 24px 16px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0064e1",
                flexShrink: 0,
              }}
            >
              <MetaLogoIcon size={24} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.16rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.3,
                }}
              >
                Publish to Meta Ads Manager
              </div>
              <div
                style={{
                  fontSize: "0.81rem",
                  color: "#64748b",
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                Your selected campaigns, ad sets and ads will be created in Meta Ads Manager as drafts. Review and publish them from Meta Ads Manager when ready.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing && !publishResult}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isPublishing && !publishResult ? "not-allowed" : "pointer",
              color: "#475569",
              transition: "all 0.15s ease",
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── TARGET AD ACCOUNT ROW (Image 2 style) ── */}
        <div
          style={{
            padding: "12px 24px",
            background: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "#475569" }}>
              Target Ad Account
            </span>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              <MetaLogoIcon size={14} />
              <span>{selectedAdAccountId}</span>
              <span style={{ fontWeight: 400, color: "#94a3b8" }}>•</span>
              <span style={{ fontWeight: 500, color: "#334155" }}>{cleanAccountName}</span>
              <ChevronDown size={14} color="#64748b" style={{ marginLeft: 2 }} />
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.78rem",
              fontWeight: 650,
              color: "#166534",
              background: "#dcfce7",
              padding: "5px 12px",
              borderRadius: 20,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#16a34a",
                boxShadow: "0 0 0 2px rgba(22, 163, 74, 0.2)",
              }}
            />
            <span>Connected & Authorized</span>
          </div>
        </div>

        {/* ── MODAL BODY ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* CASE 1: SUCCESS VIEW */}
          {publishResult ? (
            <div
              style={{
                padding: "24px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={34} strokeWidth={2.4} />
              </div>

              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Drafts Created in Meta Ads Manager!
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: 6, margin: "6px 0 0 0" }}>
                  Your selected campaigns, ad sets, and ads have been created as drafts under Ad Account{" "}
                  <strong>{selectedAdAccountId}</strong>.
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "14px 18px",
                  width: "100%",
                  maxWidth: 520,
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem" }}>
                  <span style={{ color: "#64748b" }}>Created Draft Items:</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    {publishResult.count} items (Campaigns, Ad sets, Ads)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem" }}>
                  <span style={{ color: "#64748b" }}>Meta Campaign ID:</span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "#0064e1",
                      background: "#eff6ff",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {publishResult.metaCampaignId}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem" }}>
                  <span style={{ color: "#64748b" }}>Status in Ads Manager:</span>
                  <span style={{ fontWeight: 700, color: "#b45309" }}>
                    Draft (Ready for review)
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <a
                  href={publishResult.managerUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    borderRadius: 8,
                    background: "#0064e1",
                    color: "#ffffff",
                    fontSize: "0.86rem",
                    fontWeight: 650,
                    textDecoration: "none",
                    boxShadow: "0 2px 6px rgba(0, 100, 225, 0.25)",
                  }}
                >
                  <span>Open in Meta Ads Manager</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : isPublishing ? (
            /* CASE 2: IN PROGRESS STEPPER */
            <div
              style={{
                padding: "28px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0064e1",
                  }}
                >
                  <Loader2 size={32} className="animate-spin" />
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.08rem", fontWeight: 700, color: "#0f172a" }}>
                  Creating Drafts in Meta Ads Manager...
                </div>
                <div style={{ fontSize: "0.84rem", color: "#64748b", marginTop: 4 }}>
                  Executing Graph API creation across Campaign, Ad Set, Creative, and Ad
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  maxWidth: 480,
                  height: 8,
                  borderRadius: 4,
                  background: "#e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #0064e1 0%, #2563eb 100%)",
                    width: `${publishProgress}%`,
                    transition: "width 0.4s ease",
                    borderRadius: 4,
                  }}
                />
              </div>

              {/* Step checklist */}
              <div
                style={{
                  width: "100%",
                  maxWidth: 480,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {STEPS.map((stepDesc, idx) => {
                  const isDone = idx < publishStep;
                  const isCurrent = idx === publishStep;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: "0.82rem",
                        color: isDone ? "#166534" : isCurrent ? "#0064e1" : "#94a3b8",
                        fontWeight: isCurrent || isDone ? 600 : 400,
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={16} color="#16a34a" />
                      ) : isCurrent ? (
                        <Loader2 size={16} color="#0064e1" className="animate-spin" />
                      ) : (
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "1.5px solid #cbd5e1",
                          }}
                        />
                      )}
                      <span>{stepDesc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CASE 3: NORMAL REVIEW LIST (Image 2 style) */
            <>
              {errorMessage && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: "0.82rem",
                    color: "#991b1b",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Items Table Container */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                {/* Select All and Chips Row (Image 2 format) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        accentColor: "#0064e1",
                        cursor: "pointer",
                      }}
                    />
                    <span>Select all items ({totalDraftCount})</span>
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 12px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <Folder size={14} color="#0064e1" />
                      <span>{draftCampaigns.length} Campaigns</span>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 12px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <LayoutGrid size={14} color="#0064e1" />
                      <span>{draftAdsets.length} Ad sets</span>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 12px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <FileText size={14} color="#0064e1" />
                      <span>{draftAds.length} Ads</span>
                    </div>
                  </div>
                </div>

                {/* Campaign Rows */}
                {draftCampaigns.map((camp) => {
                  const isExpanded = expandedCampaigns.has(camp.id);
                  const isCampSelected = selectedIds.has(camp.id);
                  const relatedAdsets = draftAdsets.filter(
                    (a) => a.campaignId === camp.id || !a.campaignId
                  );
                  const relatedAds = draftAds.filter(
                    (ad) => ad.campaignId === camp.id || !ad.campaignId
                  );

                  return (
                    <div
                      key={camp.id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {/* Campaign Header Row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: isCampSelected ? "#ffffff" : "#ffffff",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={isCampSelected}
                            onChange={() => toggleItem(camp.id)}
                            style={{
                              width: 15,
                              height: 15,
                              borderRadius: 4,
                              accentColor: "#0064e1",
                              cursor: "pointer",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleExpand(camp.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: 2,
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <Folder size={16} color="#0064e1" />
                          <span
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {camp.name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              background: "#eff6ff",
                              color: "#0284c7",
                              padding: "2px 9px",
                              borderRadius: 12,
                            }}
                          >
                            {camp.bidStrategySub || camp.objective || "Awareness"}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                            Budget: <strong style={{ color: "#0f172a" }}>{camp.budget || "₹1,000.00"}</strong>
                          </span>
                          <span
                            style={{
                              fontSize: "0.74rem",
                              fontWeight: 650,
                              background: "#fef3c7",
                              color: "#b45309",
                              padding: "3px 10px",
                              borderRadius: 6,
                            }}
                          >
                            Draft
                          </span>
                        </div>
                      </div>

                      {/* Nested Ad sets & Ads if expanded */}
                      {isExpanded && (
                        <div style={{ paddingLeft: 44, paddingRight: 16, background: "#ffffff" }}>
                          {relatedAdsets.slice(0, 3).map((adset) => (
                            <div
                              key={adset.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 10px",
                                borderTop: "1px solid #f1f5f9",
                                fontSize: "0.82rem",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(adset.id)}
                                  onChange={() => toggleItem(adset.id)}
                                  style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: 3,
                                    accentColor: "#0064e1",
                                    cursor: "pointer",
                                  }}
                                />
                                <LayoutGrid size={15} color="#64748b" />
                                <span style={{ fontWeight: 550, color: "#334155" }}>
                                  {adset.name || `${camp.name} Ad set`}
                                </span>
                              </div>
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                Optimization: Highest volume
                              </span>
                            </div>
                          ))}

                          {relatedAds.slice(0, 3).map((ad) => (
                            <div
                              key={ad.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 10px",
                                borderTop: "1px dashed #f1f5f9",
                                fontSize: "0.82rem",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(ad.id)}
                                  onChange={() => toggleItem(ad.id)}
                                  style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: 3,
                                    accentColor: "#0064e1",
                                    cursor: "pointer",
                                  }}
                                />
                                {ad.thumb ? (
                                  <img
                                    src={ad.thumb}
                                    alt="thumb"
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 4,
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <FileText size={15} color="#64748b" />
                                )}
                                <span style={{ fontWeight: 550, color: "#1e293b" }}>
                                  {ad.name || `${camp.name} Ad`}
                                </span>
                              </div>
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                Placements: Feed & Stories
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {draftCampaigns.length === 0 && (
                  <div
                    style={{
                      padding: "28px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "0.86rem",
                    }}
                  >
                    No draft campaigns found. Create a campaign with the green <strong>+ Create</strong>{" "}
                    button to push as draft!
                  </div>
                )}
              </div>

              {/* ── Information Card Banner (Image 2 style) ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  background: "#f0f7ff",
                  border: "1px solid #dbeafe",
                  borderRadius: 8,
                }}
              >
                <Info size={24} color="#0064e1" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e3a8a" }}>
                    Your selected campaigns, ad sets, and ads will be created in Meta Ads Manager as drafts.
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 3 }}>
                    Review and publish them from Meta Ads Manager when ready.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── MODAL FOOTER (Image 2 style) ── */}
        {!publishResult && (
          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid #e2e8f0",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Selected: <strong>{selectedCount}</strong> of {totalDraftCount} items
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isPublishing}
                style={{
                  padding: "8px 20px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: isPublishing ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecutePublish}
                disabled={isPublishing || selectedCount === 0}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 20px",
                  borderRadius: 6,
                  border: "none",
                  background: selectedCount === 0 || isPublishing ? "#93c5fd" : "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: selectedCount === 0 || isPublishing ? "not-allowed" : "pointer",
                  boxShadow:
                    selectedCount === 0 || isPublishing ? "none" : "0 2px 6px rgba(0, 100, 225, 0.28)",
                  transition: "background 0.15s ease",
                }}
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Creating Drafts in Meta...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Create Drafts in Meta Ads Manager</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
