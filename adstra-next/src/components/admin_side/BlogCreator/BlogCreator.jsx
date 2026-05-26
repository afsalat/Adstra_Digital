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
  ChevronRight
} from "lucide-react";
import "./BlogCreator.css";

export default function BlogCreator() {
  const { showConfirm } = useModal();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // View state: 'list' or 'edit' or 'create'
  const [viewState, setViewState] = useState("list");
  
  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [editId, setEditId] = useState(null);
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
  const [focusKeyword, setFocusKeyword] = useState("");
  
  // Tab states inside Editor
  const [editorTab, setEditorTab] = useState("edit"); // 'edit', 'preview', 'schema'
  const [seoPreviewTab, setSeoPreviewTab] = useState("google"); // 'google', 'facebook', 'twitter'

  const contentTextareaRef = useRef(null);

  // Helper: Get token headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
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
      } catch (e) {
        router.push("/userlogin");
      }
    } else {
      router.push("/userlogin");
    }
  }, []);

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
    setFocusKeyword("");
    setEditorTab("edit");
  };

  // Enter edit mode
  const handleEditInit = (blog) => {
    setEditId(blog.id);
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
    
    // Focus Keyword fallback
    if (blog.seo && blog.seo.focusKeyword) {
      setFocusKeyword(blog.seo.focusKeyword);
    } else {
      setFocusKeyword("");
    }
    
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
          alert("Error deleting blog: " + (err.response?.data?.detail || err.message));
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
        focusKeyword,
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
        await axios.put(`${API_BASE_URL}/blogs/${slug}/`, payload, {
          headers: getAuthHeaders(),
        });
      }
      resetForm();
      setViewState("list");
      fetchBlogs();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving blog post: " + JSON.stringify(err.response?.data || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Real-Time SEO Analyzer Engine
  const analyzeSEO = () => {
    const checklist = [];
    let score = 0;

    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    const lowerSlug = slug.toLowerCase();
    const lowerMeta = metaDescription.toLowerCase();
    const lowerKeyword = focusKeyword.trim().toLowerCase();

    // 1. Keyword in Title
    const keywordInTitle = lowerKeyword ? lowerTitle.includes(lowerKeyword) : false;
    checklist.push({
      label: "Focus Keyword in Title",
      status: !lowerKeyword ? "warn" : keywordInTitle ? "pass" : "fail",
      desc: !lowerKeyword ? "Set a Focus Keyword to enable checklist analysis." : keywordInTitle ? "Your focus keyword was found in the title!" : "The focus keyword does not appear in your blog title."
    });
    if (keywordInTitle) score += 15;

    // 2. Keyword in Slug
    const keywordInSlug = lowerKeyword ? lowerSlug.includes(slugify(lowerKeyword)) : false;
    checklist.push({
      label: "Focus Keyword in URL Slug",
      status: !lowerKeyword ? "warn" : keywordInSlug ? "pass" : "fail",
      desc: !lowerKeyword ? "Add focus keyword to check URL slug optimization." : keywordInSlug ? "Excellent! Keyword matches your clean URL structure." : "The URL slug should ideally include your focus keyword."
    });
    if (keywordInSlug) score += 10;

    // 3. Keyword in First Paragraph (approx first 200 chars)
    const firstParagraph = content.slice(0, 300).toLowerCase();
    const keywordInFirst = lowerKeyword ? firstParagraph.includes(lowerKeyword) : false;
    checklist.push({
      label: "Focus Keyword in First Paragraph",
      status: !lowerKeyword ? "warn" : keywordInFirst ? "pass" : "fail",
      desc: !lowerKeyword ? "Awaiting focus keyword." : keywordInFirst ? "Your keyword appears right away in the first paragraph." : "Introduce your focus keyword early in the first 200 characters."
    });
    if (keywordInFirst) score += 15;

    // 4. Keyword in Meta Description
    const keywordInMeta = lowerKeyword ? lowerMeta.includes(lowerKeyword) : false;
    checklist.push({
      label: "Focus Keyword in Meta Description",
      status: !lowerKeyword ? "warn" : keywordInMeta ? "pass" : "fail",
      desc: !lowerKeyword ? "Awaiting focus keyword." : keywordInMeta ? "Great! Keyword found in search engines meta snippet." : "Try to include your focus keyword inside the meta description."
    });
    if (keywordInMeta) score += 10;

    // 5. Keyword Density
    let density = 0;
    let densityStatus = "fail";
    let densityDesc = "No keyword matches in body text.";
    if (lowerKeyword && content.length > 50) {
      const words = lowerContent.split(/\s+/).filter(w => w.length > 0);
      // Clean up punctuation from words for density matches
      const matches = words.filter(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") === lowerKeyword).length;
      density = parseFloat(((matches / Math.max(1, words.length)) * 100).toFixed(2));
      
      if (density >= 1.0 && density <= 2.5) {
        densityStatus = "pass";
        densityDesc = `Keyword density is ${density}% (optimal range is 1.0% - 2.5%).`;
        score += 15;
      } else if (density > 2.5) {
        densityStatus = "warn";
        densityDesc = `Keyword density is high at ${density}% (avoid keyword stuffing above 2.5%).`;
        score += 8;
      } else if (density > 0) {
        densityStatus = "warn";
        densityDesc = `Keyword density is low at ${density}% (aim for at least 1.0% to build search context).`;
        score += 8;
      } else {
        densityDesc = "Focus keyword not found in any paragraph body.";
      }
    } else {
      checklist.push({
        label: "Keyword Density Check",
        status: !lowerKeyword ? "warn" : "fail",
        desc: !lowerKeyword ? "Add a focus keyword to verify content density." : "Content is too short or keyword has 0 occurrences."
      });
    }
    if (lowerKeyword && content.length >= 50) {
      checklist.push({
        label: "Keyword Density Check",
        status: densityStatus,
        desc: densityDesc
      });
    }

    // 6. Title Length Check
    const titleLen = title.length;
    const titleStatus = titleLen >= 40 && titleLen <= 60 ? "pass" : titleLen > 0 ? "warn" : "fail";
    checklist.push({
      label: "SEO Title Character Length",
      status: titleStatus,
      desc: titleLen === 0 
        ? "Please enter a blog title."
        : titleStatus === "pass" 
          ? `Perfect! Title is ${titleLen} characters (recommended 40-60).` 
          : `Title is ${titleLen} characters. Aim for 40-60 characters for best display on Google.`
    });
    if (titleStatus === "pass") score += 15;
    else if (titleStatus === "warn") score += 8;

    // 7. Meta Description Length Check
    const metaLen = metaDescription.length;
    const metaStatus = metaLen >= 120 && metaLen <= 160 ? "pass" : metaLen > 0 ? "warn" : "fail";
    checklist.push({
      label: "Meta Description Character Length",
      status: metaStatus,
      desc: metaLen === 0
        ? "Add a meta description to prevent auto-generated search summaries."
        : metaStatus === "pass"
          ? `Perfect! Meta description is ${metaLen} characters (recommended 120-160).`
          : `Description is ${metaLen} characters. Search engines truncate snippets over 160.`
    });
    if (metaStatus === "pass") score += 15;
    else if (metaStatus === "warn") score += 8;

    // 8. Word Count Check
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const wordStatus = wordCount >= 600 ? "pass" : wordCount >= 300 ? "warn" : "fail";
    checklist.push({
      label: "Blog Word Count",
      status: wordStatus,
      desc: wordCount === 0
        ? "Blog content is empty."
        : wordStatus === "pass"
          ? `Excellent! Comprehensive article with ${wordCount} words (ideal length >600).`
          : `Thin content: ${wordCount} words. Aim for at least 300-600 words for rank weight.`
    });
    if (wordStatus === "pass") score += 5;
    else if (wordStatus === "warn") score += 3;

    return {
      score: Math.min(100, score),
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

    setContent(text.substring(0, start) + replacement + text.substring(end));

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntaxStart.length,
        start + syntaxStart.length + selectedText.length
      );
    }, 50);
  };

  // Filtered blogs
  const filteredBlogs = blogs.filter((blog) =>
    (blog.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (blog.slug || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {viewState !== "list" && (
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

      {/* Main Grid Content */}
      <main className="blogcreator-container">
        
        {/* LIST VIEW (DASHBOARD) */}
        {viewState === "list" && (
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
                      <label htmlFor="blog-image">Cover Image Link</label>
                      <div className="input-with-icon">
                        <ImageIcon size={16} />
                        <input
                          id="blog-image"
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
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
                      <button type="button" onClick={() => insertMarkdown("**", "**")} title="Bold text"><strong>B</strong></button>
                      <button type="button" onClick={() => insertMarkdown("*", "*")} title="Italic text"><em>I</em></button>
                      <button type="button" onClick={() => insertMarkdown("## ", "\n")} title="Heading 2">H2</button>
                      <button type="button" onClick={() => insertMarkdown("### ", "\n")} title="Heading 3">H3</button>
                      <button type="button" onClick={() => insertMarkdown("[Link Text](url)", "")} title="Insert Link">Link</button>
                      <button type="button" onClick={() => insertMarkdown("![Image Alt](url)", "")} title="Insert Image">Image</button>
                      <button type="button" onClick={() => insertMarkdown("> ", "")} title="Quote Block">Quote</button>
                      <button type="button" onClick={() => insertMarkdown("```\n", "\n```")} title="Code Block"><Code size={14} /></button>
                      <button type="button" onClick={() => insertMarkdown("- ", "")} title="Unordered list">• List</button>
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

              {editorTab === "preview" && (
                <div className="editor-live-preview">
                  {imageUrl ? (
                    <div className="preview-hero-img" style={{ backgroundImage: `url(${imageUrl})` }} />
                  ) : (
                    <div className="preview-hero-placeholder">
                      <ImageIcon size={32} />
                      <span>No Cover Image Specified</span>
                    </div>
                  )}

                  <h1 className="preview-title">{title || "Draft Article Title"}</h1>
                  
                  <div className="preview-metadata">
                    <span className="meta-item"><User size={14} />By {author}</span>
                    <span className="meta-item"><Clock size={14} />{readingTime}</span>
                    <span className="meta-item"><Globe size={14} />{publishedDate}</span>
                  </div>

                  <div className="preview-tags">
                    {tags.map((t, i) => (
                      <span key={i} className="tag-pill">{t}</span>
                    ))}
                  </div>

                  <hr className="preview-divider" />

                  <div 
                    className="preview-body"
                    dangerouslySetInnerHTML={{ 
                      __html: content 
                        ? content
                            .replace(/\n/g, "<br />")
                            .replace(/## (.*?)(<br \/>|\n)/g, "<h2>$1</h2>")
                            .replace(/### (.*?)(<br \/>|\n)/g, "<h3>$1</h3>")
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        : "<p className='text-muted'>Draft content is currently empty...</p>" 
                    }}
                  />
                </div>
              )}

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
                <h5>SEO Targets</h5>
                
                <div className="form-field">
                  <label htmlFor="focus-keyword">Focus Keyword</label>
                  <div className="input-with-icon">
                    <Sparkles size={16} />
                    <input
                      id="focus-keyword"
                      type="text"
                      placeholder="e.g. Kozhikode SEO Agency"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                    />
                  </div>
                  <span className="field-hint">The primary search term you want to rank for.</span>
                </div>

                <div className="form-field">
                  <div className="field-label-spaced">
                    <label htmlFor="seo-title">Google Snippet Title</label>
                    <span className={`count ${title.length > 60 || title.length < 40 ? "text-warn" : "text-success"}`}>
                      {title.length} / 60
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
                    <button className={seoPreviewTab === "twitter" ? "active" : ""} onClick={() => setSeoPreviewTab("twitter")}>
                      X / Twitter
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
                      <div className="card-image-box" style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : "linear-gradient(135deg, #1e293b, #0f172a)" }}>
                        {!imageUrl && <ImageIcon size={24} />}
                      </div>
                      <div className="card-info">
                        <span className="card-domain">ADSTRADIGITAL.COM</span>
                        <h4 className="card-title">{title || "Blog Post Title Placeholder"}</h4>
                        <p className="card-excerpt">{excerpt || "Blog card description preview text..."}</p>
                      </div>
                    </div>
                  )}

                  {seoPreviewTab === "twitter" && (
                    <div className="twitter-card-preview">
                      <div className="twitter-image" style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : "linear-gradient(135deg, #1e293b, #0f172a)" }}>
                        {!imageUrl && <ImageIcon size={24} />}
                      </div>
                      <div className="twitter-info">
                        <span className="twitter-domain">adstradigital.com</span>
                        <h4 className="twitter-title">{title || "Blog Post Title Placeholder"}</h4>
                        <p className="twitter-desc">{excerpt || "Excerpt preview snippet details..."}</p>
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
