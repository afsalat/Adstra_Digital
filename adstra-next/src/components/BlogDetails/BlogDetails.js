"use client";

import parse from "html-react-parser";
import { blogPosts } from "@/data/services";
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { format } from "date-fns";
import Link from "next/link";
import { getBlogImagePath } from "@/utils/contentImage";
import "./BlogDetails.css";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";

import { keywordLinks } from "@/data/keywordLinks";

const createInterlinker = (activeKeywords) => {
  const keywordCounts = {};
  const maxPerKeyword = 3;
  const keywords = Object.keys(activeKeywords || {}).sort(
    (a, b) => b.length - a.length
  );
  if (keywords.length === 0) return (text) => parse(text);
  const regex = new RegExp(`\\b(${keywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join("|")})\\b`, "gi");

  return (text) => {
    // 1. Handle Markdown Bold: **text** -> <strong>text</strong>
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: inherit; font-weight: 700;">$1</strong>');

    // 2. Handle Interlinking & Parse HTML
    return parse(
      formattedText.replace(regex, (match) => {
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
  };
};

const BlogDetail = ({ blog }) => {
  const sidebarRef = React.useRef(null);
  const [dbKeywordLinks, setDbKeywordLinks] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    window.scrollTo(0, 0);

    const fetchKeywords = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/blogs/keywords/`);
        if (res.data && res.data.length > 0) {
          const mapping = {};
          res.data.forEach(item => {
            mapping[item.keyword] = {
              link: item.link,
              type: item.link_type
            };
          });
          setDbKeywordLinks(mapping);
        }
      } catch (err) {
        console.error("Error fetching keywords from API:", err);
      }
    };
    fetchKeywords();
  }, []);


  const scrollSidebar = (direction) => {
    if (sidebarRef.current) {
      const scrollAmount = 300;
      const currentScroll = sidebarRef.current.scrollLeft;
      const targetScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;
      sidebarRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  const suggestions = blogPosts.filter((b) => b.slug !== blog.slug);

  const rawSections = blog.content?.trim().split(/\r?\n\s*\r?\n/) || [];
  const sections = rawSections
    .flatMap((section) => {
      // Split by newline if followed by a list marker (including "1)" style)
      // Lookahead matches: newline, then optional whitespace, then marker
      return section.split(/\r?\n(?=\s*(?:[-•*✔]|\d+[\.)])\s)/).map((s) => s.trim());
    })
    .filter(Boolean);

  const activeKeywords = dbKeywordLinks || keywordLinks;
  const interlinkText = createInterlinker(activeKeywords);

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

    // Headings - Only specific section names
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


    // Numbered points (section headers like "A. Type of App")
    if (/^[A-Z]\.\s+/.test(para)) {
      return (
        <h3 className="blog-subheading" style={{ fontSize: "1.1em", fontWeight: "700", color: "var(--accent-strong)", marginTop: "1.2em" }} key={index}>
          {interlinkText(para)}
        </h3>
      );
    }

    // Markdown Table Support
    if (para.includes("|") && para.includes("---") && para.split("\n").length >= 3) {
      const rows = para.trim().split("\n").map(row => row.trim()).filter(Boolean);
      const tableRows = rows.map(row => {
        // Remove outer pipes if present (e.g. | col | col |)
        const content = row.replace(/^\||\|$/g, '');
        return content.split("|").map(cell => cell.trim());
      });

      // Find separator row index (row containing ---)
      const separatorIndex = tableRows.findIndex(row => row.some(cell => /^[-: ]+$/.test(cell)));

      if (separatorIndex !== -1) {
        const headerRow = tableRows[0]; // Assuming first row is header if separator exists
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
      // Check if the NEXT item also looks like a numbered item
      // BUT for FAQs, we usually want them as separate Headers if interleaved with text.
      // We'll treat as list ONLY if there are 3+ consecutive numbered items (likely a real list).
      // Otherwise, treat as a Section Header (H3) to preserve numbering and styling.

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
        // Treat as Header (FAQ Question style)
        return (
          <h3 className="blog-subheading" style={{ fontSize: "1.2em", color: "var(--accent-strong)", marginBottom: "0.5em" }} key={index}>
            {interlinkText(para)}
          </h3>
        );
      }
    }

    // Bullet points with fun emoji support
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

    // Paragraph with better spacing
    return <p key={index} style={{ lineHeight: "1.8", marginBottom: "1em", color: "var(--text-secondary)" }}>{interlinkText(para)}</p>;
  };

  return (
    <main className="blog-detail-container py-5">
      <div className="blog-detail-layout">
        {/* Sidebar */}
        <aside className="blog-sidebar" data-aos="fade-right">
          <div className="sidebar-header">
            <h3>Suggested Reads</h3>
            <div className="sidebar-nav-buttons">
              <button
                className="sidebar-nav-btn left-btn"
                onClick={() => scrollSidebar("left")}
                aria-label="Scroll left"
              >
                ‹
              </button>
              <button
                className="sidebar-nav-btn right-btn"
                onClick={() => scrollSidebar("right")}
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          </div>
          <div className="sidebar-card-list" ref={sidebarRef}>
            {suggestions.map((sug) => (
              <Link
                key={sug.slug}
                href={`/blogs/${sug.slug}/`}
                className="sidebar-card"
              >
                <div
                  className="sidebar-card-img"
                  style={{
                    backgroundImage: `url(${getBlogImagePath(sug)})`,
                  }}
                />
                <div className="sidebar-card-info">
                  <h4>
                    {sug.title.length > 50
                      ? sug.title.slice(0, 50) + "..."
                      : sug.title}
                  </h4>
                  <p>{sug.excerpt?.slice(0, 60) || "Read more..."}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <section className="blog-main-content" data-aos="fade-up">
          <article className="blog-blocks compact">
            <header>
              <div
                className="blog-image"
                style={{
                  backgroundImage: `url(${getBlogImagePath(blog)})`,
                }}
                role="img"
                aria-label={blog.title}
              />
            </header>

            <section className="blog-content mt-4">
              <h1>{blog.title}</h1>
              <div className="blog-meta mb-3">
                <span>
                  By <strong>{blog.author || "AdstraDigital"}</strong>
                </span>
                <span>
                  {" "}
                  |{" "}
                  <time dateTime={blog.publishedDate}>
                    {format(new Date(blog.publishedDate), "MMMM d, yyyy")}
                  </time>
                </span>
                {blog.readingTime && <span> • {blog.readingTime}</span>}
              </div>

              {/* Render Blog Content */}
              {sections
                .map((para, idx, all) => para && formatSection(para, idx, all))
                .filter(Boolean)}
            </section>
          </article>
        </section>
      </div>
    </main>
  );
};

export default BlogDetail;
