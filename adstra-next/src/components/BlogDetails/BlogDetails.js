"use client";

import parse from "html-react-parser";
import { blogPosts } from "@/data/services";
import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import { format } from "date-fns";
import Link from "next/link";
import "./BlogDetails.css";

// Interlink keywords
const keywordLinks = {
  AEO: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  GEO: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  PPC: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  "AI Marketing": "/blogs/ai-marketing-benefits-business-growth",
  "Logo Design": "/blogs/branding-trends-2025-logo-design-marketing",
  Photography: "/blogs/in-house-video-photography",
  Video: "/blogs/in-house-video-photography",
  SEO: "/service/seo-website-optimization",
  "SEO Services": "/service/seo-website-optimization",
  "Google Ads": "/service/google-ads",
  "Google Business Management Services": "/service/google-ads",
  "Paid Advertising Services": "/service/paid-advertising",
  Branding: "/service/branding",
  "Content Marketing": "/service/content-marketing",
};

// Interlink function
const interlinkText = (text) => {
  const keywords = Object.keys(keywordLinks).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

  return parse(text.replace(regex, (match) => {
    const link = keywordLinks[match];
    return `<a href="${link}" class="interlink" target="_blank" rel="noopener noreferrer">${match}</a>`;
  }));
};

const BlogDetail = ({ blog }) => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
    window.scrollTo(0, 0);
  }, []);

  const getImageUrl = (img) => img || "/assets/default-blog.jpg";

  // Suggested blogs (excluding current)
  const suggestions = blogPosts.filter((b) => b.slug !== blog.slug);

  return (
    <main className="blog-detail-container py-5">
      <div className="blog-detail-layout">
        {/* Sidebar */}
        <aside className="blog-sidebar" data-aos="fade-right">
          <h3>Suggested Reads</h3>
          <div className="sidebar-card-list">
            {suggestions.map((sug) => (
              <Link key={sug.slug} href={`/blogs/${sug.slug}`} className="sidebar-card">
                <div
                  className="sidebar-card-img"
                  style={{ backgroundImage: `url(${getImageUrl(sug.imageUrl)})` }}
                />
                <div className="sidebar-card-info">
                  <h4>{sug.title.length > 50 ? sug.title.slice(0, 50) + "..." : sug.title}</h4>
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
                  style={{ backgroundImage: `url(${getImageUrl(blog.imageUrl)})` }}
                  role="img"
                  aria-label={blog.title}
                />
              </header>

              <section className="blog-content mt-4">
                <h1>{blog.title}</h1>
                <div className="blog-meta text-muted mb-3">
                  <span>By <strong>{blog.author || "AdstraDigital"}</strong></span>
                  <span> | <time dateTime={blog.publishedDate}>{format(new Date(blog.publishedDate), "MMMM d, yyyy")}</time></span>
                  {blog.readingTime && <span> • {blog.readingTime}</span>}
                </div>

                {/* Render Paragraphs Dynamically */}
                {(() => {
                  let headingCount = 0;

                  return blog.content
                    ?.trim()
                    .split(/\n\s*\n/)
                    .map((para, idx) => {
                      const text = para.trim();
                      const isShort = text.length <= 80;
                      const isHeading = /^(What|Why|How|Tips|Key|Benefits|Conclusion|Introduction|Beyond|Where|Mastering|Final|The|creativity)/i.test(text);
                      const isNumbered = /^\d+\.\s+[A-Z]/.test(text);

                      let Tag = "p";
                      let className = "";

                      if ((isHeading || isNumbered) && headingCount < 4 && isShort) {
                        Tag = isNumbered ? "h3" : "h2";
                        className = "blog-subheading";
                        headingCount++;
                      }

                      return (
                        <Tag key={idx} className={className}>
                          {interlinkText(text)}
                        </Tag>
                      );
                    });
                })()}

                {/* Tags */}
                {blog.tags && (
                  <ul className="blog-tags mt-4">
                    {blog.tags.map((tag, i) => (
                      <li key={i}>
                        <Link href={`/blogs/all#${tag}`} className="tag-link">
                          #{tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </article>
        </section>
      </div>
    </main>
  );
};

export default BlogDetail;
