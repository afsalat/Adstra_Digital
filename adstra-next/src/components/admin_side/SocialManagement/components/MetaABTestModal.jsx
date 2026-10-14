"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  LayoutGrid,
  Info,
  Plus,
  Search,
  ArrowLeft,
} from "lucide-react";

export default function MetaABTestModal({
  isOpen,
  onClose,
  campaigns = [],
  adsets = [],
  ads = [],
  selectedAd = null,
  onLaunchTest,
}) {
  // Navigation Steps:
  // 1 = Meta Intro Screen ("Help improve ad performance with A/B testing")
  // 2 = Ad Setup ("Start by setting up an ad to test against the one you selected" - Image 1)
  // 3 = Variable Selection & Which Ad to Copy (If "Make a copy of this ad" selected)
  // 4 = Compare Existing Campaigns or Ad Sets (If "Pick another existing ad" selected - Images 2 & 3)
  // 5 = Test Settings & Schedule ("Select test settings" & Launch)
  const [step, setStep] = useState(1);

  // Step 2 state: Setup Method (Image 1)
  // "copy" = Make a copy of this ad, "existing" = Pick another existing ad
  const [setupMode, setSetupMode] = useState("copy");
  const [selectedAdForTest, setSelectedAdForTest] = useState(null);
  const [adDropdownOpen, setAdDropdownOpen] = useState(false);

  // Step 3 state: Variable to test (Images 2, 3, 4)
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [variableDropdownOpen, setVariableDropdownOpen] = useState(false);
  const [variableMenuSubview, setVariableMenuSubview] = useState(null); // null = main, "recommended" = submenu
  const [variableSearch, setVariableSearch] = useState("");
  const [recommendedSearch, setRecommendedSearch] = useState("");
  const [selectedCopyAd, setSelectedCopyAd] = useState(null);
  const [copyAdDropdownOpen, setCopyAdDropdownOpen] = useState(false);

  // Step 4 state: Compare Existing Flow (Images 1 & 2)
  // compareType: "campaigns" = Existing campaigns (Image 1), "adsets" = Existing ad sets (Image 2)
  const [compareType, setCompareType] = useState("campaigns");
  // Slots array matching Image 1 & 2
  const [compareSlots, setCompareSlots] = useState([
    { id: "slot-A", label: "A", value: "", search: "", open: false, adValue: "" },
    { id: "slot-B", label: "B", value: "", search: "", open: false, adValue: "" },
  ]);

  // Step 5 state: Test Settings
  const [testName, setTestName] = useState("");
  const [keyMetric, setKeyMetric] = useState("cost_per_result");
  const [startDate, setStartDate] = useState("2026-09-29");
  const [endDate, setEndDate] = useState("2026-10-06");
  const [endEarlyIfWinner, setEndEarlyIfWinner] = useState(true);

  // Dropdown Refs for Click Outside
  const adDropdownRef = useRef(null);
  const variableDropdownRef = useRef(null);
  const copyAdDropdownRef = useRef(null);
  const slotsContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (adDropdownRef.current && !adDropdownRef.current.contains(e.target)) {
        setAdDropdownOpen(false);
      }
      if (variableDropdownRef.current && !variableDropdownRef.current.contains(e.target)) {
        setVariableDropdownOpen(false);
        setVariableMenuSubview(null);
      }
      if (copyAdDropdownRef.current && !copyAdDropdownRef.current.contains(e.target)) {
        setCopyAdDropdownOpen(false);
      }
      if (slotsContainerRef.current && !slotsContainerRef.current.contains(e.target)) {
        setCompareSlots((prev) => prev.map((s) => ({ ...s, open: false })));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Available campaigns list
  const defaultCampaignList = [
    { id: "camp-traffic", name: "Traffic campaign" },
    { id: "camp-awareness", name: "New Awareness campaign" },
    { id: "camp-leads", name: "New Leads campaign" },
    { id: "camp-festive", name: "Apple Festive Cashback Drive" },
    { id: "camp-engagement", name: "LifeGuard Plus Engagement" },
    { id: "camp-homeshield", name: "HomeShield Q3 Lead Gen" },
  ];

  const allCampaigns = useMemo(() => {
    const list = [...defaultCampaignList];
    if (campaigns && campaigns.length > 0) {
      campaigns.forEach((c) => {
        if (!list.some((existing) => existing.name === c.name)) {
          list.push({ id: c.id || `camp-${Math.random()}`, name: c.name });
        }
      });
    }
    return list;
  }, [campaigns]);

  // Available ad sets list
  const defaultAdsetList = [
    { id: "adset-cms", name: "CMS 9/7/2026 Adset" },
    { id: "adset-instagram", name: "Instagram Post Ad Set" },
    { id: "adset-awareness", name: "New Awareness ad set" },
    { id: "adset-leads", name: "New Leads ad set" },
    { id: "adset-retargeting", name: "Retargeting High Intent Ad Set" },
    { id: "adset-lookalike", name: "Lookalike 1% Top Spenders Ad Set" },
  ];

  const allAdsets = useMemo(() => {
    const list = [...defaultAdsetList];
    if (adsets && adsets.length > 0) {
      adsets.forEach((a) => {
        if (!list.some((existing) => existing.name === a.name)) {
          list.push({ id: a.id || `adset-${Math.random()}`, name: a.name });
        }
      });
    }
    return list;
  }, [adsets]);

  // Available ads list matching Image 1, 2, 3 "CMS 9/7/2026"
  const defaultAdList = [
    {
      id: "ad-cms-draft",
      name: "CMS 9/7/2026",
      campaign: "Traffic campaign",
      adset: "CMS 9/7/2026 Adset",
      isDraft: true,
      thumbImage: "/assets/meta_ab_purple_thumb.png",
      thumbGradient: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 30%, #e9d5ff 70%, #d8b4fe 100%)",
    },
    {
      id: "ad-cms-published",
      name: "CMS 9/7/2026",
      campaign: "Traffic campaign",
      adset: "CMS 9/7/2026 Adset 2",
      isDraft: false,
      thumbImage: "/assets/meta_ab_purple_thumb.png",
      thumbGradient: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 30%, #e9d5ff 70%, #d8b4fe 100%)",
    },
    {
      id: "ad-instagram-post",
      name: "Instagram Post",
      campaign: "Traffic campaign",
      adset: "Instagram Post Ad Set",
      isDraft: false,
      thumbImage: "/assets/meta_hiring_ad_thumb.jpg",
      thumbGradient: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 30%, #e9d5ff 70%, #d8b4fe 100%)",
    },
    {
      id: "ad-awareness",
      name: "New Awareness campaign Ad",
      campaign: "New Awareness campaign",
      adset: "New Awareness ad set",
      isDraft: false,
      thumbImage: "/assets/meta_ab_purple_thumb.png",
      thumbGradient: "linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)",
    },
    {
      id: "ad-leads",
      name: "New Leads ad",
      campaign: "New Leads campaign",
      adset: "New Leads ad set",
      isDraft: false,
      thumbImage: "/assets/meta_ab_purple_thumb.png",
      thumbGradient: "linear-gradient(135deg, #bbf7d0 0%, #4ade80 100%)",
    },
  ];

  // Combined ads list
  const allAds = useMemo(() => {
    const list = [...defaultAdList];
    if (ads && ads.length > 0) {
      ads.forEach((a) => {
        if (!list.some((existing) => existing.name === a.name)) {
          list.push({
            id: a.id || `ad-${Math.random()}`,
            name: a.name,
            campaign: a.campaignName || "Default campaign",
            adset: a.adsetName || "Default ad set",
            isDraft: a.status?.toLowerCase() === "draft",
            thumbImage: a.thumb || "/assets/meta_ab_purple_thumb.png",
            thumbGradient: "linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 50%, #c084fc 100%)",
          });
        }
      });
    }
    return list;
  }, [ads]);

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1); // Start at Step 1 Intro screen
      const defaultAd =
        (selectedAd && allAds.find((a) => a.id === selectedAd.id)) ||
        allAds.find((a) => a.name === "Instagram Post") ||
        allAds[0];
      setSelectedAdForTest(defaultAd);
      setSelectedCopyAd(null);
      setSelectedVariable(null);
      setVariableMenuSubview(null);
      setVariableSearch("");
      setRecommendedSearch("");
      setSetupMode("copy");
      setCompareType("campaigns");
      setCompareSlots([
        { id: "slot-A", label: "A", value: "", search: "", open: false, adValue: "" },
        { id: "slot-B", label: "B", value: "", search: "", open: false, adValue: "" },
      ]);
      setVariableDropdownOpen(false);
      setAdDropdownOpen(false);
      setCopyAdDropdownOpen(false);
      setTestName(`A/B Test – ${defaultAd?.name || "Instagram Post"}`);
    }
  }, [isOpen, selectedAd, allAds]);

  // Exact Meta Variable Options matching Image 2
  const variableOptions = [
    {
      id: "creative",
      label: "Creative",
      desc: "Find out which images, videos or ad text work best.",
    },
    {
      id: "audience",
      label: "Audience",
      desc: "See how targeting a new audience can affect performance.",
    },
    {
      id: "placement",
      label: "Placement",
      desc: "Discover the most effective places to show your ads.",
    },
    {
      id: "custom",
      label: "Custom",
      desc: "Learn how changing multiple variables can affect results.",
    },
    {
      id: "recommended_settings",
      label: "Recommended settings",
      desc: "Test campaign optimisations to see if they improve performance.",
      hasSubmenu: true,
    },
  ];

  // Submenu options for Recommended Settings matching Image 3
  const recommendedSubOptions = [
    {
      id: "advantage_plus",
      label: "Use Advantage+ audience to automatically find the best audie...",
      fullText: "Use Advantage+ audience to automatically find the best audience to increase results.",
      pillText: "Use Advantage+ audience to automatically find the best audience...",
    },
  ];

  const selectedVariableObj = useMemo(() => {
    if (!selectedVariable) return null;
    const mainVar = variableOptions.find((v) => v.id === selectedVariable);
    if (mainVar) return mainVar;
    const recVar = recommendedSubOptions.find((r) => r.id === selectedVariable);
    if (recVar) return recVar;
    return null;
  }, [selectedVariable]);

  if (!isOpen) return null;

  const currentAd = selectedAdForTest || allAds[0];
  const activeAdToDisplay = selectedCopyAd || currentAd;

  // Handler to add another compare slot in Step 4 in alphabetical order (C, D, E...) matching Meta (Image 1 & 2)
  const handleAddCompareSlot = () => {
    if (compareSlots.length >= 5) return;
    const nextChar = String.fromCharCode(65 + compareSlots.length); // C, D, E...
    setCompareSlots((prev) => [
      ...prev,
      {
        id: `slot-${Date.now()}-${Math.random()}`,
        label: nextChar,
        value: "",
        search: "",
        open: false,
        adValue: "",
      },
    ]);
  };

  // Handler to remove a compare slot in Step 4 and re-index alphabetically
  const handleRemoveCompareSlot = (index) => {
    if (compareSlots.length <= 2) {
      // Just clear values if at minimum 2 slots (A, B)
      setCompareSlots((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], value: "", search: "", open: false, adValue: "" };
        return updated;
      });
      return;
    }
    // Remove slot and re-index remaining slots alphabetically (A, B, C...)
    setCompareSlots((prev) => {
      const remaining = prev.filter((_, i) => i !== index);
      return remaining.map((slot, i) => ({
        ...slot,
        label: String.fromCharCode(65 + i),
      }));
    });
  };

  const handleLaunch = () => {
    if (onLaunchTest) {
      onLaunchTest({
        testName,
        setupMode,
        compareType: setupMode === "existing" ? compareType : null,
        compareItems: setupMode === "existing" ? compareSlots.map((s) => s.value).filter(Boolean) : null,
        slots: setupMode === "existing" ? compareSlots.map((s) => ({
          ...s,
          adValue: s.adValue || `${s.value || "Item"} Ad`,
        })) : null,
        adA: activeAdToDisplay,
        adB: setupMode === "copy" ? `Copy of ${activeAdToDisplay.name}` : null,
        variable: selectedVariable,
        keyMetric,
        startDate,
        endDate,
        endEarlyIfWinner,
      });
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 2500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 820,
          maxWidth: "96vw",
          backgroundColor: "#ffffff",
          borderRadius: 8,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* ── TOP BANNER (Exact Meta Artwork with zero bleed) ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: step === 1 ? 160 : 128,
            overflow: "hidden",
            backgroundColor: "#fdf8ee",
            flexShrink: 0,
            transition: "height 0.2s ease",
          }}
        >
          <img
            src="/assets/meta_ab_banner_clean.png"
            alt="Meta A/B Testing Header"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.style.background =
                "linear-gradient(90deg, #fef3c7 0%, #fed7aa 35%, #fbcfe8 70%, #e0e7ff 100%)";
            }}
          />

          {/* Clean Top-Right Close Button matching Meta */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "transparent",
              border: "none",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#1c1e21",
              zIndex: 10,
              padding: 0,
            }}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* ── STEP 1: OFFICIAL META INTRO SCREEN ("Help improve ad performance with A/B testing") ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "32px 40px 28px 40px", textAlign: "center" }}>
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "1.45rem",
                  fontWeight: 700,
                  color: "#1c1e21",
                  letterSpacing: "-0.015em",
                }}
              >
                Help improve ad performance with A/B testing
              </h2>
              <p
                style={{
                  margin: "0 auto 36px auto",
                  maxWidth: 600,
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                  color: "#606770",
                }}
              >
                Compare versions with different images, text, audiences or other settings to see what works best.
                We&apos;ll make sure that nobody sees more than one version for better accuracy.
              </p>

              {/* 3 Horizontal Steps Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 28,
                  textAlign: "left",
                  padding: "0 10px",
                }}
              >
                {/* Step 1 */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      backgroundColor: "#1c1e21",
                      color: "#ffffff",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "0.94rem", fontWeight: 700, color: "#1c1e21" }}>
                      Choose what to test
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#606770", lineHeight: 1.45 }}>
                      You can copy an existing campaign or ad set or compare published ones.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      backgroundColor: "#1c1e21",
                      color: "#ffffff",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "0.94rem", fontWeight: 700, color: "#1c1e21" }}>
                      Select test settings
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#606770", lineHeight: 1.45 }}>
                      This includes duration and key metrics, which are what we&apos;ll use to determine a winner.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      backgroundColor: "#1c1e21",
                      color: "#ffffff",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "0.94rem", fontWeight: 700, color: "#1c1e21" }}>
                      Get results
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#606770", lineHeight: 1.45 }}>
                      You&apos;ll get an email with results. You can also track progress and manage your test by going to{" "}
                      <span
                        style={{
                          color: "#1877f2",
                          fontWeight: 500,
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Experiments
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                backgroundColor: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 24px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.92rem",
                  fontWeight: 650,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0064e1")}
              >
                <span>Get Started</span>
                <ChevronRight size={17} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: START BY SETTING UP AN AD TO TEST (Exact Carbon Copy of Image 1) ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.25fr 0.75fr",
                padding: "24px 32px 32px 32px",
                gap: 32,
                minHeight: 380,
              }}
            >
              {/* Left Column: Form Fields */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "1.18rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                    lineHeight: 1.3,
                  }}
                >
                  How do you want to set up your test?
                </h3>
                <p
                  style={{
                    margin: "0 0 20px 0",
                    fontSize: "0.88rem",
                    color: "#65676b",
                    lineHeight: 1.45,
                  }}
                >
                  You can select an ad to test it against its duplicate version or pick two existing ads and compare them.
                </p>

                {/* Radio Options matching Image 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: setupMode === "copy" ? 600 : 500,
                      color: "#1c1e21",
                    }}
                    onClick={() => setSetupMode("copy")}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: setupMode === "copy" ? "6px solid #0064e1" : "2px solid #8c939d",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    />
                    <span>Make a copy of an ad</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: setupMode === "existing" ? 600 : 500,
                      color: "#1c1e21",
                    }}
                    onClick={() => setSetupMode("existing")}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: setupMode === "existing" ? "6px solid #0064e1" : "2px solid #8c939d",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    />
                    <span>Select two existing ads</span>
                  </label>
                </div>

                {/* If "Make a copy of this ad" is selected, show Which ad do you want to use? */}
                {setupMode === "copy" && (
                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.96rem",
                        fontWeight: 700,
                        color: "#1c1e21",
                        marginBottom: 8,
                      }}
                    >
                      Which ad do you want to use?
                    </label>

                    <div ref={adDropdownRef} style={{ position: "relative" }}>
                      <div
                        onClick={() => setAdDropdownOpen(!adDropdownOpen)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 14px",
                          borderRadius: 6,
                          border: adDropdownOpen ? "1.5px solid #0064e1" : "1px solid #ced0d4",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          fontSize: "0.88rem",
                          color: "#1c1e21",
                        }}
                      >
                        <span>{currentAd ? currentAd.name : "Select an ad"}</span>
                        <ChevronDown size={18} color="#1c1e21" />
                      </div>

                      {adDropdownOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            right: 0,
                            backgroundColor: "#ffffff",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.14)",
                            zIndex: 150,
                            maxHeight: 180,
                            overflowY: "auto",
                          }}
                        >
                          {allAds.map((a) => (
                            <div
                              key={a.id}
                              onClick={() => {
                                setSelectedAdForTest(a);
                                setAdDropdownOpen(false);
                              }}
                              style={{
                                padding: "9px 14px",
                                fontSize: "0.86rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                backgroundColor: currentAd?.id === a.id ? "#eff6ff" : "transparent",
                                color: currentAd?.id === a.id ? "#0064e1" : "#1c1e21",
                                fontWeight: currentAd?.id === a.id ? 600 : 400,
                              }}
                            >
                              <img
                                src={a.thumbImage || "/assets/meta_ab_purple_thumb.png"}
                                alt={a.name}
                                style={{ width: 22, height: 22, borderRadius: 3, objectFit: "cover", flexShrink: 0 }}
                              />
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {a.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Preview Cards (Exact Layout & Visuals of Image 1) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  paddingLeft: 12,
                  borderLeft: "1px solid #f1f3f5",
                }}
              >
                {/* Version A Card matching Image 1 */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 6,
                    padding: "16px 18px",
                    border: "1px solid #eef0f3",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1c1e21" }}>Version A</div>
                    <img
                      src={currentAd.thumbImage || "/assets/meta_ab_purple_thumb.png"}
                      alt="Version A Preview"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 4,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                    <ChevronRight size={15} color="#65676b" strokeWidth={2.2} />
                    <LayoutGrid size={16} color="#65676b" strokeWidth={1.8} />
                    <span
                      style={{
                        fontSize: "0.86rem",
                        color: "#1c1e21",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {currentAd.name}
                    </span>
                  </div>
                </div>

                {/* Version B Card matching Image 1 (Grey skeleton placeholder) */}
                <div
                  style={{
                    backgroundColor: "#f0f2f5",
                    borderRadius: 6,
                    padding: "16px 18px",
                    border: "1px solid #eef0f3",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#65676b" }}>Version B</div>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 4,
                        backgroundColor: "#9ca3af",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      height: 12,
                      width: 140,
                      borderRadius: 3,
                      backgroundColor: "#9ca3af",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer matching Image 1 */}
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                backgroundColor: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)} // Back to Step 1 Intro Screen
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #ced0d4",
                  backgroundColor: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  // If "Make a copy of this ad" -> go to Step 3 (Variable selection)
                  // If "Pick another existing ad" -> go to Step 4 (Compare campaigns or ad sets - Image 2 & 3)
                  if (setupMode === "copy") {
                    setStep(3);
                  } else {
                    setStep(4);
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 22px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: VARIABLE SELECTION (Exact Carbon Copy of Images 2, 3, 4) ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.25fr 0.75fr",
                padding: "24px 32px 30px 32px",
                gap: 32,
                minHeight: 400,
              }}
            >
              {/* Left Column: Form Fields matching Images 2, 3, 4 */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "1.18rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                    lineHeight: 1.3,
                  }}
                >
                  Which variable would you like to test?
                </h2>
                <p
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "0.88rem",
                    color: "#65676b",
                    lineHeight: 1.45,
                  }}
                >
                  Select the variable that will differ for each version. Choose Custom to compare more than one variable at the same time.
                </p>

                {/* Field Label */}
                <label
                  style={{
                    display: "block",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                    marginBottom: 6,
                  }}
                >
                  What would you like to test?
                </label>

                {/* Variable Selector Trigger Box */}
                <div ref={variableDropdownRef} style={{ position: "relative" }}>
                  <div
                    onClick={() => setVariableDropdownOpen(!variableDropdownOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 14px",
                      borderRadius: 6,
                      border: selectedVariableObj
                        ? "1.5px solid #00a400"
                        : variableDropdownOpen
                        ? "1.5px solid #0064e1"
                        : "1px solid #ced0d4",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      color: selectedVariableObj ? "#1c1e21" : "#65676b",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: selectedVariableObj ? 500 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        paddingRight: 8,
                      }}
                    >
                      {selectedVariableObj
                        ? selectedVariableObj.label
                        : "Select a variable to test"}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <ChevronDown size={18} color="#1c1e21" />
                      {/* Green checkmark circle matching Image 4 */}
                      {selectedVariableObj && (
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: "1.5px solid #00a400",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxSizing: "border-box",
                          }}
                        >
                          <Check size={11} color="#00a400" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu Popup (View 1: Main Menu - Image 2 | View 2: Submenu - Image 3) */}
                  {variableDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        backgroundColor: "#ffffff",
                        borderRadius: 6,
                        border: "1px solid #ced0d4",
                        boxShadow: "0 10px 28px rgba(0, 0, 0, 0.16)",
                        zIndex: 200,
                        overflow: "hidden",
                      }}
                    >
                      {/* ── VIEW 2: RECOMMENDED SETTINGS SUBMENU (Image 3) ── */}
                      {variableMenuSubview === "recommended" ? (
                        <div>
                          {/* Submenu Header with Back Arrow */}
                          <div
                            onClick={() => {
                              setVariableMenuSubview(null);
                              setRecommendedSearch("");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "12px 14px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f0f2f5",
                              backgroundColor: "#ffffff",
                            }}
                          >
                            <ArrowLeft size={16} color="#1c1e21" strokeWidth={2.2} />
                            <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1c1e21" }}>
                              Recommended settings
                            </span>
                          </div>

                          {/* Search Input */}
                          <div style={{ padding: "10px 14px 6px 14px" }}>
                            <div style={{ position: "relative" }}>
                              <Search
                                size={15}
                                color="#8c939d"
                                style={{
                                  position: "absolute",
                                  left: 10,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              />
                              <input
                                type="text"
                                value={recommendedSearch}
                                onChange={(e) => setRecommendedSearch(e.target.value)}
                                placeholder="Search"
                                style={{
                                  width: "100%",
                                  padding: "7px 10px 7px 32px",
                                  borderRadius: 6,
                                  border: "1.5px solid #0064e1",
                                  fontSize: "0.86rem",
                                  color: "#1c1e21",
                                  boxSizing: "border-box",
                                  outline: "none",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          {/* Submenu Options List */}
                          <div style={{ padding: "6px 0", maxHeight: 220, overflowY: "auto" }}>
                            {recommendedSubOptions
                              .filter((sub) =>
                                sub.fullText.toLowerCase().includes(recommendedSearch.toLowerCase())
                              )
                              .map((subItem) => {
                                const isSelected = selectedVariable === subItem.id;
                                return (
                                  <div
                                    key={subItem.id}
                                    onClick={() => {
                                      setSelectedVariable(subItem.id);
                                      setVariableDropdownOpen(false);
                                      setVariableMenuSubview(null);
                                    }}
                                    style={{
                                      padding: "10px 16px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      backgroundColor: isSelected ? "#eff6ff" : "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        border: isSelected ? "6px solid #0064e1" : "2px solid #8c939d",
                                        backgroundColor: "#ffffff",
                                        flexShrink: 0,
                                        boxSizing: "border-box",
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "0.86rem",
                                        color: "#1c1e21",
                                        fontWeight: isSelected ? 600 : 400,
                                        lineHeight: 1.35,
                                      }}
                                    >
                                      {subItem.label}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        /* ── VIEW 1: MAIN VARIABLES MENU (Image 2) ── */
                        <div>
                          {/* Search Input matching Image 2 */}
                          <div style={{ padding: "10px 14px 6px 14px" }}>
                            <div style={{ position: "relative" }}>
                              <Search
                                size={15}
                                color="#8c939d"
                                style={{
                                  position: "absolute",
                                  left: 10,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              />
                              <input
                                type="text"
                                value={variableSearch}
                                onChange={(e) => setVariableSearch(e.target.value)}
                                placeholder="Search"
                                style={{
                                  width: "100%",
                                  padding: "7px 10px 7px 32px",
                                  borderRadius: 6,
                                  border: "1px solid #ced0d4",
                                  fontSize: "0.86rem",
                                  color: "#1c1e21",
                                  boxSizing: "border-box",
                                  outline: "none",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          {/* Options List matching Image 2 */}
                          <div style={{ padding: "4px 0", maxHeight: 260, overflowY: "auto" }}>
                            {variableOptions
                              .filter(
                                (item) =>
                                  item.label.toLowerCase().includes(variableSearch.toLowerCase()) ||
                                  item.desc.toLowerCase().includes(variableSearch.toLowerCase())
                              )
                              .map((item) => {
                                const isSelected = selectedVariable === item.id;
                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      if (item.hasSubmenu) {
                                        setVariableMenuSubview("recommended");
                                      } else {
                                        setSelectedVariable(item.id);
                                        setVariableDropdownOpen(false);
                                      }
                                    }}
                                    style={{
                                      padding: "10px 16px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      backgroundColor: isSelected ? "#eff6ff" : "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
                                      <div
                                        style={{
                                          width: 18,
                                          height: 18,
                                          borderRadius: "50%",
                                          border: isSelected ? "6px solid #0064e1" : "2px solid #8c939d",
                                          backgroundColor: "#ffffff",
                                          flexShrink: 0,
                                          marginTop: 2,
                                          boxSizing: "border-box",
                                        }}
                                      />
                                      <div>
                                        <div
                                          style={{
                                            fontSize: "0.88rem",
                                            fontWeight: 600,
                                            color: "#1c1e21",
                                            marginBottom: 2,
                                          }}
                                        >
                                          {item.label}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: "0.8rem",
                                            color: "#65676b",
                                            lineHeight: 1.35,
                                          }}
                                        >
                                          {item.desc}
                                        </div>
                                      </div>
                                    </div>
                                    {item.hasSubmenu && (
                                      <ChevronRight size={16} color="#65676b" style={{ marginTop: 4, flexShrink: 0 }} />
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Info Card below trigger matching Image 4 */}
                {selectedVariableObj && (
                  <div
                    style={{
                      marginTop: 18,
                      backgroundColor: "#ffffff",
                      border: "1px solid #ced0d4",
                      borderRadius: 6,
                      padding: "16px 18px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <Info size={18} color="#1c1e21" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 4,
                        }}
                      >
                        Duplicating selected campaign for your test
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", lineHeight: 1.45 }}>
                        We&apos;ll duplicate your selected campaign, which you can edit and publish. Your test will begin once your new campaign has been published.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Preview Cards matching Images 2, 3, 4 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  paddingLeft: 12,
                  borderLeft: "1px solid #f1f3f5",
                }}
              >
                {/* Version A Card matching Image 2, 3, 4 */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 6,
                    padding: "16px 18px",
                    border: "1px solid #eef0f3",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1c1e21" }}>
                      Version A
                    </div>
                    <img
                      src={currentAd.thumbImage || "/assets/meta_hiring_ad_thumb.jpg"}
                      alt="Version A Thumbnail"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 4,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/assets/meta_ab_purple_thumb.png";
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                    <ChevronRight size={15} color="#65676b" strokeWidth={2.2} />
                    <LayoutGrid size={16} color="#65676b" strokeWidth={1.8} />
                    <span
                      style={{
                        fontSize: "0.86rem",
                        color: "#1c1e21",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {currentAd.name}
                    </span>
                  </div>
                </div>

                {/* Version B Card: Placeholder in Image 2 & 3, Full details in Image 4 */}
                {!selectedVariableObj ? (
                  <div
                    style={{
                      backgroundColor: "#f0f2f5",
                      borderRadius: 6,
                      padding: "16px 18px",
                      border: "1px solid #eef0f3",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#65676b" }}>
                        Version B
                      </div>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 4,
                          backgroundColor: "#9ca3af",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        height: 12,
                        width: 140,
                        borderRadius: 3,
                        backgroundColor: "#9ca3af",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: 6,
                      padding: "16px 18px",
                      border: "1px solid #eef0f3",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1c1e21" }}>
                        Version B
                      </div>
                      <img
                        src={currentAd.thumbImage || "/assets/meta_hiring_ad_thumb.jpg"}
                        alt="Version B Thumbnail"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 4,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/assets/meta_ab_purple_thumb.png";
                        }}
                      />
                    </div>

                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "#1c1e21",
                        marginBottom: 4,
                      }}
                    >
                      Copy of version A
                    </div>

                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "#65676b",
                        lineHeight: 1.4,
                        marginBottom: 12,
                      }}
                    >
                      {selectedVariable === "advantage_plus"
                        ? "We will create a copy with these settings turned on after you've finished setting up the test in the next step."
                        : `You can change the ${selectedVariableObj.label.toLowerCase()} after you've finished setting up the test in the next step.`}
                    </div>

                    {/* Pill Badge matching Image 4 */}
                    <div
                      style={{
                        display: "inline-flex",
                        maxWidth: "100%",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        backgroundColor: "#f0f2f5",
                        padding: "5px 10px",
                        borderRadius: 14,
                        fontSize: "0.78rem",
                        color: "#1c1e21",
                        fontWeight: 500,
                        boxSizing: "border-box",
                      }}
                    >
                      <span>{selectedVariableObj.pillText || selectedVariableObj.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer matching Images 2, 3, 4 */}
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                backgroundColor: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={() => setStep(2)} // Back to Step 2
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #ced0d4",
                  backgroundColor: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={!selectedVariable}
                onClick={() => {
                  if (selectedVariable) setStep(5);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 22px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: selectedVariable ? "#0064e1" : "#b0d5ff",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  cursor: selectedVariable ? "pointer" : "not-allowed",
                  transition: "background-color 0.15s ease",
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: COMPARE EXISTING CAMPAIGNS OR AD SETS (Exact Carbon Copy of Images 1 & 2) ── */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.25fr 0.75fr",
                padding: "24px 32px 30px 32px",
                gap: 32,
                minHeight: 380,
              }}
            >
              {/* Left Column: Form Fields matching Images 1 & 2 */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "1.18rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                    lineHeight: 1.3,
                  }}
                >
                  Do you want to compare campaigns or ad sets?
                </h2>

                {/* Radio Options matching Images 1 & 2 (ONLY 2 Radios: Existing campaigns & Existing ad sets) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: compareType === "campaigns" ? 600 : 500,
                      color: "#1c1e21",
                    }}
                    onClick={() => {
                      setCompareType("campaigns");
                      // Reset to initial 2 empty slots A and B
                      setCompareSlots([
                        { id: "slot-A", label: "A", value: "", search: "", open: false, adValue: "" },
                        { id: "slot-B", label: "B", value: "", search: "", open: false, adValue: "" },
                      ]);
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: compareType === "campaigns" ? "6px solid #0064e1" : "2px solid #8c939d",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    />
                    <span>Existing campaigns</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: compareType === "adsets" ? 600 : 500,
                      color: "#1c1e21",
                    }}
                    onClick={() => {
                      setCompareType("adsets");
                      // Reset to initial 2 empty slots A and B
                      setCompareSlots([
                        { id: "slot-A", label: "A", value: "", search: "", open: false, adValue: "" },
                        { id: "slot-B", label: "B", value: "", search: "", open: false, adValue: "" },
                      ]);
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: compareType === "adsets" ? "6px solid #0064e1" : "2px solid #8c939d",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    />
                    <span>Existing ad sets</span>
                  </label>
                </div>

                {/* Subtitle & Section Header */}
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "0.98rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                  }}
                >
                  {compareType === "campaigns"
                    ? "Choose the campaigns for your test"
                    : "Choose the ad sets for your test"}
                </h3>
                <p
                  style={{
                    margin: "0 0 18px 0",
                    fontSize: "0.85rem",
                    color: "#65676b",
                    lineHeight: 1.45,
                  }}
                >
                  {compareType === "campaigns"
                    ? "We'll compare these campaigns and ensure that their audiences don't overlap for the duration of your test to see which performs better."
                    : "We'll compare these ad sets and ensure that their audiences don't overlap for the duration of your test to see which performs better."}
                </p>

                {/* Compare Slots List (A, B, C...) matching Image 1 & 2 */}
                <div
                  ref={slotsContainerRef}
                  style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}
                >
                  {compareSlots.map((slot, index) => {
                    const isCampaign = compareType === "campaigns";
                    const currentItems = isCampaign ? allCampaigns : allAdsets;
                    const filteredItems = currentItems.filter((item) =>
                      item.name.toLowerCase().includes((slot.search || "").toLowerCase())
                    );
                    const placeholderText = isCampaign
                      ? "Search for a campaign"
                      : "Search for an ad set";
                    const fieldLabel = isCampaign
                      ? `Campaign ${slot.label}`
                      : `Ad set ${slot.label}`;

                    return (
                      <div key={slot.id} style={{ display: "flex", flexDirection: "column" }}>
                        <label
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                            marginBottom: 6,
                          }}
                        >
                          {fieldLabel}
                        </label>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                          <div style={{ position: "relative", flex: 1 }}>
                            <input
                              type="text"
                              value={slot.value ? slot.value : slot.search}
                              placeholder={placeholderText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCompareSlots((prev) => {
                                  const updated = [...prev];
                                  updated[index] = {
                                    ...updated[index],
                                    search: val,
                                    value: "",
                                    adValue: "",
                                    open: true,
                                  };
                                  return updated;
                                });
                              }}
                              onFocus={() => {
                                setCompareSlots((prev) =>
                                  prev.map((s, i) => ({ ...s, open: i === index }))
                                );
                              }}
                              style={{
                                width: "100%",
                                padding: "9px 32px 9px 12px",
                                borderRadius: 6,
                                border: slot.open ? "1.5px solid #0064e1" : "1px solid #ced0d4",
                                fontSize: "0.88rem",
                                color: "#1c1e21",
                                backgroundColor: "#ffffff",
                                boxSizing: "border-box",
                                outline: "none",
                              }}
                            />

                            {/* Clear 'X' if input has value or search text */}
                            {(slot.value || slot.search) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCompareSlots((prev) => {
                                    const updated = [...prev];
                                    updated[index] = {
                                      ...updated[index],
                                      value: "",
                                      search: "",
                                      adValue: "",
                                      open: false,
                                    };
                                    return updated;
                                  });
                                }}
                                style={{
                                  position: "absolute",
                                  right: 8,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#8c939d",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: 2,
                                }}
                                title="Clear selection"
                              >
                                <X size={15} />
                              </button>
                            )}

                            {/* Dropdown Options Popup */}
                            {slot.open && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 4px)",
                                  left: 0,
                                  right: 0,
                                  backgroundColor: "#ffffff",
                                  borderRadius: 6,
                                  border: "1px solid #ced0d4",
                                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
                                  zIndex: 160,
                                  maxHeight: 180,
                                  overflowY: "auto",
                                }}
                              >
                                {filteredItems.length === 0 ? (
                                  <div style={{ padding: "10px 14px", fontSize: "0.84rem", color: "#65676b" }}>
                                    {isCampaign ? "No campaigns found" : "No ad sets found"}
                                  </div>
                                ) : (
                                  filteredItems.map((item) => (
                                    <div
                                      key={item.id}
                                      onClick={() => {
                                        setCompareSlots((prev) => {
                                          const updated = [...prev];
                                          updated[index] = {
                                            ...updated[index],
                                            value: item.name,
                                            search: item.name,
                                            adValue: `${item.name} Ad`,
                                            open: false,
                                          };
                                          return updated;
                                        });
                                      }}
                                      style={{
                                        padding: "9px 14px",
                                        fontSize: "0.86rem",
                                        cursor: "pointer",
                                        color: slot.value === item.name ? "#0064e1" : "#1c1e21",
                                        backgroundColor: slot.value === item.name ? "#eff6ff" : "transparent",
                                        fontWeight: slot.value === item.name ? 600 : 400,
                                      }}
                                      onMouseEnter={(e) => {
                                        if (slot.value !== item.name) e.currentTarget.style.backgroundColor = "#f8fafc";
                                      }}
                                      onMouseLeave={(e) => {
                                        if (slot.value !== item.name) e.currentTarget.style.backgroundColor = "transparent";
                                      }}
                                    >
                                      {item.name}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>

                          {/* Show remove button only for slots beyond the initial 2 (Slot C, D...) */}
                          {compareSlots.length > 2 && index >= 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCompareSlot(index)}
                              title={`Remove ${fieldLabel}`}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                border: "1px solid #ced0d4",
                                backgroundColor: "#ffffff",
                                color: "#65676b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                            >
                              <X size={16} strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* + Add Button matching Image 1 & 2 */}
                <div>
                  <button
                    type="button"
                    onClick={handleAddCompareSlot}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "1px solid #ced0d4",
                      backgroundColor: "#ffffff",
                      color: "#1c1e21",
                      fontSize: "0.86rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>{compareType === "campaigns" ? "Add Campaign" : "Add Ad Set"}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Preview Cards (Version A, B...) matching Image 1 & 2 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  paddingLeft: 12,
                  borderLeft: "1px solid #f1f3f5",
                }}
              >
                {compareSlots.map((slot) => {
                  const hasSelection = Boolean(slot.value);
                  return (
                    <div
                      key={slot.id}
                      style={{
                        backgroundColor: hasSelection ? "#ffffff" : "#f0f2f5",
                        borderRadius: 6,
                        padding: "16px 18px",
                        border: "1px solid #eef0f3",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: hasSelection ? 12 : 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: hasSelection ? "#1c1e21" : "#65676b",
                          }}
                        >
                          Version {slot.label}
                        </div>

                        {/* Thumbnail: Purple if selected, grey placeholder if empty */}
                        {hasSelection ? (
                          <img
                            src="/assets/meta_ab_purple_thumb.png"
                            alt={`Version ${slot.label} Thumbnail`}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 4,
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 4,
                              backgroundColor: "#9ca3af",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>

                      {/* Content: Selected name or grey skeleton placeholder bar */}
                      {hasSelection ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                          <ChevronRight size={15} color="#65676b" strokeWidth={2.2} />
                          <LayoutGrid size={16} color="#65676b" strokeWidth={1.8} />
                          <span
                            style={{
                              fontSize: "0.86rem",
                              color: "#1c1e21",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontWeight: 500,
                            }}
                          >
                            {slot.value}
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            height: 12,
                            width: 140,
                            borderRadius: 3,
                            backgroundColor: "#9ca3af",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer matching Image 1 & 2 */}
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                backgroundColor: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={() => setStep(2)} // Back to Step 2 (Image 4)
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #ced0d4",
                  backgroundColor: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={!compareSlots[0]?.value || !compareSlots[1]?.value}
                onClick={() => {
                  if (compareSlots[0]?.value && compareSlots[1]?.value) {
                    setStep(5);
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 22px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor:
                    compareSlots[0]?.value && compareSlots[1]?.value ? "#0064e1" : "#b0d5ff",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  cursor:
                    compareSlots[0]?.value && compareSlots[1]?.value ? "pointer" : "not-allowed",
                  transition: "background-color 0.15s ease",
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: TEST SETTINGS & SCHEDULE / LAUNCH ── */}
        {step === 5 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.25fr 0.75fr",
                padding: "26px 32px",
                gap: 32,
                minHeight: 400,
              }}
            >
              {/* Left Column: Test Configuration Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h3
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                    }}
                  >
                    Select test settings
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.88rem",
                      color: "#65676b",
                      lineHeight: 1.4,
                    }}
                  >
                    Configure test duration and the key metric used to declare the winning version with statistical confidence.
                  </p>
                </div>

                {/* Test Name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                      marginBottom: 6,
                    }}
                  >
                    Test Name
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #ced0d4",
                      fontSize: "0.88rem",
                      color: "#1c1e21",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0064e1")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#ced0d4")}
                  />
                </div>

                {/* Key Metric (Winning Criteria) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                      marginBottom: 6,
                    }}
                  >
                    Key Metric (Winning Criteria)
                  </label>
                  <select
                    value={keyMetric}
                    onChange={(e) => setKeyMetric(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #ced0d4",
                      fontSize: "0.88rem",
                      color: "#1c1e21",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="cost_per_result">Lowest Cost per Result (Recommended)</option>
                    <option value="ctr">Highest Click-Through Rate (CTR)</option>
                    <option value="roas">Highest Return on Ad Spend (ROAS)</option>
                    <option value="cpc">Lowest Cost per Link Click (CPC)</option>
                    <option value="cpm">Lowest Cost per 1,000 Impressions (CPM)</option>
                  </select>
                </div>

                {/* Schedule & Duration */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                      marginBottom: 6,
                    }}
                  >
                    Schedule & Duration
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <span style={{ fontSize: "0.78rem", color: "#65676b", display: "block", marginBottom: 3 }}>
                        Start Date
                      </span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          fontSize: "0.84rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.78rem", color: "#65676b", display: "block", marginBottom: 3 }}>
                        End Date (7 days recommended)
                      </span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          fontSize: "0.84rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Early Winner Determination Toggle */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: "#1c1e21",
                    lineHeight: 1.4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={endEarlyIfWinner}
                    onChange={(e) => setEndEarlyIfWinner(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "#0064e1" }}
                  />
                  <div>
                    <span style={{ fontWeight: 600 }}>End test early if a winner is found</span>
                    <div style={{ fontSize: "0.78rem", color: "#65676b" }}>
                      End test before the scheduled end date once 95% statistical significance is achieved to save ad spend.
                    </div>
                  </div>
                </label>
              </div>

              {/* Right Column: Experiment Summary */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  paddingLeft: 12,
                  borderLeft: "1px solid #f1f3f5",
                }}
              >
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                  }}
                >
                  Experiment Overview
                </div>

                <div
                  style={{
                    backgroundColor: "#f7f8fa",
                    borderRadius: 6,
                    padding: "16px 18px",
                    border: "1px solid #eef0f3",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    fontSize: "0.84rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#65676b" }}>Setup Type:</span>
                    <span style={{ fontWeight: 650, color: "#1c1e21" }}>
                      {setupMode === "copy" ? "Copy Ad & Test Variable" : `Compare Existing ${compareType === "campaigns" ? "Campaigns" : "Ad Sets"}`}
                    </span>
                  </div>

                  {setupMode === "copy" ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#65676b" }}>Variable Tested:</span>
                        <span style={{ fontWeight: 650, color: "#1c1e21", textTransform: "capitalize" }}>
                          {selectedVariable}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#65676b" }}>Version A (Control):</span>
                        <span style={{ fontWeight: 600, color: "#0064e1" }}>{activeAdToDisplay.name}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#65676b" }}>Version B (Variant):</span>
                        <span style={{ fontWeight: 600, color: "#16a34a" }}>
                          Copy of {activeAdToDisplay.name}
                        </span>
                      </div>
                    </>
                  ) : (
                    compareSlots.filter((s) => s.value).map((slot) => (
                      <div key={slot.id} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#65676b" }}>Version {slot.label}:</span>
                        <span style={{ fontWeight: 600, color: "#0064e1" }}>{slot.value}</span>
                      </div>
                    ))
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#65676b" }}>Evaluation Metric:</span>
                    <span style={{ fontWeight: 650, color: "#1c1e21" }}>
                      {keyMetric === "cost_per_result"
                        ? "Cost per Result"
                        : keyMetric.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#65676b" }}>Estimated Power:</span>
                    <span style={{ fontWeight: 650, color: "#15803d" }}>
                      High (80%+)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#eff6ff",
                    borderRadius: 6,
                    padding: "12px 14px",
                    border: "1px solid #bfdbfe",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <Info size={16} color="#0064e1" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: "0.8rem", color: "#1e3a8a", lineHeight: 1.4 }}>
                    Results and confidence levels will automatically update in Meta Ads Manager Experiments.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                backgroundColor: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  // Return to previous flow step
                  if (setupMode === "copy") {
                    setStep(3);
                  } else {
                    setStep(4);
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #ced0d4",
                  backgroundColor: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleLaunch}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 24px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0064e1")}
              >
                <span>Launch A/B Test</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
