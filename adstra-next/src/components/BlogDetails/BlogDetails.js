"use client";

import parse from "html-react-parser";
import { blogPosts } from "@/data/services";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { format } from "date-fns";
import Link from "next/link";
import "./BlogDetails.css";

const keywordLinks = {
  // Strategy & Services
  AEO: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",
  GEO: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",
  PPC: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",
  SEO: "/service/seo-website-optimization/",
  "SEO Services": "/service/seo-website-optimization/",
  "Google Ads": "/service/google-ads/",
  "Google Business Management Services": "/service/google-ads/",
  "Paid Advertising Services": "/service/paid-advertising/",
  "Content Marketing": "/service/content-marketing/",
  "Digital Marketing": "/service/content-marketing/",
  "Marketing Strategies": "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",

  // Branding & Identity
  Branding: "/service/branding/",
  "brand voice": "/service/branding/",
  "branding strategies": "/service/branding/",
  "branding audit": "/service/branding/",
  "branding strategy": "/service/branding/",
  "responsive logo": "/blogs/branding-trends-2025-logo-design-marketing/",
  "animated logos": "/blogs/branding-trends-2025-logo-design-marketing/",
  "Logo Design": "/blogs/branding-trends-2025-logo-design-marketing/",

  // Visual & Creative Services
  Photography: "/blogs/in-house-video-photography/",
  Video: "/blogs/in-house-video-photography/",
  "video editing": "/service/video-production/",
  "video production company": "/service/video-production/",
  "corporate video shoot": "/service/video-production/",
  "video shoot in Kerala": "/service/video-production/",
  "visual storytelling": "/blogs/in-house-video-photography/",
  "in-house video production": "/blogs/in-house-video-photography/",
  "in-house photography": "/blogs/in-house-video-photography/",

  // Creative Thought & Process
  "Adstra Digital": "/about",
  "creative ideas": "/blogs/birth-of-creativity-ideas/",
  "creative mindset": "/blogs/birth-of-creativity-ideas/",
  "creative journey": "/blogs/birth-of-creativity-ideas/",
  storytelling: "/blogs/birth-of-creativity-ideas/",
  "creative process": "/blogs/birth-of-creativity-ideas/",
  imagination: "/blogs/birth-of-creativity-ideas/",
  "creative resources": "/blogs/all/",
  "client feedback": "/blogs/ai-marketing-benefits-business-growth/",

  // General Links
  "Contact us": "https://adstradigital.com/#contact",
  "contact page": "https://adstradigital.com/#contact",
  "Marketing & Creativity Blogs": "/blogs/all/",
  "content creation": "/service/content-marketing/",
  CRM: "/service/content-marketing/",

  // AI & Search topics (new internal blog links)
  "AI Marketing": "/blogs/ai-marketing-benefits-business-growth/",
  "automation tools": "/blogs/ai-marketing-benefits-business-growth/",
  "predictive analytics": "/blogs/ai-marketing-benefits-business-growth/",
  "smart ad targeting": "/blogs/ai-marketing-benefits-business-growth/",

  // NEW: Google SGE & AI Search blog interlinks
  "Google SGE": "/blogs/google-sge-ai-search-impact-2025/",
  "AI-powered search": "/blogs/google-sge-ai-search-impact-2025/",
  SGE: "/blogs/google-sge-ai-search-impact-2025/",
  "Search Generative Experience": "/blogs/google-sge-ai-search-impact-2025/",
  "E-A-T": "/blogs/google-sge-ai-search-impact-2025/",
  EAT: "/blogs/google-sge-ai-search-impact-2025/",
  "Core Web Vitals": "/blogs/google-sge-ai-search-impact-2025/",
  "Local SEO": "/blogs/google-sge-ai-search-impact-2025/",
  "conversational keywords": "/blogs/google-sge-ai-search-impact-2025/",
  "structured data": "/blogs/google-sge-ai-search-impact-2025/",

  // NEW: Performance Max 2.0 blog interlinks
  PMax: "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  "asset groups": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  "audience signals": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  "search term insights":
    "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  "first-party data": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  "page feeds": "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  "creative insights/":
    "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  "automated bidding":
    "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  ROAS: "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",
  GA4: "/blogs/performance-max-2-ai-driven-paid-marketing-guide/",

  // Services cross-links still useful from those blogs
  "Google Ads": "/service/google-ads",
  "Paid Advertising Services": "/service/paid-advertising/",
  "digital marketing": "/service/content-marketing/",
  "marketing strategies": "/blogs/seo-aeo-geo-ppc-2025-digital-strategy/",

  // NEW: Social Media Strategy to Boost Your Conversion Rate
  "Social Media Conversion": "/blogs/social-media-conversion-strategy/",
  "Engagement Rate": "/blogs/social-media-conversion-strategy/",
  "Shoppable Posts": "/blogs/social-media-conversion-strategy/",
  "Retargeting Ads": "/blogs/social-media-conversion-strategy/",
  "Customer Retention": "/blogs/social-media-conversion-strategy/",
  "Conversion Optimization": "/blogs/social-media-conversion-strategy/",
  "Mobile-Friendly Landing Pages": "/blogs/social-media-conversion-strategy/",
  "Audience Segmentation": "/blogs/social-media-conversion-strategy/",
  "Customer Journey Mapping": "/blogs/social-media-conversion-strategy/",
  "Calls to Action (CTAs)": "/blogs/social-media-conversion-strategy/",

  // eCommerce App Development
  "eCommerce app": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Mobile shopping": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Payment gateway": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Shopping app": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Budget planning": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "App features": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Order tracking": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Product catalog": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Wishlist": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Cart": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Push notifications": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Admin panel": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "Multi-vendor": "/blogs/ecommerce-app-development-pricing-features-budget/",
  "App maintenance": "/blogs/ecommerce-app-development-pricing-features-budget/",
};

const createInterlinker = () => {
  const keywordCounts = {};
  const maxPerKeyword = 3;
  const keywords = Object.keys(keywordLinks).sort(
    (a, b) => b.length - a.length
  );
  const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

  return (text) => {
    // 1. Handle Markdown Bold: **text** -> <strong>text</strong>
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: inherit; font-weight: 700;">$1</strong>');

    // 2. Handle Interlinking & Parse HTML
    return parse(
      formattedText.replace(regex, (match) => {
        const link = keywordLinks[match];
        if (!link) return match;

        keywordCounts[match] = (keywordCounts[match] || 0) + 1;
        if (keywordCounts[match] > maxPerKeyword) return match;

        return `<a href="${link}" class="interlink" target="_blank" rel="noopener noreferrer">${match}</a>`;
      })
    );
  };
};

const BlogDetail = ({ blog }) => {
  const sidebarRef = React.useRef(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    window.scrollTo(0, 0);
  }, []);

  const getImageUrl = (img) => img || "/assets/default-blog.jpg";

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

  const rawSections = blog.content?.trim().split(/\n\s*\n/) || [];
  const sections = rawSections
    .flatMap((section) => {
      // Split by newline if followed by a list marker (including "1)" style)
      // Lookahead matches: newline, then optional whitespace, then marker
      return section.split(/\r?\n(?=\s*(?:[-•*✔]|\d+[\.)])\s)/).map((s) => s.trim());
    })
    .filter(Boolean);

  const interlinkText = createInterlinker();

  const formatSection = (para, index, allParas) => {
    // Headings - Only specific section names
    if (
      /^Introduction$/i.test(para) ||
      /^Consulion$/i.test(para) ||
      /^Final Thoughts$/i.test(para) ||
      /^FAQs$/i.test(para) ||
      /^Conclusion$/i.test(para)
    ) {
      return (
        <h2 className="blog-subheading" key={index}>
          {para}
        </h2>
      );
    }

    // Section titles with "?" stay as paragraphs with styling (fun emphasis)
    if (para.includes("?") && para.length < 80) {
      return (
        <p key={index} className="blog-section-title" style={{ fontSize: "1.2em", fontWeight: "600", color: "#FFD700", marginTop: "1.5em", marginBottom: "0.8em" }}>
          {interlinkText(para)}
        </p>
      );
    }

    // Numbered points (section headers like "A. Type of App")
    if (/^[A-Z]\.\s+/.test(para)) {
      return (
        <h3 className="blog-subheading" style={{ fontSize: "1.1em", fontWeight: "700", color: "#FFD700", marginTop: "1.2em" }} key={index}>
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
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#ffffff", border: "1px solid #444" }}>
              <thead>
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={`th-${idx}`} style={{ border: "1px solid #444", padding: "10px", backgroundColor: "#222", fontWeight: "700" }}>
                      {interlinkText(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={`tr-${rIdx}`}>
                    {row.map((cell, cIdx) => (
                      <td key={`td-${rIdx}-${cIdx}`} style={{ border: "1px solid #444", padding: "10px" }}>
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

    // Numbered items: Decide if Header (H3) or List (<ol>)
    if (/^\d+[\.)]\s+/.test(para)) {
      // Check if the NEXT item also looks like a numbered item
      // If it exists and matches pattern, we treat THIS and subsequent items as a LIST.
      // Otherwise, we treat this single item as a SECTION HEADER (H3).

      let isList = false;
      if (index + 1 < allParas.length) {
        const next = allParas[index + 1];
        if (next && /^\d+[\.)]\s+/.test(next)) {
          isList = true;
        }
      }

      if (isList) {
        const items = [];
        for (let i = index; i < allParas.length; i++) {
          const next = allParas[i];
          if (next && /^\d+[\.)]\s+/.test(next)) {
            // Strip the number marker for the LI, as OL provides it
            const cleanedText = next.replace(/^\d+[\.)]\s+/, "");
            items.push(
              <li key={i} style={{ marginBottom: "0.5em", lineHeight: "1.6", color: "#ffffff" }}>
                {interlinkText(cleanedText)}
              </li>
            );
            allParas[i] = null; // Mark as consumed
          } else {
            break;
          }
        }
        return (
          <ol key={`ol-${index}`} className="blog-numbered-list" style={{ marginLeft: "1.5em", marginBottom: "1em", color: "#ffffff" }}>
            {items}
          </ol>
        );
      } else {
        // Treat as Header
        return (
          <h3 className="blog-subheading" key={index}>
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
            <li key={i} style={{ marginBottom: "0.5em", lineHeight: "1.6", color: "#ffffff" }}>
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
    return <p key={index} style={{ lineHeight: "1.8", marginBottom: "1em", color: "#ffffff" }}>{interlinkText(para)}</p>;
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
                    backgroundImage: `url(${getImageUrl(sug.imageUrl)})`,
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
                  backgroundImage: `url(${getImageUrl(blog.imageUrl)})`,
                }}
                role="img"
                aria-label={blog.title}
              />
            </header>

            <section className="blog-content mt-4">
              <h1>{blog.title}</h1>
              <div className="blog-meta text-white mb-3">
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
