const fs = require('fs');
const file = 'c:\\Projects\\Adstra_Digital\\adstra-next\\src\\components\\admin_side\\SocialManagement\\components\\WorkflowStageSection.jsx';
let content = fs.readFileSync(file, 'utf8');

const prefix = `"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  FileText,
  CheckCircle2,
  Palette,
  Users,
  Eye,
  Calendar as CalendarIcon,
  Send,
  RotateCcw,
  Plus,
  Search,
  Filter,
  Link as LinkIcon,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  Layers,
  Smartphone,
  ExternalLink,
  X,
  Sparkles,
  List,
  Calendar,
  History,
  Play,
  Upload,
  ChevronDown,
  Download,
  Trash2,
  Maximize2,
  Share2,
  Link,
  BarChart2,
  Archive
} from "lucide-react";
import ContentCalendarTab from "./ContentCalendarTab";
import ScriptCreationModal from "./ScriptCreationModal";
import ScriptViewModal from "./ScriptViewModal";
import PostTimelineModal from "./PostTimelineModal";
import WorkDetailsModal from "./WorkDetailsModal";
import MediaPreviewModal from "./MediaPreviewModal";

export default function WorkflowStageSection({
  stageId,
  posts = [],
  clients = [],
  mediaAssets = [],
  selectedClientId = "all",
  onRefresh,
  onOpenCreatePost,
  onNavigateStage,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [scriptSubFilter, setScriptSubFilter] = useState("all");
  const [viewMode, setViewMode] = useState("listing");
`;

if (!content.includes('export default function WorkflowStageSection')) {
    fs.writeFileSync(file, prefix + content);
    console.log("Restored prefix successfully.");
} else {
    console.log("Component already has export default. Aborting to prevent double prefix.");
}
