"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import { useModal } from "@/Context/ModalContext";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Code,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Globe,
  Search,
  RefreshCw,
  Save,
  BookOpen,
  Tag,
  User,
  Clock,
  ChevronRight,
  Upload,
  UploadCloud
} from "lucide-react";
import { getMediaUrl } from "@/utils/contentImage";
import parse from "html-react-parser";
import { keywordLinks } from "@/data/keywordLinks";
import "../../BlogDetails/BlogDetails.css";
import "./BlogCreator.css";

export default function BlogCreator() {
  const { showConfirm } = useModal();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // View state: 'list' or 'edit' or 'create'
  const [viewState, setViewState] = useState("list");

  // Overall engine section tab: 'articles' or 'keywords'
  const [activeSection, setActiveSection] = useState("articles");

  // Keyword interlinking manager states
  const [dbKeywordLinks, setDbKeywordLinks] = useState({});
  const [keywordList, setKeywordList] = useState([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [kwEditId, setKwEditId] = useState(null);
  const [kwKeyword, setKwKeyword] = useState("");
  const [kwLink, setKwLink] = useState("");
  const [kwType, setKwType] = useState("internal");
  const [kwFormActive, setKwFormActive] = useState(false);
  const [keywordTypeFilter, setKeywordTypeFilter] = useState("all");
  
  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [editId, setEditId] = useState(null);
  const [originalSlug, setOriginalSlug] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [excerptTitle, setExcerptTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [author, setAuthor] = useState("Adstra Digital Team");
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().split("T")[0]);
  const [readingTime, setReadingTime] = useState("8 min read");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [interlinkSearch, setInterlinkSearch] = useState("");
  
  // Tab states inside Editor
  const [editorTab, setEditorTab] = useState("edit"); // 'edit', 'preview', 'schema'
  const [seoPreviewTab, setSeoPreviewTab] = useState("google"); // 'google', 'facebook', 'twitter'

  const contentTextareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/blogs/upload/`, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data"
        }
      });
      if (res.data && res.data.url) {
        setImageUrl(res.data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = () => {
    setImageUrl("");
  };

  const getFullImageUrl = (url) => {
    return getMediaUrl(url);
  };

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const createInterlinker = (activeKeywords) => {
    const keywordCounts = {};
    const maxPerKeyword = 3;
    const keywords = Object.keys(activeKeywords || {}).sort(
      (a, b) => b.length - a.length
    );

    const formatMarkdown = (text) => {
      let formattedText = text;
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong style="color: inherit; font-weight: 700;">$1</strong>');
      formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      formattedText = formattedText.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="blog-content-image" style="max-width: 100%; height: auto; margin: 1.5em 0; border-radius: 8px;" />');
      formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, url) => {
        const isInternal = url.startsWith('/') || url.includes('adstradigital.com');
        if (isInternal) {
          return `<a href="${url}" class="interlink">${linkText}</a>`;
        } else {
          return `<a href="${url}" class="interlink" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        }
      });
      return formattedText;
    };

    if (keywords.length === 0) {
      return (text) => parse(formatMarkdown(text));
    }

    const regex = new RegExp(`\\b(${keywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join("|")})\\b`, "gi");

    return (text) => {
      const formattedText = formatMarkdown(text);
      const parts = formattedText.split(/(<[^>]+>)/g);
      let insideLink = false;
      const processedParts = [];

      for (const part of parts) {
        if (part.startsWith("<") && part.endsWith(">")) {
          const lowerPart = part.toLowerCase();
          if (lowerPart.startsWith("<a ") || lowerPart === "<a>") {
            insideLink = true;
          } else if (lowerPart === "</a>") {
            insideLink = false;
          }
          processedParts.push(part);
        } else {
          if (insideLink) {
            processedParts.push(part);
          } else {
            processedParts.push(
              part.replace(regex, (match) => {
                const matchedKey = keywords.find(k => k.toLowerCase() === match.toLowerCase()) || match;
                const targetObj = activeKeywords[matchedKey];
                if (!targetObj) return match;

                let link = "";
                let isInternal = true;

                if (typeof targetObj === "object") {
                  link = targetObj.link;
                  isInternal = targetObj.type ? (targetObj.type === "internal") : ((link || "").startsWith('/') || (link || "").includes('adstradigital.com'));
                } else {
                  link = targetObj;
                  isInternal = (link || "").startsWith('/') || (link || "").includes('adstradigital.com') || (link || "").startsWith('http://localhost') || (link || "").startsWith('http://127.0.0.1');
                }

                keywordCounts[matchedKey] = (keywordCounts[matchedKey] || 0) + 1;
                if (keywordCounts[matchedKey] > maxPerKeyword) return match;

                if (isInternal) {
                  return `<a href="${link}" class="interlink">${match}</a>`;
                } else {
                  return `<a href="${link}" class="interlink" target="_blank" rel="noopener noreferrer">${match}</a>`;
                }
              })
            );
          }
        }
      }

      return parse(processedParts.join(""));
    };
  };

  const activeKeywords = Object.keys(dbKeywordLinks).length > 0 ? dbKeywordLinks : keywordLinks;

  // Filter to apply only picked/selected keywords
  const filteredActiveKeywords = {};
  selectedKeywords.forEach(kw => {
    if (activeKeywords[kw]) {
      filteredActiveKeywords[kw] = activeKeywords[kw];
    }
  });

  const interlinkText = createInterlinker(filteredActiveKeywords);

  const formatSection = (para, index, allParas) => {
    // Standard Markdown Headings (e.g. ## Heading or ### Heading)
    if (/^##\s+(.+)$/.test(para)) {
      const headingText = para.replace(/^##\s+/, "");
      return (
        <h2 className="blog-subheading" key={index}>
          {interlinkText(headingText)}
        </h2>
      );
    }

    if (/^###\s+(.+)$/.test(para)) {
      const headingText = para.replace(/^###\s+/, "");
      return (
        <h3 className="blog-subheading" style={{ fontSize: "1.2em", color: "var(--accent-strong)", marginTop: "1.5em", marginBottom: "0.8em" }} key={index}>
          {interlinkText(headingText)}
        </h3>
      );
    }

    if (
      /^Introduction$/i.test(para) ||
      /^Consulion$/i.test(para) ||
      /^Final Thoughts$/i.test(para) ||
      /^FAQs?$/i.test(para) ||
      /^Conclusion$/i.test(para)
    ) {
      return (
        <h2 className="blog-subheading" key={index}>
          {para}
        </h2>
      );
    }

    if (/^[A-Z]\.\s+/.test(para)) {
      return (
        <h3 className="blog-subheading" style={{ fontSize: "1.1em", fontWeight: "700", color: "var(--accent-strong)", marginTop: "1.2em" }} key={index}>
          {interlinkText(para)}
        </h3>
      );
    }

    if (para.includes("|") && para.includes("---") && para.split("\n").length >= 3) {
      const rows = para.trim().split("\n").map(row => row.trim()).filter(Boolean);
      const tableRows = rows.map(row => {
        const content = row.replace(/^\||\|$/g, '');
        return content.split("|").map(cell => cell.trim());
      });
      const separatorIndex = tableRows.findIndex(row => row.some(cell => /^[-: ]+$/.test(cell)));
      if (separatorIndex !== -1) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.filter((_, idx) => idx !== separatorIndex && idx !== 0);
        return (
          <div key={index} className="blog-table-container" style={{ overflowX: "auto", marginBottom: "2em" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text-primary)", border: "1px solid rgba(28, 36, 48, 0.12)" }}>
              <thead>
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={`th-${idx}`} style={{ border: "1px solid rgba(28, 36, 48, 0.12)", padding: "10px", backgroundColor: "var(--surface-alt)", fontWeight: "700" }}>
                      {interlinkText(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={`tr-${rIdx}`}>
                    {row.map((cell, cIdx) => (
                      <td key={`td-${rIdx}-${cIdx}`} style={{ border: "1px solid rgba(28, 36, 48, 0.12)", padding: "10px" }}>
                        {interlinkText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    if (/^\s*\d+[\.)]\s+/.test(para)) {
      let sequentialCount = 0;
      for (let i = index; i < allParas.length; i++) {
        if (allParas[i] && /^\s*\d+[\.)]\s+/.test(allParas[i])) {
          sequentialCount++;
        } else {
          break;
        }
      }
      if (sequentialCount >= 3) {
        const items = [];
        for (let i = index; i < allParas.length; i++) {
          const next = allParas[i];
          if (next && /^\s*\d+[\.)]\s+/.test(next)) {
            const cleanedText = next.replace(/^\s*\d+[\.)]\s+/, "");
            items.push(
              <li key={i} style={{ marginBottom: "0.5em", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                {interlinkText(cleanedText)}
              </li>
            );
            allParas[i] = null;
          } else {
            break;
          }
        }
        return (
          <ol key={`ol-${index}`} className="blog-numbered-list" style={{ marginLeft: "1.5em", marginBottom: "1em", color: "var(--text-secondary)" }}>
            {items}
          </ol>
        );
      } else {
        return (
          <h3 className="blog-subheading" style={{ fontSize: "1.2em", color: "var(--accent-strong)", marginBottom: "0.5em" }} key={index}>
            {interlinkText(para)}
          </h3>
        );
      }
    }

    if (/^[-•*✔]\s+/.test(para)) {
      const items = [];
      for (let i = index; i < allParas.length; i++) {
        const next = allParas[i];
        if (next && /^[-•*✔]\s+/.test(next)) {
          const cleanedText = next.replace(/^[-•*✔]\s+/, "");
          items.push(
            <li key={i} style={{ marginBottom: "0.5em", lineHeight: "1.6", color: "var(--text-secondary)" }}>
              {interlinkText(cleanedText)}
            </li>
          );
          allParas[i] = null;
        } else {
          break;
        }
      }
      return (
        <ul key={`ul-${index}`} className="blog-bullet-list" style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
          {items}
        </ul>
      );
    }

    return <p key={index} style={{ lineHeight: "1.8", marginBottom: "1em", color: "var(--text-secondary)" }}>{interlinkText(para)}</p>;
  };



  // Helper: Get token headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch keyword links from DB
  const fetchKeywords = async () => {
    setKeywordLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/blogs/keywords/`);
      setKeywordList(res.data || []);
      const mapping = {};
      (res.data || []).forEach(item => {
        mapping[item.keyword] = {
          link: item.link,
          type: item.link_type
        };
      });
      setDbKeywordLinks(mapping);
    } catch (err) {
      console.error("Error fetching keywords from API:", err);
    } finally {
      setKeywordLoading(false);
    }
  };

  // Auth Protection and Initial Load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          setIsSessionExpired(true);
          return;
        }
        fetchBlogs();
        fetchKeywords();
      } catch (e) {
        router.push("/userlogin");
      }
    } else {
      router.push("/userlogin");
    }
  }, []);

  // Save or Update Keyword Link
  const handleSaveKeyword = async (e) => {
    e.preventDefault();
    if (!kwKeyword.trim() || !kwLink.trim()) {
      alert("Please enter both Anchor Keyword and Target Link.");
      return;
    }
    setKeywordLoading(true);
    try {
      let formattedLink = kwLink.trim();
      if (kwType === "internal") {
        if (!formattedLink.startsWith("/") && 
            !formattedLink.startsWith("http://") && 
            !formattedLink.startsWith("https://")) {
          formattedLink = "/" + formattedLink;
        }
      }
      const payload = {
        keyword: kwKeyword.trim(),
        link: formattedLink,
        link_type: kwType
      };
      if (kwEditId) {
        try {
          await axios.put(`${API_BASE_URL}/blogs/keywords/${kwEditId}/`, payload, {
            headers: getAuthHeaders(),
          });
        } catch (err) {
          // If the edit ID doesn't exist in the database (e.g. server restarted / db reset in background),
          // fallback to creating it as a new rule
          if (err.response?.status === 404) {
            await axios.post(`${API_BASE_URL}/blogs/keywords/`, payload, {
              headers: getAuthHeaders(),
            });
          } else {
            throw err;
          }
        }
      } else {
        await axios.post(`${API_BASE_URL}/blogs/keywords/`, payload, {
          headers: getAuthHeaders(),
        });
      }
      setKwKeyword("");
      setKwLink("");
      setKwType("internal");
      setKwEditId(null);
      setKwFormActive(false);
      fetchKeywords();
    } catch (err) {
      console.error("Error saving keyword link:", err);
      let errorMsg = err.message;
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          if (err.response.data.keyword) {
            errorMsg = `The anchor keyword phrase "${kwKeyword.trim()}" is already registered. Each keyword mapping must have a unique anchor keyword.`;
          } else {
            errorMsg = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join('\n');
          }
        } else {
          errorMsg = String(err.response.data);
        }
      }
      alert("Error saving keyword mapping:\n\n" + errorMsg);
    } finally {
      setKeywordLoading(false);
    }
  };

  // Delete Keyword Link Mapping
  const handleDeleteKeyword = (kwItem) => {
    showConfirm(
      "Delete Interlink Mapping",
      `Are you sure you want to permanently delete the dynamic interlink mapping for keyword "${kwItem.keyword}"?`,
      async () => {
        setKeywordLoading(true);
        try {
          await axios.delete(`${API_BASE_URL}/blogs/keywords/${kwItem.id}/`, {
            headers: getAuthHeaders(),
          });
          fetchKeywords();
        } catch (err) {
          if (err.response?.status === 404) {
            // Already deleted or database reset, just refresh the list silently
            fetchKeywords();
          } else {
            alert("Error deleting keyword mapping: " + (err.response?.data?.detail || err.message));
          }
        } finally {
          setKeywordLoading(false);
        }
      },
      "danger"
    );
  };

  // Fetch blogs from DB
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/blogs/`);
      setBlogs(res.data || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Slugify Helper
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start
      .replace(/-+$/, ""); // Trim - from end
  };

  // Auto-generate slug and SEO Title from main title
  useEffect(() => {
    if (viewState === "create") {
      setSlug(slugify(title));
      if (!excerptTitle) {
        setExcerptTitle(title);
      }
    }
  }, [title]);

  // Handle Tag inputs
  useEffect(() => {
    const splitTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setTags(splitTags);
  }, [tagsInput]);

  // Reset form helper
  const resetForm = () => {
    setEditId(null);
    setOriginalSlug("");
    setTitle("");
    setSlug("");
    setExcerpt("");
    setImageUrl("");
    setExcerptTitle("");
    setMetaDescription("");
    setAuthor("Adstra Digital Team");
    setPublishedDate(new Date().toISOString().split("T")[0]);
    setReadingTime("8 min read");
    setTagsInput("");
    setTags([]);
    setContent("");
    setSelectedKeywords([]);
    setInterlinkSearch("");
    setEditorTab("edit");
  };

  // Enter edit mode
  const handleEditInit = (blog) => {
    setEditId(blog.id);
    setOriginalSlug(blog.slug || "");
    setTitle(blog.title || "");
    setSlug(blog.slug || "");
    setExcerpt(blog.excerpt || "");
    setImageUrl(blog.imageUrl || "");
    setExcerptTitle(blog.excerptTitle || blog.title || "");
    setMetaDescription(blog.metaDescription || "");
    setAuthor(blog.author || "Adstra Digital Team");
    setPublishedDate(blog.publishedDate || new Date().toISOString().split("T")[0]);
    setReadingTime(blog.readingTime || "8 min read");
    
    // Handle tags (can be array or comma list)
    if (Array.isArray(blog.tags)) {
      setTags(blog.tags);
      setTagsInput(blog.tags.join(", "));
    } else {
      setTagsInput(blog.tags || "");
    }
    
    setContent(blog.content || "");
    
    // SEO picked interlinks fallback
    if (blog.seo && Array.isArray(blog.seo.selectedKeywords)) {
      setSelectedKeywords(blog.seo.selectedKeywords);
    } else if (blog.seo && blog.seo.focusKeyword) {
      setSelectedKeywords([blog.seo.focusKeyword]);
    } else {
      setSelectedKeywords([]);
    }
    setInterlinkSearch("");
    
    setViewState("edit");
  };

  // Delete Blog handler
  const handleDeleteBlog = (blog) => {
    showConfirm(
      "Delete Blog Post",
      `Are you sure you want to permanently delete "${blog.title}"? This action cannot be undone.`,
      async () => {
        try {
          await axios.delete(`${API_BASE_URL}/blogs/${blog.slug}/`, {
            headers: getAuthHeaders(),
          });
          fetchBlogs();
        } catch (err) {
          if (err.response?.status === 404) {
            // Already deleted silently refresh
            fetchBlogs();
          } else {
            alert("Error deleting blog: " + (err.response?.data?.detail || err.message));
          }
        }
      },
      "danger"
    );
  };

  // Submit/Save Handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      alert("Please fill in the required fields: Title, Slug, and Content.");
      return;
    }

    setActionLoading(true);

    const payload = {
      title,
      slug,
      excerpt,
      imageUrl,
      excerptTitle: excerptTitle || title,
      metaDescription,
      author,
      publishedDate,
      readingTime,
      tags,
      content,
      seo: {
        focusKeyword: selectedKeywords[0] || "",
        selectedKeywords: selectedKeywords,
        metaTitle: excerptTitle || title,
        metaDesc: metaDescription,
        score: seoAnalysis.score
      }
    };

    try {
      if (viewState === "create") {
        await axios.post(`${API_BASE_URL}/blogs/`, payload, {
          headers: getAuthHeaders(),
        });
      } else {
        try {
          await axios.put(`${API_BASE_URL}/blogs/${originalSlug || slug}/`, payload, {
            headers: getAuthHeaders(),
          });
        } catch (err) {
          // If the edited blog is missing from the database (e.g. database wipe/reset in background),
          // fallback to creating it as a new blog post
          if (err.response?.status === 404) {
            await axios.post(`${API_BASE_URL}/blogs/`, payload, {
              headers: getAuthHeaders(),
            });
          } else {
            throw err;
          }
        }
      }
      resetForm();
      setViewState("list");
      fetchBlogs();
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMsg = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        } else {
          errorMsg = String(err.response.data);
        }
      }
      alert("Error saving blog post:\n\n" + errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Real-Time SEO Analyzer Engine
  const analyzeSEO = () => {
    const checklist = [];
    let pointsObtained = 0;
    const totalPointsPossible = 150; // 100 base + 50 interlinking

    const lowerTitle = title.toLowerCase();
    const lowerSnippetTitle = (excerptTitle || title).toLowerCase();
    const lowerContent = content.toLowerCase();
    const lowerSlug = slug.toLowerCase();
    const lowerMeta = metaDescription.toLowerCase();

    // --- 1. Article Title Length Check ---
    const titleLen = title.length;
    let titleStatus = "fail";
    let titleDesc = "Please enter an Article Title to get started.";
    let titlePoints = 0;

    if (titleLen >= 40 && titleLen <= 70) {
      titleStatus = "pass";
      titleDesc = `Perfect! Title is ${titleLen} characters (recommended 40-70).`;
      titlePoints = 10;
    } else if (titleLen > 0) {
      titleStatus = "warn";
      titleDesc = `Title is ${titleLen} characters. Aim for 40-70 characters for best click rate.`;
      titlePoints = 5;
    }
    checklist.push({
      label: "Article Title Length",
      status: titleStatus,
      desc: titleDesc
    });
    pointsObtained += titlePoints;

    // --- 2. Title Power Hook Check ---
    const powerWordRegex = /how|best|guide|top|essential|ultimate|strategy|secret|build|design|brand|seo|marketing|converting|growth|tutorial|checklist|tips/i;
    const numberRegex = /\d+/;
    let hookStatus = "fail";
    let hookDesc = "Enter an Article Title to check for power words.";
    let hookPoints = 0;

    if (titleLen > 0) {
      if (powerWordRegex.test(title) || numberRegex.test(title)) {
        hookStatus = "pass";
        hookDesc = "Awesome! Title contains a high-converting power hook or number.";
        hookPoints = 10;
      } else {
        hookStatus = "warn";
        hookDesc = "Add numbers (e.g. 2026) or a power word (e.g. 'How-to', 'Ultimate Guide', 'Best') to boost CTR.";
        hookPoints = 4;
      }
    }
    checklist.push({
      label: "Article Title Hook / CTR",
      status: hookStatus,
      desc: hookDesc
    });
    pointsObtained += hookPoints;

    // --- 3. Google Snippet Title Length Check ---
    const snippetLen = (excerptTitle || title).length;
    let snippetStatus = "fail";
    let snippetDesc = "Snippet Title is missing. Enter a title to preview search results.";
    let snippetPoints = 0;

    if (snippetLen >= 40 && snippetLen <= 60) {
      snippetStatus = "pass";
      snippetDesc = `Perfect! Snippet Title is ${snippetLen} characters (recommended 40-60).`;
      snippetPoints = 10;
    } else if (snippetLen > 0) {
      snippetStatus = "warn";
      snippetDesc = `Snippet Title is ${snippetLen} characters. Aim for 40-60 characters for perfect search display.`;
      snippetPoints = 5;
    }
    checklist.push({
      label: "Google Snippet Title Length",
      status: snippetStatus,
      desc: snippetDesc
    });
    pointsObtained += snippetPoints;

    // --- 4. Meta Description Length Check ---
    const metaLen = metaDescription.length;
    let metaStatus = "fail";
    let metaDesc = "Add a Meta Description to prevent automated search summaries.";
    let metaPoints = 0;

    if (metaLen >= 120 && metaLen <= 160) {
      metaStatus = "pass";
      metaDesc = `Perfect! Meta description is ${metaLen} characters (recommended 120-160).`;
      metaPoints = 15;
    } else if (metaLen > 0) {
      metaStatus = "warn";
      metaDesc = `Meta description is ${metaLen} characters. Keep between 120-160 to avoid search truncation.`;
      metaPoints = 8;
    }
    checklist.push({
      label: "Meta Description Length",
      status: metaStatus,
      desc: metaDesc
    });
    pointsObtained += metaPoints;

    // --- 5. URL Slug Optimization ---
    const slugLen = slug.length;
    let slugStatus = "fail";
    let slugDesc = "A clean slug link is required.";
    let slugPoints = 0;

    if (slugLen > 0) {
      const isFormatCorrect = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
      if (!isFormatCorrect) {
        slugStatus = "fail";
        slugDesc = "Slug must contain only lowercase letters, numbers, and hyphens.";
        slugPoints = 0;
      } else if (slugLen >= 15 && slugLen <= 55) {
        slugStatus = "pass";
        slugDesc = `Excellent! Slug is optimized and ${slugLen} characters.`;
        slugPoints = 10;
      } else {
        slugStatus = "warn";
        slugDesc = `Slug is valid but length is ${slugLen} chars (ideal range is 15-55).`;
        slugPoints = 6;
      }
    }
    checklist.push({
      label: "URL Slug Optimization",
      status: slugStatus,
      desc: slugDesc
    });
    pointsObtained += slugPoints;

    // --- 6. Excerpt / Card Summary Check ---
    const excerptLen = excerpt.length;
    let excerptStatus = "fail";
    let excerptDesc = "Card Summary is empty. Write a 1-2 sentence preview text.";
    let excerptPoints = 0;

    if (excerptLen >= 80 && excerptLen <= 160) {
      excerptStatus = "pass";
      excerptDesc = `Perfect! Excerpt is ${excerptLen} characters (optimal range 80-160).`;
      excerptPoints = 10;
    } else if (excerptLen > 0) {
      excerptStatus = "warn";
      excerptDesc = `Excerpt is ${excerptLen} characters. Keep it between 80-160 characters for perfect layouts.`;
      excerptPoints = 5;
    }
    checklist.push({
      label: "Excerpt & Card Summary",
      status: excerptStatus,
      desc: excerptDesc
    });
    pointsObtained += excerptPoints;

    // --- 7. Word Count Check ---
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    let wordStatus = "fail";
    let wordDesc = "Article Body is empty.";
    let wordPoints = 0;

    if (wordCount >= 600) {
      wordStatus = "pass";
      wordDesc = `Excellent! Rich comprehensive article with ${wordCount} words.`;
      wordPoints = 15;
    } else if (wordCount >= 300) {
      wordStatus = "warn";
      wordDesc = `Thin content: ${wordCount} words. Expand to at least 600 words for maximum rank strength.`;
      wordPoints = 8;
    } else if (wordCount > 0) {
      wordStatus = "fail";
      wordDesc = `Content is too short (${wordCount} words). Add depth to reach at least 300 words.`;
      wordPoints = 3;
    }
    checklist.push({
      label: "Article Word Count",
      status: wordStatus,
      desc: wordDesc
    });
    pointsObtained += wordPoints;

    // --- 8. Headings Hierarchy Check ---
    let headingsStatus = "fail";
    let headingsDesc = "Content is empty.";
    let headingsPoints = 0;

    if (wordCount > 0) {
      const hasHeadings = /^(##|###)\s+.+$/m.test(content);
      if (hasHeadings) {
        headingsStatus = "pass";
        headingsDesc = "Perfect! Subheadings (H2 or H3) are used to organize the text hierarchy.";
        headingsPoints = 10;
      } else {
        headingsStatus = "warn";
        headingsDesc = "Add subheadings (e.g. ## Heading) to break down content and help indexation.";
        headingsPoints = 4;
      }
    }
    checklist.push({
      label: "Content Headings Hierarchy",
      status: headingsStatus,
      desc: headingsDesc
    });
    pointsObtained += headingsPoints;

    // --- 9. Cover Image Upload Check ---
    let imgStatus = "fail";
    let imgDesc = "No cover image specified. Upload one to build visual SEO.";
    let imgPoints = 0;

    if (imageUrl) {
      imgStatus = "pass";
      imgDesc = "Awesome! Premium cover image loaded for index cards and sharing.";
      imgPoints = 5;
    }
    checklist.push({
      label: "Cover Image Validation",
      status: imgStatus,
      desc: imgDesc
    });
    pointsObtained += imgPoints;

    // --- 10. Article Taxonomy Tags Check ---
    let tagsStatus = "fail";
    let tagsDesc = "Add taxonomic tags to categorize the blog post.";
    let tagsPoints = 0;

    if (tags.length >= 2) {
      tagsStatus = "pass";
      tagsDesc = `Perfect! Categorized under ${tags.length} taxonomic tags.`;
      tagsPoints = 5;
    } else if (tags.length === 1) {
      tagsStatus = "warn";
      tagsDesc = "Add at least 2 relevant tags to build semantic categories.";
      tagsPoints = 2;
    }
    checklist.push({
      label: "Taxonomy & Tags",
      status: tagsStatus,
      desc: tagsDesc
    });
    pointsObtained += tagsPoints;

    // --- 11. DYNAMIC PICKED INTERLINK INTEGRATION ---
    const activeKeywords = Object.keys(dbKeywordLinks).length > 0 ? dbKeywordLinks : keywordLinks;
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Filter selected keywords actually present in content
    const foundKeywords = selectedKeywords.filter(kw => {
      const regex = new RegExp(`\\b${escapeRegex(kw.toLowerCase())}\\b`, 'i');
      return regex.test(lowerContent);
    });

    const foundInternal = [];
    const foundExternal = [];

    foundKeywords.forEach(kw => {
      const val = activeKeywords[kw];
      if (val) {
        let isInternal = true;
        if (typeof val === "object") {
          isInternal = val.type ? (val.type === "internal") : ((val.link || "").startsWith('/') || (val.link || "").includes('adstradigital.com'));
        } else {
          isInternal = (val || "").startsWith('/') || (val || "").includes('adstradigital.com') || (val || "").startsWith('http://localhost') || (val || "").startsWith('http://127.0.0.1');
        }
        if (isInternal) {
          foundInternal.push(kw);
        } else {
          foundExternal.push(kw);
        }
      }
    });

    const totalSelectedInternal = selectedKeywords.filter(kw => {
      const val = activeKeywords[kw];
      if (!val) return false;
      if (typeof val === "object") return val.type ? (val.type === "internal") : ((val.link || "").startsWith('/') || (val.link || "").includes('adstradigital.com'));
      return (val || "").startsWith('/') || (val || "").includes('adstradigital.com') || (val || "").startsWith('http://localhost') || (val || "").startsWith('http://127.0.0.1');
    }).length;

    const totalSelectedExternal = selectedKeywords.length - totalSelectedInternal;

    // Internal Link checklist item
    let internalStatus = "fail";
    let internalDesc = "No internal links selected. Select some to spread search equity.";
    let internalPoints = 0;

    if (foundInternal.length >= 1) {
      internalStatus = "pass";
      internalDesc = `Perfect! ${foundInternal.length} selected internal links are active and linked in your blog body.`;
      internalPoints = 15;
    } else if (totalSelectedInternal >= 1) {
      internalStatus = "warn";
      internalDesc = `${totalSelectedInternal} internal links selected, but keywords were not found in the text. Add the phrases to your article body.`;
      internalPoints = 8;
    }
    checklist.push({
      label: "Internal Linking Integration",
      status: internalStatus,
      desc: internalDesc
    });
    pointsObtained += internalPoints;

    // External Link checklist item
    let externalStatus = "fail";
    let externalDesc = "No external links selected. Select external sources for better trust validation.";
    let externalPoints = 0;

    if (foundExternal.length >= 1) {
      externalStatus = "pass";
      externalDesc = `Perfect! ${foundExternal.length} selected external links are active and linked in your blog body.`;
      externalPoints = 15;
    } else if (totalSelectedExternal >= 1) {
      externalStatus = "warn";
      externalDesc = `${totalSelectedExternal} external links selected, but keywords were not found in the text.`;
      externalPoints = 8;
    }
    checklist.push({
      label: "External Linking Integration",
      status: externalStatus,
      desc: externalDesc
    });
    pointsObtained += externalPoints;

    // Link Density checklist item
    let densityStatus = "fail";
    let densityDesc = "No active interlinks found. Select registered keywords that are written in your content.";
    let densityPoints = 0;

    if (foundKeywords.length >= 1 && foundKeywords.length <= 6) {
      densityStatus = "pass";
      densityDesc = `${foundKeywords.length} active links is an optimal density for high-converting user experience.`;
      densityPoints = 20;
    } else if (foundKeywords.length > 6) {
      densityStatus = "warn";
      densityDesc = `High link density (${foundKeywords.length} active links). Avoid over-linking to keep reading experience natural.`;
      densityPoints = 10;
    }
    checklist.push({
      label: "Active Interlink Density Check",
      status: densityStatus,
      desc: densityDesc
    });
    pointsObtained += densityPoints;

    const calculatedScore = Math.round((pointsObtained / totalPointsPossible) * 100);

    return {
      score: Math.min(100, Math.max(0, calculatedScore)),
      checklist,
      wordCount
    };
  };

  const seoAnalysis = analyzeSEO();

  // Dynamic Schema.org Generator
  const generateSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://adstradigital.com/blogs/${slug || "your-slug"}/`
      },
      "headline": title || "Blog Title Placeholder",
      "alternativeHeadline": excerptTitle || title || "Alternative Title Placeholder",
      "description": excerpt || "A descriptive summary of the blog post...",
      "image": imageUrl || "https://adstradigital.com/placeholder-cover.jpg",
      "author": {
        "@type": "Person",
        "name": author || "Adstra Digital Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Adstra Digital",
        "logo": {
          "@type": "ImageObject",
          "url": "https://adstradigital.com/_next/static/media/logo-new-03.a8aee72e.png"
        }
      },
      "datePublished": publishedDate,
      "dateModified": publishedDate,
      "inLanguage": "en-US"
    };
  };

  // Helper for Markdown Text Area
  const insertMarkdown = (syntaxStart, syntaxEnd = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = syntaxStart + selectedText + syntaxEnd;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    // Update the DOM element directly first to prevent React from resetting the caret position
    textarea.value = newContent;
    setContent(newContent);

    const newStart = start + syntaxStart.length;
    const newEnd = newStart + selectedText.length;

    // Set selection range immediately
    textarea.focus();
    textarea.setSelectionRange(newStart, newEnd);

    // Backup selection in a microtask/setTimeout in case of delayed React render commits
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  // Filtered blogs
  const filteredBlogs = blogs.filter((blog) =>
    (blog.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (blog.slug || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic Keyword list and stats calculations
  const totalKeywords = keywordList.length;
  const internalKeywords = keywordList.filter(k => {
    return k.link_type ? (k.link_type === "internal") : (
      (k.link || "").startsWith('/') || 
      (k.link || "").includes('adstradigital.com') || 
      (k.link || "").startsWith('http://localhost') || 
      (k.link || "").startsWith('http://127.0.0.1')
    );
  }).length;
  const externalKeywords = totalKeywords - internalKeywords;

  const filteredKeywords = keywordList.filter(kw => {
    const matchesSearch = (kw.keyword || "").toLowerCase().includes(keywordSearch.toLowerCase()) ||
      (kw.link || "").toLowerCase().includes(keywordSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const isInternal = kw.link_type ? (kw.link_type === "internal") : (
      (kw.link || "").startsWith('/') || 
      (kw.link || "").includes('adstradigital.com') || 
      (kw.link || "").startsWith('http://localhost') || 
      (kw.link || "").startsWith('http://127.0.0.1')
    );

    if (keywordTypeFilter === "internal") return isInternal;
    if (keywordTypeFilter === "external") return !isInternal;
    return true;
  });

  return (
    <div className="blogcreator-page">
      {/* Top Header */}
      <header className="blogcreator-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => router.push("/admindashboard")}>
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </button>
          <div className="header-title">
            <h2>Adstra Content Engine</h2>
            <p>Generate, Optimize, and Orchestrate SEO-Driven Copy</p>
          </div>
        </div>

        {viewState !== "list" && activeSection === "articles" && (
          <div className="header-actions">
            <button className="cancel-btn" onClick={() => { resetForm(); setViewState("list"); }}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={actionLoading}>
              <Save size={16} />
              <span>{actionLoading ? "Saving..." : viewState === "create" ? "Publish Blog" : "Update Blog"}</span>
            </button>
          </div>
        )}
      </header>

      {/* Top Navigation Tabs */}
      {viewState === "list" && (
        <div className="blogcreator-nav-tabs">
          <button 
            className={`nav-tab ${activeSection === "articles" ? "active" : ""}`}
            onClick={() => setActiveSection("articles")}
          >
            <BookOpen size={16} />
            <span>Articles Manager</span>
          </button>
          <button 
            className={`nav-tab ${activeSection === "keywords" ? "active" : ""}`}
            onClick={() => setActiveSection("keywords")}
          >
            <Globe size={16} />
            <span>SEO Interlinks Manager</span>
          </button>
        </div>
      )}

      {/* Main Grid Content */}
      <main className="blogcreator-container">
        
        {/* LIST VIEW (DASHBOARD) */}
        {viewState === "list" && activeSection === "articles" && (
          <div className="blogcreator-list-view">
            <div className="list-toolbar">
              <div className="search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search articles by title or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="create-new-btn" onClick={() => { resetForm(); setViewState("create"); }}>
                <Plus size={18} />
                <span>Compose Article</span>
              </button>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <RefreshCw size={36} className="spin" />
                <p>Loading your articles...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="empty-state">
                <ImageIcon size={48} />
                <h3>No Blog Posts Found</h3>
                <p>{searchTerm ? "No articles matches your query." : "Let's create your very first dynamic article!"}</p>
                {!searchTerm && (
                  <button className="create-new-btn mt-4" onClick={() => { resetForm(); setViewState("create"); }}>
                    Create Blog
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="blogcreator-table">
                  <thead>
                    <tr>
                      <th>Title & Date</th>
                      <th>Slug</th>
                      <th>Author</th>
                      <th>Tags</th>
                      <th>SEO Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((blog) => {
                      const calculatedScore = blog.seo?.score || 60;
                      let scoreColor = "score-low";
                      if (calculatedScore >= 80) scoreColor = "score-high";
                      else if (calculatedScore >= 50) scoreColor = "score-mid";

                      return (
                        <tr key={blog.id}>
                          <td className="col-title">
                            <div className="title-cell">
                              <strong>{blog.title}</strong>
                              <span>Published: {blog.publishedDate || "No Date"}</span>
                            </div>
                          </td>
                          <td className="col-slug">
                            <span className="slug-badge">/blogs/{blog.slug}</span>
                          </td>
                          <td className="col-author">
                            <div className="author-cell">
                              <User size={14} />
                              <span>{blog.author || "Adstra Team"}</span>
                            </div>
                          </td>
                          <td className="col-tags">
                            <div className="tags-list">
                              {(Array.isArray(blog.tags) ? blog.tags : (blog.tags || "").split(",")).slice(0, 2).map((tag, idx) => (
                                tag && <span key={idx} className="tag-pill">{tag.trim()}</span>
                              ))}
                              {(Array.isArray(blog.tags) ? blog.tags : (blog.tags || "").split(",")).length > 2 && (
                                <span className="tag-more">+{ (Array.isArray(blog.tags) ? blog.tags : (blog.tags || "").split(",")).length - 2 }</span>
                              )}
                            </div>
                          </td>
                          <td className="col-seo">
                            <div className={`seo-grade-badge ${scoreColor}`}>
                              {calculatedScore} / 100
                            </div>
                          </td>
                          <td className="col-actions">
                            <div className="actions-cell">
                              <button className="action-btn edit" onClick={() => handleEditInit(blog)} title="Edit Article">
                                <Edit2 size={16} />
                              </button>
                              <button className="action-btn delete" onClick={() => handleDeleteBlog(blog)} title="Delete Article">
                                <Trash2 size={16} />
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
          </div>
        )}

        {/* SEO INTERLINKS MANAGER VIEW */}
        {viewState === "list" && activeSection === "keywords" && (
          <div className="seo-interlinks-view">
            
            {/* Quick Metrics Dashboard */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon yellow-accent">
                  <Globe size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{totalKeywords}</span>
                  <span className="stat-label">Active Keyword Rules</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon emerald">
                  <CheckCircle2 size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{internalKeywords}</span>
                  <span className="stat-label">Internal Blog Interlinks</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon rose">
                  <ExternalLink size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{externalKeywords}</span>
                  <span className="stat-label">External Reference Links</span>
                </div>
              </div>
            </div>

            <div className="interlinks-workspace">
              {/* Left Side: Interlink Rules List Table */}
              <div className="panel-card-full main-registry" style={{ flex: 1, width: "100%" }}>
                <div className="registry-header-row">
                  <h4>Active Interlink Registry</h4>
                  <div className="registry-actions">
                    <div className="search-bar">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Filter keyword mappings..."
                        value={keywordSearch}
                        onChange={(e) => setKeywordSearch(e.target.value)}
                      />
                    </div>
                    <select
                      value={keywordTypeFilter}
                      onChange={(e) => setKeywordTypeFilter(e.target.value)}
                      className="registry-filter-select"
                    >
                      <option value="all">All Types</option>
                      <option value="internal">Internal Links</option>
                      <option value="external">External Links</option>
                    </select>
                    <button className="add-rule-btn" onClick={() => {
                      setKwEditId(null);
                      setKwKeyword("");
                      setKwLink("");
                      setKwType("internal");
                      setKwFormActive(true);
                    }}>
                      <Plus size={14} />
                      <span>Add New Rule</span>
                    </button>
                  </div>
                </div>

                {keywordLoading && keywordList.length === 0 ? (
                  <div className="loading-spinner">
                    <RefreshCw size={24} className="spin" />
                    <p>Fetching dynamic interlinks...</p>
                  </div>
                ) : filteredKeywords.length === 0 ? (
                  <div className="empty-state">
                    <Globe size={32} style={{ color: "var(--engine-accent-gold)", marginBottom: "1rem" }} />
                    <h3>No Keyword Links Found</h3>
                    <p>{keywordSearch ? "No active keyword rules match your search." : "Ready to add your first database-backed dynamic keyword link!"}</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="blogcreator-table">
                      <thead>
                        <tr>
                          <th>Keyword Term</th>
                          <th>Target Destination</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredKeywords.map((kw) => {
                          const isInternal = kw.link_type ? (kw.link_type === 'internal') : ((kw.link || "").startsWith('/') || (kw.link || "").includes('adstradigital.com') || (kw.link || "").startsWith('http://localhost') || (kw.link || "").startsWith('http://127.0.0.1'));
                          return (
                            <tr key={kw.id}>
                              <td style={{ fontWeight: '600', color: 'var(--engine-accent-gold-strong)' }}>
                                {kw.keyword}
                              </td>
                              <td>
                                <a href={kw.link} target="_blank" rel="noopener noreferrer" className="link-text-truncate">
                                  <span>{kw.link}</span>
                                  <ExternalLink size={12} style={{ opacity: 0.5, marginLeft: '0.25rem' }} />
                                </a>
                              </td>
                              <td>
                                <span className={`badge-link ${isInternal ? 'internal' : 'external'}`}>
                                  {isInternal ? 'Internal' : 'External'}
                                </span>
                              </td>
                              <td className="col-actions">
                                <div className="actions-cell">
                                  <button className="action-btn edit" onClick={() => {
                                    setKwEditId(kw.id);
                                    setKwKeyword(kw.keyword);
                                    setKwLink(kw.link);
                                    setKwType(kw.link_type || (isInternal ? 'internal' : 'external'));
                                    setKwFormActive(true);
                                  }} title="Edit Rule">
                                    <Edit2 size={14} />
                                  </button>
                                  <button className="action-btn delete" onClick={() => handleDeleteKeyword(kw)} title="Delete Rule">
                                    <Trash2 size={14} />
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
              </div>
            </div>

            {/* Modal Popup Overlay */}
            {kwFormActive && (
              <div className="seo-modal-overlay" onClick={() => {
                setKwFormActive(false);
                setKwEditId(null);
                setKwKeyword("");
                setKwLink("");
              }}>
                <div className="seo-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h4>
                      <Sparkles size={18} style={{ color: 'var(--engine-accent-gold)', marginRight: '8px' }} />
                      <span>{kwEditId ? "Modify Interlink Rule" : "Register Interlink Rule"}</span>
                    </h4>
                    <button className="close-modal-btn" onClick={() => {
                      setKwFormActive(false);
                      setKwEditId(null);
                      setKwKeyword("");
                      setKwLink("");
                    }}>×</button>
                  </div>

                  <form onSubmit={handleSaveKeyword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-field">
                      <label>Anchor Keyword Term <span className="required">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. digital marketing"
                        value={kwKeyword}
                        onChange={(e) => setKwKeyword(e.target.value)}
                        required
                      />
                      <span className="field-hint">Exact matching phrase to be hyperlinked.</span>
                    </div>

                    <div className="form-field">
                      <label>Target Destination URL <span className="required">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. /blogs/digital-marketing/"
                        value={kwLink}
                        onChange={(e) => setKwLink(e.target.value)}
                        required
                      />
                      <span className="field-hint">Full HTTP link or local router path.</span>
                    </div>

                    <div className="form-field">
                      <label>Linking Type <span className="required">*</span></label>
                      <div className="segmented-control">
                        <button
                          type="button"
                          className={`control-segment ${kwType === "internal" ? "active" : ""}`}
                          onClick={() => setKwType("internal")}
                        >
                          Internal Linking
                        </button>
                        <button
                          type="button"
                          className={`control-segment ${kwType === "external" ? "active" : ""}`}
                          onClick={() => setKwType("external")}
                        >
                          External Linking
                        </button>
                      </div>
                      <span className="field-hint">
                        {kwType === "internal" 
                          ? "Internal links point within your site and help spread PageRank." 
                          : "External links point outside and are marked with target=\"_blank\" rel=\"noopener noreferrer\"."}
                      </span>
                    </div>

                    <div className="form-actions-row">
                      <button type="submit" className="save-btn" disabled={keywordLoading}>
                        <Save size={14} />
                        <span>{kwEditId ? "Update" : "Create"} Rule</span>
                      </button>
                      <button type="button" className="cancel-btn" onClick={() => {
                        setKwFormActive(false);
                        setKwEditId(null);
                        setKwKeyword("");
                        setKwLink("");
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* EDITOR & REAL-TIME ANALYZER VIEW */}
        {viewState !== "list" && (
          <div className="blogcreator-editor-grid">
            
            {/* LEFT: COMPOSER PANEL */}
            <div className="editor-left-pane">
              <div className="pane-header">
                <h3>Draft Creator</h3>
                <div className="pane-tabs">
                  <button className={editorTab === "edit" ? "active" : ""} onClick={() => setEditorTab("edit")}>
                    Write
                  </button>
                  <button className={editorTab === "preview" ? "active" : ""} onClick={() => setEditorTab("preview")}>
                    Preview Layout
                  </button>
                  <button className={editorTab === "schema" ? "active" : ""} onClick={() => setEditorTab("schema")}>
                    JSON Schema
                  </button>
                </div>
              </div>

              {editorTab === "edit" && (
                <form className="composer-form" onSubmit={(e) => e.preventDefault()}>
                  {/* Meta Group */}
                  <div className="form-group-row">
                    <div className="form-field flex-2">
                      <label htmlFor="blog-title">Article Title <span className="required">*</span></label>
                      <input
                        id="blog-title"
                        type="text"
                        placeholder="Enter catchy, SEO-friendly headline..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field flex-1">
                      <label htmlFor="blog-slug">Slug Link <span className="required">*</span></label>
                      <input
                        id="blog-slug"
                        type="text"
                        placeholder="auto-generated-slug"
                        value={slug}
                        onChange={(e) => setSlug(slugify(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-field">
                      <label htmlFor="blog-author">Author</label>
                      <div className="input-with-icon">
                        <User size={16} />
                        <input
                          id="blog-author"
                          type="text"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="blog-date">Publish Date</label>
                      <input
                        id="blog-date"
                        type="date"
                        value={publishedDate}
                        onChange={(e) => setPublishedDate(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="blog-reading">Reading Time</label>
                      <div className="input-with-icon">
                        <Clock size={16} />
                        <input
                          id="blog-reading"
                          type="text"
                          placeholder="e.g. 5 min read"
                          value={readingTime}
                          onChange={(e) => setReadingTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-field flex-2">
                      <label>Cover Image</label>
                      <div className="image-upload-wrapper">
                        {/* Hidden File Input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                          accept="image/*"
                        />

                        {isUploading ? (
                          <div className="upload-spinner-overlay">
                            <RefreshCw size={24} className="spin" />
                            <span>Uploading cover image...</span>
                          </div>
                        ) : imageUrl ? (
                          <div className="image-preview-panel">
                            <img 
                              className="preview-thumb" 
                              src={getFullImageUrl(imageUrl)} 
                              alt="Cover Preview"
                              onError={(e) => {
                                console.error("Error loading preview image:", e.target.src);
                              }}
                            />
                            <div className="preview-details">
                              <span className="preview-name">{imageUrl.split("/").pop()}</span>
                            </div>
                            <div className="preview-actions">
                              <button 
                                type="button" 
                                className="btn-upload-action update" 
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload size={14} />
                                <span>Change</span>
                              </button>
                              <button 
                                type="button" 
                                className="btn-upload-action delete" 
                                onClick={handleImageDelete}
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="image-dropzone" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="dropzone-icon" size={32} />
                            <p className="dropzone-text">Click or Drag to Upload Cover Image</p>
                            <p className="dropzone-subtext">Supports PNG, JPG, WEBP (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-field flex-1">
                      <label htmlFor="blog-tags">Tags (comma separated)</label>
                      <div className="input-with-icon">
                        <Tag size={16} />
                        <input
                          id="blog-tags"
                          type="text"
                          placeholder="SEO, Google, AI"
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="blog-excerpt">Excerpt/Card Summary</label>
                    <textarea
                      id="blog-excerpt"
                      rows={2}
                      placeholder="Write a highly-optimized, 1-2 sentence preview text for blog index cards..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>

                  {/* Dynamic Markdown Toolbar */}
                  <div className="form-field">
                    <div className="editor-toolbar-label">
                      <label htmlFor="blog-content">Article Body <span className="required">*</span></label>
                      <span className="word-count-indicator">{seoAnalysis.wordCount} words</span>
                    </div>

                    <div className="markdown-toolbar">
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("**", "**")} title="Bold text"><strong>B</strong></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("*", "*")} title="Italic text"><em>I</em></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("## ", "\n")} title="Heading 2">H2</button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("### ", "\n")} title="Heading 3">H3</button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("[Link Text](url)", "")} title="Insert Link">Link</button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("![Image Alt](url)", "")} title="Insert Image">Image</button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("> ", "")} title="Quote Block">Quote</button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("```\n", "\n```")} title="Code Block"><Code size={14} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMarkdown("- ", "")} title="Unordered list">• List</button>
                    </div>

                    <textarea
                      id="blog-content"
                      ref={contentTextareaRef}
                      rows={14}
                      placeholder="Compose your article contents in standard HTML or Markdown formats..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>
                </form>
              )}

              {editorTab === "preview" && (() => {
                const previewSections = content
                  ? (content.trim().split(/\r?\n\s*\r?\n/) || []).flatMap((section) => {
                      return section.split(/\r?\n(?=\s*(?:[-•*✔]|\d+[\.)])\s)/).map((s) => s.trim());
                    }).filter(Boolean)
                  : [];

                return (
                  <div className="editor-live-preview">
                    <article className="blog-blocks compact" style={{ padding: 0, border: "none", background: "transparent", boxShadow: "none" }}>
                      <header style={{ width: "100%", overflow: "hidden" }}>
                        {imageUrl ? (
                          <div
                            className="blog-image"
                            style={{
                              backgroundImage: `url(${getFullImageUrl(imageUrl)})`,
                              height: "280px",
                              marginBottom: "1.5rem"
                            }}
                            role="img"
                            aria-label={title}
                          />
                        ) : (
                          <div className="preview-hero-placeholder" style={{ marginBottom: "1.5rem" }}>
                            <ImageIcon size={32} />
                            <span>No Cover Image Specified</span>
                          </div>
                        )}
                      </header>

                      <section className="blog-content mt-4">
                        <h1 className="preview-title" style={{ color: "#b1851f", fontSize: "1.8rem", fontWeight: "800", marginBottom: "1rem" }}>
                          {title || "Draft Article Title"}
                        </h1>
                        
                        <div className="blog-meta mb-3" style={{ display: "flex", gap: "1.25rem", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                          <span className="meta-item" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <User size={14} />
                            By <strong>{author || "AdstraDigital"}</strong>
                          </span>
                          <span className="meta-item" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <Clock size={14} />
                            {readingTime}
                          </span>
                          <span className="meta-item" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <Globe size={14} />
                            {formatDate(publishedDate)}
                          </span>
                        </div>

                        <div className="blog-tags" style={{ display: "flex", flexWrap: "wrap", gap: "10px", listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
                          {tags.map((t, i) => (
                            <span key={i} style={{ background: "var(--accent)", color: "var(--text-primary)", padding: "4px 10px", fontSize: "0.8rem", borderRadius: "20px", fontWeight: "600" }}>{t}</span>
                          ))}
                        </div>

                        <hr className="preview-divider" style={{ border: "none", borderTop: "1px solid rgba(28, 36, 48, 0.12)", margin: "1.5rem 0" }} />

                        <div className="preview-body" style={{ marginTop: "1rem" }}>
                          {previewSections.length > 0 ? (
                            previewSections
                              .map((para, idx, all) => para && formatSection(para, idx, all))
                              .filter(Boolean)
                          ) : (
                            <p className="text-muted">Draft content is currently empty...</p>
                          )}
                        </div>
                      </section>
                    </article>
                  </div>
                );
              })()}

              {editorTab === "schema" && (
                <div className="editor-schema-preview">
                  <div className="schema-description">
                    <Globe size={18} />
                    <p>
                      Below is the automated **JSON-LD Schema.org** markup generated for this blog posting. 
                      Adstra's routing engine automatically injects this structure into the document headers to 
                      help Google discover rich snippets.
                    </p>
                  </div>
                  <pre className="schema-code">
                    <code>{JSON.stringify(generateSchema(), null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* RIGHT: ADVANCED SEO ASSISTANT PANEL */}
            <aside className="editor-right-pane">
              
              {/* Dynamic Score Ring */}
              <div className="seo-score-box">
                <div className="score-header">
                  <h4>Content SEO Score</h4>
                  <span className="score-desc">Calculated in real-time</span>
                </div>
                
                <div className="score-circle-wrapper">
                  <svg className="score-circle" viewBox="0 0 36 36">
                    <path
                      className="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`circle-progress ${
                        seoAnalysis.score >= 80 ? "stroke-high" : seoAnalysis.score >= 50 ? "stroke-mid" : "stroke-low"
                      }`}
                      strokeDasharray={`${seoAnalysis.score}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="score-number-display">
                    <span className="number">{seoAnalysis.score}</span>
                    <span className="label">Grade</span>
                  </div>
                </div>
              </div>

              {/* Keyword Settings */}
              <div className="panel-card keyword-settings">
                <h5>SEO Targets & Snippets</h5>

                <div className="form-field">
                  <div className="field-label-spaced">
                    <label htmlFor="seo-title">Google Snippet Title</label>
                    <span className={`count ${(excerptTitle || title).length > 60 || (excerptTitle || title).length < 40 ? "text-warn" : "text-success"}`}>
                      {(excerptTitle || title).length} / 60
                    </span>
                  </div>
                  <input
                    id="seo-title"
                    type="text"
                    placeholder="Defaults to main title..."
                    value={excerptTitle}
                    onChange={(e) => setExcerptTitle(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <div className="field-label-spaced">
                    <label htmlFor="seo-meta">Meta Description</label>
                    <span className={`count ${metaDescription.length > 160 || metaDescription.length < 120 ? "text-warn" : "text-success"}`}>
                      {metaDescription.length} / 160
                    </span>
                  </div>
                  <textarea
                    id="seo-meta"
                    rows={3}
                    placeholder="Search results description snippets..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic Interlinks Selector */}
              <div className="panel-card interlinks-selector-panel">
                <div className="interlinks-header">
                  <h5>Article Interlinks Manager</h5>
                  <span className="selected-badge">
                    {selectedKeywords.length} Active
                  </span>
                </div>
                <p className="interlinks-subtitle">Search and pick the keyword links to dynamically render in your blog body.</p>

                <div className="form-field">
                  <div className="input-with-icon search-interlink-input-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search registered keywords..."
                      value={interlinkSearch}
                      onChange={(e) => setInterlinkSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="interlink-actions">
                  <button
                    type="button"
                    className="action-btn select-all"
                    onClick={() => {
                      const allKeys = Object.keys(activeKeywords);
                      const filtered = allKeys.filter(k => 
                        k.toLowerCase().includes(interlinkSearch.toLowerCase()) ||
                        (typeof activeKeywords[k] === 'object' ? activeKeywords[k].link : activeKeywords[k]).toLowerCase().includes(interlinkSearch.toLowerCase())
                      );
                      const newSelected = Array.from(new Set([...selectedKeywords, ...filtered]));
                      setSelectedKeywords(newSelected);
                    }}
                  >
                    Select All Matches
                  </button>
                  <button
                    type="button"
                    className="action-btn clear-all"
                    onClick={() => {
                      if (interlinkSearch) {
                        const allKeys = Object.keys(activeKeywords);
                        const filtered = allKeys.filter(k => 
                          k.toLowerCase().includes(interlinkSearch.toLowerCase()) ||
                          (typeof activeKeywords[k] === 'object' ? activeKeywords[k].link : activeKeywords[k]).toLowerCase().includes(interlinkSearch.toLowerCase())
                        );
                        setSelectedKeywords(selectedKeywords.filter(k => !filtered.includes(k)));
                      } else {
                        setSelectedKeywords([]);
                      }
                    }}
                  >
                    Clear Matches
                  </button>
                </div>

                <div className="interlink-scroll-container">
                  {(() => {
                    const allKeys = Object.keys(activeKeywords);
                    const filtered = allKeys.filter(k => 
                      k.toLowerCase().includes(interlinkSearch.toLowerCase()) ||
                      (typeof activeKeywords[k] === 'object' ? activeKeywords[k].link : activeKeywords[k]).toLowerCase().includes(interlinkSearch.toLowerCase())
                    ).sort((a, b) => b.length - a.length);

                    if (filtered.length === 0) {
                      return <div className="no-interlinks-found">No matching interlinks found in registry.</div>;
                    }

                    return filtered.map(kw => {
                      const val = activeKeywords[kw];
                      let link = "";
                      let isInternal = true;
                      if (typeof val === "object") {
                        link = val.link;
                        isInternal = val.type ? (val.type === "internal") : ((link || "").startsWith('/') || (link || "").includes('adstradigital.com'));
                      } else {
                        link = val;
                        isInternal = (link || "").startsWith('/') || (link || "").includes('adstradigital.com') || (link || "").startsWith('http://localhost') || (link || "").startsWith('http://127.0.0.1');
                      }

                      // Check if keyword is found in text
                      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      const regex = new RegExp(`\\b${escapeRegex(kw.toLowerCase())}\\b`, "i");
                      const matched = regex.test(content.toLowerCase());
                      const isSelected = selectedKeywords.includes(kw);

                      return (
                        <div key={kw} className={`interlink-item-row ${isSelected ? 'active' : ''} ${matched ? 'matched-in-text' : ''}`} onClick={() => {
                          if (isSelected) {
                            setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
                          } else {
                            setSelectedKeywords([...selectedKeywords, kw]);
                          }
                        }}>
                          <div className="checkbox-col">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                            />
                          </div>
                          <div className="info-col">
                            <span className="keyword-label">{kw}</span>
                            <span className="link-path" title={link}>{link}</span>
                          </div>
                          <div className="badge-col">
                            <span className={`link-type-badge ${isInternal ? 'internal' : 'external'}`}>
                              {isInternal ? 'Internal' : 'External'}
                            </span>
                            {matched && (
                              <span className="text-presence-badge">
                                Found
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Real-time Checklist */}
              <div className="panel-card checklist-section">
                <h5>Real-Time Search Checklist</h5>
                <ul className="checklist-list">
                  {seoAnalysis.checklist.map((item, idx) => (
                    <li key={idx} className={`checklist-item ${item.status}`}>
                      <div className="item-indicator">
                        {item.status === "pass" ? (
                          <CheckCircle2 size={16} />
                        ) : item.status === "warn" ? (
                          <AlertTriangle size={16} />
                        ) : (
                          <div className="circle-dot" />
                        )}
                      </div>
                      <div className="item-text">
                        <strong>{item.label}</strong>
                        <p>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SERP & Social Sharing Previews */}
              <div className="panel-card preview-section">
                <div className="preview-panel-header">
                  <h5>Snippets Visualizer</h5>
                  <div className="preview-selector">
                    <button className={seoPreviewTab === "google" ? "active" : ""} onClick={() => setSeoPreviewTab("google")}>
                      Google
                    </button>
                    <button className={seoPreviewTab === "facebook" ? "active" : ""} onClick={() => setSeoPreviewTab("facebook")}>
                      Meta
                    </button>
                  </div>
                </div>

                <div className="preview-render-area">
                  {seoPreviewTab === "google" && (
                    <div className="google-serp-preview">
                      <div className="google-brand">
                        <Globe size={12} />
                        <span>https://adstradigital.com › blogs › {slug || "your-slug"}</span>
                      </div>
                      <h4 className="google-title">
                        {excerptTitle || title || "Blog Post Title Placeholder"}
                      </h4>
                      <p className="google-desc">
                        <span className="google-date">{publishedDate} — </span>
                        {metaDescription || "Search engines will auto-generate text from the article if meta description is missing..."}
                      </p>
                    </div>
                  )}

                  {seoPreviewTab === "facebook" && (
                    <div className="meta-card-preview">
                      <div className="card-image-box" style={{ backgroundImage: imageUrl ? `url(${getFullImageUrl(imageUrl)})` : "linear-gradient(135deg, #1e293b, #0f172a)" }}>
                        {!imageUrl && <ImageIcon size={24} />}
                      </div>
                      <div className="card-info">
                        <span className="card-domain">ADSTRADIGITAL.COM</span>
                        <h4 className="card-title">{title || "Blog Post Title Placeholder"}</h4>
                        <p className="card-excerpt">{excerpt || "Blog card description preview text..."}</p>
                      </div>
                    </div>
                  )}


                </div>
              </div>

            </aside>

          </div>
        )}

      </main>
    </div>
  );
}
