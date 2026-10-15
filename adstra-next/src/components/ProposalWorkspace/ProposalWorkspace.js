"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Check,
  Copy,
  Download,
  FilePlus2,
  FileStack,
  Focus,
  Maximize2,
  Minimize2,
  Minus,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Printer,
  Save,
  ScrollText,
  Share2,
  Sparkles,
  Type,
  Users,
  ZoomIn,
  Undo2,
  Redo2,
  X,
  Loader2,
  Pencil,
  Clock,
  Layers,
} from "lucide-react";
import ExportButton from "../ExportButton/ExportButton";
import HeaderEditor from "../HeaderEditor/HeaderEditor";
import ProposalPreview from "../ProposalPreview/ProposalPreview";
import SectionEditor from "../SectionEditor/SectionEditor";
import ServiceTable from "../ServiceTable/ServiceTable";
import SettingsPanel from "../common/SettingsPanel";
import RecentProposalsPanel from "./RecentProposalsPanel";
import PackagesManagementPanel from "./PackagesManagementPanel";
import styles from "./ProposalWorkspace.module.css";
import API_BASE_URL from "@/utils/apiBase";

// Proposal crafting flow tools (Top of rail)
const commonTools = [
  { id: "details", label: "Details", icon: BriefcaseBusiness },
  { id: "services", label: "Services", icon: ScrollText },
  { id: "content", label: "Content", icon: Type },
];

// Master management, proposals archive, templates & brand (Bottom of rail)
const oneTimeTools = [
  { id: "proposals", label: "Proposals", icon: Clock },
  { id: "packages", label: "Packages", icon: Layers },
  { id: "templates", label: "Templates", icon: FileStack },
  { id: "brand", label: "Brand", icon: Palette },
];

const tools = [...commonTools, ...oneTimeTools];

const panelMeta = {
  proposals: ["Recent proposals", "Browse, search, and manage previous proposals"],
  details: ["Proposal details", "Reference, purpose, lead, and billing information"],
  services: ["Services & pricing", "Build the scope and commercial estimate"],
  packages: ["Packages management", "Configure service packages, line items, and market rates"],
  content: ["Proposal content", "Write the introduction, scope and supporting sections"],
  templates: ["Document template", "Choose how the structured proposal is presented"],
  brand: ["Brand identity", "Preview the identity used on every exported proposal"],
};

const PAGE_HEIGHT = 1123; // A4 height at 794px width (96dpi)

export default function ProposalWorkspace({
  headerData,
  onHeaderChange,
  services,
  onServicesChange,
  sections,
  onSectionChange,
  onSectionRemove,
  onAddSection,
  onServiceSelect,
  onServiceUnselect,
  selectedLead,
  currentProposalId,
  isSaved,
  isViewMode,
  onEditMode,
  onBack,
  onNew,
  onSelectLead,
  onClearLead,
  onOpenProposals,
  onLoadProposal,
  onOpenProposalsModal,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  const [activeTool, setActiveTool] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("proposal") || params.get("lead")) {
        return "details";
      }
      return "proposals";
    }
    return "details";
  });
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [zoom, setZoom] = useState(78);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsUpdatedAt, setSettingsUpdatedAt] = useState(Date.now());
  const [clientLeads, setClientLeads] = useState([]);
  const canvasViewportRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Resizable sidebar panel width
  const [panelWidth, setPanelWidth] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("adstra_proposal_panel_width");
        if (saved) {
          const num = parseInt(saved, 10);
          if (!isNaN(num) && num >= 320 && num <= 1100) return num;
        }
      } catch {}
    }
    return 480;
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const railWidth = 78;
      const newWidth = e.clientX - railWidth;
      const maxWidth = typeof window !== "undefined" ? Math.min(window.innerWidth - 300, 1100) : 1100;
      if (newWidth >= 340 && newWidth <= maxWidth) {
        setPanelWidth(newWidth);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("adstra_proposal_panel_width", String(newWidth));
          } catch {}
        }
      }
    }
  }, [isResizing]);

  const togglePanelWidth = useCallback(() => {
    setPanelWidth((prev) => {
      const next = prev >= 650 ? 480 : 750;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("adstra_proposal_panel_width", String(next));
        } catch {}
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, resize, stopResizing]);

  const [dynamicPackages, setDynamicPackages] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("adstra_cached_packages");
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const loadPkgs = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        const res = await fetch(`${API_BASE_URL}/proposal/packages/?t=${Date.now()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setDynamicPackages(data);
          if (typeof window !== "undefined") {
            localStorage.setItem("adstra_cached_packages", JSON.stringify(data));
          }
        }
      } catch (e) {
        console.error("Failed to load packages in ProposalWorkspace:", e);
      }
    };
    loadPkgs();
  }, []);

  const handleTogglePackageFromManager = useCallback((pkg) => {
    const serviceName = pkg.name;
    const isCurrentlySelected = services.some((s) => s.category === serviceName);

    if (!isCurrentlySelected) {
      const servicesWithoutCategory = services.filter((s) => s.category !== serviceName);
      const subItems = (pkg.items && pkg.items.length > 0)
        ? pkg.items.map((it) => ({
            description: it.description,
            category: serviceName,
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
            gst: parseFloat(it.gst) || 18,
            amount: (Number(it.quantity) || 1) * (Number(it.rate) || 0),
          }))
        : [{
            description: serviceName,
            category: serviceName,
            quantity: 1,
            rate: Number(pkg.total_amount) || 0,
            gst: 18,
            amount: Number(pkg.total_amount) || 0,
          }];

      const uniqMap = new Map();
      [...servicesWithoutCategory, ...subItems].forEach((item) => {
        uniqMap.set(item.description, item);
      });
      onServicesChange(Array.from(uniqMap.values()));
      if (onServiceSelect) onServiceSelect(serviceName, pkg);
    } else {
      const updatedServices = services.filter((s) => s.category !== serviceName);
      onServicesChange(updatedServices);
      if (onServiceUnselect) onServiceUnselect(serviceName);
    }
  }, [services, onServicesChange, onServiceSelect, onServiceUnselect]);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  useEffect(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    const handleWheel = (e) => {
      // Only zoom if Ctrl/Cmd is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomStep = e.deltaY > 0 ? -10 : 10;
        setZoom((prevZoom) => {
          const newZoom = prevZoom + zoomStep;
          return Math.min(Math.max(30, newZoom), 200);
        });
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    if (activeTool === "content" && activeSectionId && panelOpen) {
      // Small timeout to allow panel render
      setTimeout(() => {
        const el = document.getElementById(`editor-section-${activeSectionId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Clear it so it doesn't scroll again unnecessarily
        setActiveSectionId(null);
      }, 150);
    }
  }, [activeTool, activeSectionId, panelOpen]);

  useEffect(() => {
    const clientId = headerData?.billTo?.id;
    if (!clientId) {
      setClientLeads([]);
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) return;
    
    fetch(`${API_BASE_URL}/leads/?customer=${clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setClientLeads(data.results || []);
      })
      .catch(err => console.error("Failed to fetch client leads", err));
  }, [headerData?.billTo?.id]);

  const [totalPages, setTotalPages] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const workspaceRef = useRef(null);
  const stageRef = useRef(null);
  const measureRef = useRef(null);
  const manualZoomRef = useRef(false);

  const identity = headerData?.quotationNo || "Untitled proposal";
  const clientName = headerData?.billTo?.company_name || headerData?.billTo?.name || "No client selected";
  const safeClientName = clientName !== "No client selected" 
    ? `_${clientName.replace(/[^a-z0-9]/gi, "_")}`
    : "";
  const fileName = headerData?.quotationNo
    ? `proposal_${headerData.quotationNo.replace(/[^a-z0-9]/gi, "_").toUpperCase()}${safeClientName}`
    : `proposal${safeClientName}`;

  // Measure content blocks and compute smart page breaks
  const [pageBreaks, setPageBreaks] = useState([0]); // Y-offset where each page starts
  useEffect(() => {
    const measure = () => {
      const paperEl = measureRef.current?.querySelector(`.${styles.paper}`);
      if (!paperEl) return;
      
      const PADDING_TOP = 26;
      const PADDING_BOTTOM = 26;
      const USABLE_HEIGHT = PAGE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

      const blocks = paperEl.querySelectorAll("[data-page-break-avoid]");
      if (!blocks.length) {
        // Fallback: single page
        const contentHeight = paperEl.scrollHeight || paperEl.offsetHeight;
        const count = Math.max(1, Math.ceil(contentHeight / USABLE_HEIGHT));
        setTotalPages(count);
        setPageBreaks(Array.from({ length: count }, (_, i) => i * USABLE_HEIGHT));
        return;
      }

      const paperTop = paperEl.getBoundingClientRect().top + PADDING_TOP; // Content starts after padding
      const breaks = [0];
      let currentPageBottom = USABLE_HEIGHT;

      for (const block of blocks) {
        const rect = block.getBoundingClientRect();
        // Calculate position relative to the start of the actual content area
        const blockTop = rect.top - paperTop;
        const blockBottom = rect.bottom - paperTop;

        // If this block starts before the current page end but extends past it
        if (blockBottom > currentPageBottom && blockTop < currentPageBottom) {
          // If the block is small (e.g. < 250px), push it entirely to the next page to avoid cutting it in half
          if (rect.height <= 250) {
            breaks.push(blockTop);
            currentPageBottom = blockTop + USABLE_HEIGHT;
          } else {
            // It's a large block (like a table), let it split naturally at the page boundary
            breaks.push(currentPageBottom);
            currentPageBottom += USABLE_HEIGHT;
          }
        }

        // If block is extremely tall and spans multiple full pages, keep adding page breaks
        while (blockBottom > currentPageBottom) {
          breaks.push(currentPageBottom);
          currentPageBottom += USABLE_HEIGHT;
        }
      }

      // Catch-all: If there's still leftover content (e.g. un-blocked trailing content) that exceeds the last page
      const contentHeight = paperEl.scrollHeight || paperEl.offsetHeight;
      const actualContentHeight = contentHeight - PADDING_TOP - PADDING_BOTTOM;
      while (actualContentHeight > currentPageBottom) {
        breaks.push(currentPageBottom);
        currentPageBottom += USABLE_HEIGHT;
      }

      setPageBreaks(breaks);
      setTotalPages(breaks.length);
    };
    // Delay to ensure DOM is fully painted
    const raf = requestAnimationFrame(() => {
      measure();
      setTimeout(measure, 400);
    });
    return () => cancelAnimationFrame(raf);
  }, [headerData, services, sections]);

  const scrollToPage = useCallback((pageIndex) => {
    setActivePage(pageIndex);
    const viewport = stageRef.current?.querySelector(`.${styles.canvasViewport}`);
    const cards = viewport?.querySelectorAll(`.${styles.pageCard}`);
    if (cards?.[pageIndex]) {
      cards[pageIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const fitPage = useCallback((markAsManual = true) => {
    const stage = stageRef.current;
    if (!stage) return;
    if (markAsManual) manualZoomRef.current = true;
    const narrow = stage.clientWidth < 560;
    const availableWidth = Math.max(stage.clientWidth - (narrow ? 32 : 96), 240);
    const availableHeight = Math.max(stage.clientHeight - (narrow ? 150 : 112), 320);
    const widthScale = availableWidth / 794;
    const heightScale = availableHeight / PAGE_HEIGHT;
    setZoom(Math.max(30, Math.min(100, Math.floor(Math.min(widthScale, heightScale) * 100))));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1080) setPanelOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measureAndFit = () => {
      if (!manualZoomRef.current) fitPage(false);
    };
    const frame = window.requestAnimationFrame(measureAndFit);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureAndFit) : null;
    observer?.observe(stage);
    window.addEventListener("orientationchange", measureAndFit);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("orientationchange", measureAndFit);
    };
  }, [fitPage, panelOpen]);

  const handleTool = (toolId) => {
    setActiveTool(toolId);
    setPanelOpen(true);
  };

  const handlePreviewClick = (e) => {
    if (isViewMode) return;
    const blockEl = e.target.closest('[data-proposal-block]');
    if (!blockEl) return;
    
    const blockType = blockEl.getAttribute('data-proposal-block');
    let toolToOpen = null;
    
    if (blockType === 'details' || blockType === 'purpose' || blockType === 'topbar') {
      toolToOpen = 'details';
    } else if (blockType === 'fromto') {
      toolToOpen = 'details';
    } else if (blockType === 'services' || blockType === 'amount-words') {
      toolToOpen = 'services';
    } else if (blockType?.startsWith('intro-') || blockType?.startsWith('section-')) {
      toolToOpen = 'content';
      setActiveSectionId(blockType.split('section-')[1] || blockType.split('intro-')[1]);
    } else if (blockType === 'footer' || blockType === 'disclaimer') {
      toolToOpen = 'brand';
    }

    if (toolToOpen) {
      handleTool(toolToOpen);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await workspaceRef.current?.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {
      // Fullscreen can be blocked by browser policy; the workspace remains usable.
    }
  };

  const panelContent = useMemo(() => {
    if (activeTool === "proposals") {
      return (
        <RecentProposalsPanel
          currentProposalId={currentProposalId}
          onLoadProposal={onLoadProposal}
          onNewProposal={onNew}
          onOpenModal={onOpenProposalsModal}
          isViewMode={isViewMode}
          isSaved={isSaved}
        />
      );
    }
    if (isViewMode) return null;
    if (activeTool === "details" || activeTool === "client") {
      return (
        <div className={styles.detailsEditor}>
          <HeaderEditor
            data={headerData}
            onChange={onHeaderChange}
            variant="workspace"
            selectedLead={selectedLead}
            onSelectLead={onSelectLead}
            onClearLead={onClearLead}
          />
        </div>
      );
    }
    if (activeTool === "services") {
      return (
        <ServiceTable
          services={services}
          onChange={onServicesChange}
          onServiceSelect={onServiceSelect}
          onServiceUnselect={onServiceUnselect}
          packages={dynamicPackages}
          onOpenPackageManagement={() => handleTool("packages")}
        />
      );
    }
    if (activeTool === "packages") {
      return (
        <PackagesManagementPanel
          selectedPackageNames={Array.from(new Set(services.map((s) => s.category).filter(Boolean)))}
          onTogglePackage={handleTogglePackageFromManager}
          onPackagesUpdated={(pkgs) => setDynamicPackages(pkgs)}
        />
      );
    }
    if (activeTool === "content") {
      return (
        <div className={styles.sectionList}>
          {sections.map((section) => (
            <div key={section.id} id={`editor-section-${section.id}`}>
              <SectionEditor
                section={section}
                onChange={(next) => onSectionChange(section.id, next)}
                onRemove={() => onSectionRemove(section.id)}
              />
            </div>
          ))}
          <button type="button" className={styles.primaryPanelButton} onClick={onAddSection}>
            <Plus size={17} /> Add content section
          </button>
        </div>
      );
    }
    if (activeTool === "templates") {
      return (
        <div className={styles.templatePanel}>
          <div className={`${styles.templateCard} ${styles.templateCardActive}`} role="status" aria-label="Current template: Adstra Classic">
            <span className={styles.templatePreview} aria-hidden="true">
              <i /><i /><i /><i />
            </span>
            <span><span className={styles.currentTemplate}>Current template</span><strong>Adstra Classic</strong><small>Structured A4 commercial proposal</small></span>
            <Check size={17} />
          </div>
          <div className={styles.infoNote}>
            <Sparkles size={17} />
            <p>Additional templates will use the same client, service and section data, so exports remain consistent.</p>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.brandPanel}>
        <div className={styles.brandLockup}>
          <img src="/assets/logo_new-01.png" alt="Adstra Digital" />
        </div>
        <dl>
          <div><dt>Document brand</dt><dd>Adstra Digital</dd></div>
          <div><dt>Primary ink</dt><dd><span className={styles.swatch} /> Deep navy</dd></div>
          <div><dt>Export format</dt><dd>A4 portrait</dd></div>
        </dl>
        <div className={styles.infoNote}>
          <Palette size={17} />
          <p>Brand assets are controlled centrally to keep every sales proposal consistent.</p>
        </div>
        <button 
          type="button" 
          className={styles.primaryPanelButton} 
          onClick={() => setShowSettingsModal(true)}
          style={{ marginTop: '16px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}
        >
          ⚙️ Organization Settings
        </button>
      </div>
    );
  }, [activeTool, clientName, currentProposalId, headerData, isSaved, isViewMode, onLoadProposal, onNew, onOpenProposalsModal, onAddSection, onHeaderChange, onSectionChange, onSectionRemove, onSelectLead, onClearLead, onServiceSelect, onServiceUnselect, onServicesChange, sections, selectedLead, services, clientLeads]);

  const handleDownloadPdf = async () => {
    setShowExportMenu(false);
    const element = document.getElementById("proposal-preview-pdf");
    if (!element) return;

    const wrapper = element.parentElement;
    const originalVisibility = wrapper ? wrapper.style.visibility : "";
    if (wrapper) wrapper.style.visibility = "visible";

    try {
      setIsDownloading(true);
      const html2pdf = (await import("html2pdf.js")).default;
      const pdfFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      await html2pdf().set({
        margin: 0,
        filename: pdfFileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(element).save();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      if (wrapper) wrapper.style.visibility = originalVisibility;
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  const handleShare = async () => {
    setShowExportMenu(false);
    if (navigator.share) {
      try {
        let fileToShare = null;
        const pdfFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

        const element = document.getElementById("proposal-preview-pdf");
        if (element) {
          const wrapper = element.parentElement;
          const originalVisibility = wrapper ? wrapper.style.visibility : "";
          if (wrapper) wrapper.style.visibility = "visible";
          try {
            const html2pdf = (await import("html2pdf.js")).default;
            const pdfBlob = await html2pdf().set({
              margin: 0,
              filename: pdfFileName,
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            }).from(element).output("blob");

            if (pdfBlob) {
              fileToShare = new File([pdfBlob], pdfFileName, { type: "application/pdf" });
            }
          } catch (e) {
            console.error("Failed to generate PDF for sharing:", e);
          } finally {
            if (wrapper) wrapper.style.visibility = originalVisibility;
          }
        }

        const shareData = {
          title: `Proposal: ${identity}`,
          text: `Check out this proposal for ${clientName}`,
        };

        if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
          shareData.files = [fileToShare];
        } else {
          shareData.url = window.location.href;
        }

        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      alert("Native sharing is not supported on your browser. Please use 'Copy Link' instead.");
    }
  };

  const handleCopyLink = () => {
    setShowExportMenu(false);
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const renderExportMenu = () => (
    <div className={styles.exportDropdownMenu}>
      <button type="button" onClick={handleDownloadPdf} disabled={isDownloading}>
        {isDownloading ? <Loader2 size={14} className={styles.spin} /> : <Download size={14} />}
        <span>{isDownloading ? "Generating PDF..." : "Download PDF"}</span>
      </button>
      <button type="button" onClick={handlePrint}>
        <Printer size={14} /> <span>Print</span>
      </button>
      <button type="button" onClick={handleShare}>
        <Share2 size={14} /> <span>Share Socials</span>
      </button>
      <button type="button" onClick={handleCopyLink}>
        <Copy size={14} /> <span>Copy Link</span>
      </button>
    </div>
  );

  return (
    <main
      ref={workspaceRef}
      className={`${styles.workspace} proposal-workspace`}
      style={{ "--panel-width": `${panelWidth}px` }}
    >
      <header className={`${styles.commandBar} d-print-none`}>
        <div className={styles.commandStart}>
          <button type="button" className={styles.iconCommand} onClick={onBack} title="Back" aria-label="Back">
            <ArrowLeft size={19} />
          </button>
          {!isViewMode && (
            <button type="button" className={styles.commandButton} onClick={onNew}>
              <FilePlus2 size={17} /> <span>New</span>
            </button>
          )}
          <span className={styles.commandDivider} />
          <div className={styles.identityBlock}>
            <strong>{identity}</strong>
            <span>{isViewMode ? "View only" : selectedLead ? `Lead ${selectedLead.lead_number}` : "Draft workspace"}</span>
          </div>
        </div>

        <div className={styles.commandActions}>
          {isViewMode ? (
            <>
              {onEditMode && (
                <button type="button" className={styles.commandButton} onClick={onEditMode} title="Edit Proposal">
                  <Pencil size={17} /><span>Edit</span>
                </button>
              )}
              <span className={styles.commandDivider} />
              <div ref={exportMenuRef} className={styles.saveButtonGroup} style={{ position: "relative" }}>
                <button 
                  type="button" 
                  className={styles.saveButton} 
                  onClick={handleDownloadPdf} 
                  disabled={isDownloading}
                  aria-label="Download PDF"
                  title="Download PDF"
                >
                  {isDownloading ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
                  <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
                </button>
                <button 
                  type="button" 
                  className={styles.saveButtonDropdownBtn} 
                  onClick={() => setShowExportMenu((prev) => !prev)}
                  aria-label="Export options"
                  title="More export options"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                {showExportMenu && renderExportMenu()}
              </div>
            </>
          ) : (
            <>
              <span className={styles.commandDivider} />
              
              <div className={styles.historyButtonGroup} style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
                <button 
                  type="button" 
                  className={styles.commandButton} 
                  onClick={onUndo} 
                  disabled={!canUndo} 
                  title="Undo"
                  style={{ opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'not-allowed', padding: '6px 8px' }}
                >
                  <Undo2 size={16} />
                </button>
                <button 
                  type="button" 
                  className={styles.commandButton} 
                  onClick={onRedo} 
                  disabled={!canRedo} 
                  title="Redo"
                  style={{ opacity: canRedo ? 1 : 0.4, cursor: canRedo ? 'pointer' : 'not-allowed', padding: '6px 8px' }}
                >
                  <Redo2 size={16} />
                </button>
              </div>

              <span className={`${styles.saveState} ${isSaved ? styles.saveStateDone : ""}`}>
                {isSaved ? <><Check size={14} /> Saved</> : "Unsaved changes"}
              </span>
              
              <div ref={exportMenuRef} className={styles.saveButtonGroup} style={{ position: "relative" }}>
                <button type="button" className={styles.saveButton} onClick={onSave} aria-label={currentProposalId ? "Update proposal" : "Save proposal"}>
                  <Save size={17} /> <span>{currentProposalId ? "Update" : "Save proposal"}</span>
                </button>
                <button 
                  type="button" 
                  className={styles.saveButtonDropdownBtn} 
                  onClick={() => setShowExportMenu((prev) => !prev)}
                  aria-label="Export options"
                  title="Export options"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                {showExportMenu && renderExportMenu()}
              </div>
            </>
          )}
        </div>
      </header>

      <div className={styles.workspaceBody}>
        {(!isViewMode || panelOpen) && (
          <nav className={`${styles.toolRail} d-print-none`} aria-label="Proposal tools">
            {/* Top section: Common daily proposal crafting tools */}
            <div className={styles.toolStack} aria-label="Common editing tools">
              {commonTools.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.toolButton} ${activeTool === id && panelOpen ? styles.toolButtonActive : ""}`}
                  onClick={() => handleTool(id)}
                  aria-pressed={activeTool === id && panelOpen}
                  title={label}
                >
                  <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                </button>
              ))}
            </div>

            {/* Bottom section: One-time setup / master management tools */}
            <div className={styles.toolStackBottom} aria-label="Setup and configuration tools">
              <div className={styles.toolRailDivider} />
              {oneTimeTools.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.toolButton} ${activeTool === id && panelOpen ? styles.toolButtonActive : ""}`}
                  onClick={() => handleTool(id)}
                  aria-pressed={activeTool === id && panelOpen}
                  title={label}
                >
                  <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}

        {panelOpen && (!isViewMode || activeTool === "proposals") && (
          <aside
            className={`${styles.editorPanel} d-print-none`}
            style={{ width: `${panelWidth}px` }}
          >
            <div className={styles.panelHeader}>
              <div>
                <h1>{panelMeta[activeTool]?.[0] || "Recent proposals"}</h1>
                <p>{panelMeta[activeTool]?.[1] || ""}</p>
              </div>
              <div className={styles.panelHeaderActions}>
                <button
                  type="button"
                  onClick={togglePanelWidth}
                  title={panelWidth >= 650 ? "Standard width (480px)" : "Wide view (750px)"}
                  aria-label={panelWidth >= 650 ? "Restore standard width" : "Expand panel width"}
                >
                  {panelWidth >= 650 ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close editing panel"
                  title="Collapse panel"
                >
                  <PanelLeftClose size={19} />
                </button>
              </div>
            </div>
            <div className={styles.panelScroll}>
              {panelContent}
            </div>

            {/* Draggable resize handle on right border */}
            <div
              className={`${styles.resizeHandle} ${isResizing ? styles.resizeHandleActive : ""}`}
              onMouseDown={startResizing}
              title="Drag right or left to adjust panel width"
              role="separator"
              aria-orientation="vertical"
            >
              <div className={styles.resizeHandleGrip} />
            </div>
          </aside>
        )}

        <section ref={stageRef} className={`${styles.canvasStage} ${isViewMode ? styles.canvasViewMode : ""}`}>
          {!panelOpen && (
            <button type="button" className={`${styles.openPanel} d-print-none`} onClick={() => setPanelOpen(true)}>
              <PanelLeftOpen size={18} /> {isViewMode ? "Open panel" : "Open editor"}
            </button>
          )}
          {isViewMode && <span className={`${styles.viewBadge} d-print-none`}>View only</span>}

          {/* Hidden full-height render for measurement */}
          <div ref={measureRef} className={styles.printRender} aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: 0, width: "794px", visibility: "hidden", pointerEvents: "none" }}>
            <div id="proposal-preview-pdf" className={`${styles.paper} print-full-width`} style={{ transform: "none", minHeight: "auto" }}>
              <ProposalPreview headerData={headerData} sections={sections} services={services} totalPages={totalPages} settingsUpdatedAt={settingsUpdatedAt} />
            </div>
          </div>

          <div ref={canvasViewportRef} className={styles.canvasViewport} style={{ "--proposal-zoom": zoom / 100 }} onClick={handlePreviewClick}>
            <div className={styles.pagesContainer}>
              {Array.from({ length: totalPages }, (_, i) => {
                const currentBreak = pageBreaks[i] || 0;
                const nextBreak = pageBreaks[i + 1];
                const visibleHeight = nextBreak ? nextBreak - currentBreak : (1123 - 52);

                return (
                  <div key={i} ref={i === 0 ? null : undefined} className={styles.pageCard} data-page={i}>
                    <div className={styles.pageClip}>
                      <div style={{ padding: "26px", height: "1123px", boxSizing: "border-box" }}>
                        <div style={{ border: "2px solid black", height: "100%", position: "relative", boxSizing: "border-box", background: "white" }}>
                          <div style={{ height: `${visibleHeight}px`, overflow: "hidden" }}>
                            <div style={{ transform: `translateY(-${currentBreak}px)`, width: "100%" }}>
                              <ProposalPreview headerData={headerData} sections={sections} services={services} totalPages={totalPages} currentPage={i + 1} settingsUpdatedAt={settingsUpdatedAt} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`${styles.pageNumber} d-print-none`}>Page {i + 1} of {totalPages}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Page thumbnail strip – Canva style */}
          {totalPages > 1 && (
            <div className={`${styles.pageStrip} d-print-none`}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} type="button" className={`${styles.pageThumb} ${activePage === i ? styles.pageThumbActive : ""}`} onClick={() => scrollToPage(i)}>
                  <span>{i + 1}</span>
                </button>
              ))}
              <span className={styles.pageStripLabel}>{totalPages} pages</span>
            </div>
          )}

          <div className={`${styles.viewportControls} d-print-none`}>
            <button type="button" onClick={() => { manualZoomRef.current = true; setZoom((value) => Math.max(30, value - 10)); }} aria-label="Zoom out"><Minus size={17} /></button>
            <span>{zoom}%</span>
            <button type="button" onClick={() => { manualZoomRef.current = true; setZoom((value) => Math.min(130, value + 10)); }} aria-label="Zoom in"><ZoomIn size={17} /></button>
            <i />
            <button type="button" onClick={fitPage} title="Fit page" aria-label="Fit page"><Focus size={17} /></button>
            <button type="button" onClick={toggleFullscreen} title="Fullscreen" aria-label="Fullscreen"><Maximize2 size={17} /></button>
            <i />
            <button 
              type="button" 
              onClick={handleDownloadPdf} 
              disabled={isDownloading} 
              title="Download PDF" 
              aria-label="Download PDF"
            >
              {isDownloading ? <Loader2 size={17} className={styles.spin} /> : <Download size={17} />}
            </button>
            <button 
              type="button" 
              onClick={handlePrint} 
              title="Print" 
              aria-label="Print"
            >
              <Printer size={17} />
            </button>
          </div>
        </section>
      </div>

      {showSettingsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <div style={{ background: '#f8fafc', width: '100%', maxWidth: '1400px', height: '100%', maxHeight: '90vh', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>Organization Settings</h3>
              <button 
                onClick={() => {
                  setShowSettingsModal(false);
                  setSettingsUpdatedAt(Date.now());
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <SettingsPanel API_BASE={API_BASE_URL} proposalOnly={true} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
