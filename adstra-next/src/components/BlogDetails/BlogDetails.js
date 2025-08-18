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
  AEO: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  GEO: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  PPC: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  SEO: "/service/seo-website-optimization",
  "SEO Services": "/service/seo-website-optimization",
  "Google Ads": "/service/google-ads",
  "Google Business Management Services": "/service/google-ads",
  "Paid Advertising Services": "/service/paid-advertising",
  "Content Marketing": "/service/content-marketing",
  "Digital Marketing": "/service/content-marketing",
  "Marketing Strategies": "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",

  AEO: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  GEO: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  PPC: "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  "AI Marketing": "/blogs/ai-marketing-benefits-business-growth",
  "Logo Design": "/blogs/branding-trends-2025-logo-design-marketing",
  Branding: "/service/branding",
  "Digital Marketing": "/service/content-marketing",
  "Adstra Digital": "/about",
  "Contact us": "https://adstradigital.com/#contact",
  "branding audit": "/service/branding",
  "responsive logo": "/blogs/branding-trends-2025-logo-design-marketing",
  "animated logos": "/blogs/branding-trends-2025-logo-design-marketing",
  "branding strategy": "/service/branding",
  SEO: "/service/seo-website-optimization",

  // Branding & Identity
  Branding: "/service/branding",
  "brand voice": "/service/branding",
  "branding strategies": "/service/branding",

  // Visual & Creative Services
  Photography: "/blogs/in-house-video-photography",
  Video: "/blogs/in-house-video-photography",
  "video editing": "/service/video-production",
  "video production company": "/service/video-production",
  "corporate video shoot": "/service/video-production",
  "video shoot in Kerala": "/service/video-production",
  "visual storytelling": "/blogs/in-house-video-photography",
  "in-house video production": "/blogs/in-house-video-photography",
  "in-house photography": "/blogs/in-house-video-photography",

  // Creative Thought & Process
  "Adstra Digital": "/about",
  "creative ideas": "/blogs/birth-of-creativity-ideas",
  "creative mindset": "/blogs/birth-of-creativity-ideas",
  "creative journey": "/blogs/birth-of-creativity-ideas",
  "content creation": "/service/content-marketing",
  storytelling: "/blogs/birth-of-creativity-ideas",
  "creative process": "/blogs/birth-of-creativity-ideas",
  imagination: "/blogs/birth-of-creativity-ideas",
  "creative resources": "/blogs/all",
  "client feedback": "/blogs/ai-marketing-benefits-business-growth",

  // Design & Campaigns
  "AI Marketing": "/blogs/ai-marketing-benefits-business-growth",
  "Logo Design": "/blogs/branding-trends-2025-logo-design-marketing",

  // General Links
  "Contact us": "https://adstradigital.com/#contact",
  "contact page": "https://adstradigital.com/#contact",
  "Marketing & Creativity Blogs": "/blogs/all",

  "AI Marketing": "/blogs/ai-marketing-benefits-business-growth",
  "digital marketing": "/service/content-marketing",
  "marketing strategies": "/blogs/seo-aeo-geo-ppc-2025-digital-strategy",
  "Adstra Digital": "/about",
  "Contact us": "https://adstradigital.com/#contact",
  "content creation": "/service/content-marketing",
  CRM: "/service/content-marketing",
  "automation tools": "/blogs/ai-marketing-benefits-business-growth",
  "predictive analytics": "/blogs/ai-marketing-benefits-business-growth",
  "smart ad targeting": "/blogs/ai-marketing-benefits-business-growth",
};

const createInterlinker = () => {
  const keywordCounts = {};
  const maxPerKeyword = 3;
  const keywords = Object.keys(keywordLinks).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

  return (text) => {
    return parse(
      text.replace(regex, (match) => {
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
  useEffect(() => {
    AOS.init({ duration: 1000 });
    window.scrollTo(0, 0);
  }, []);

  const getImageUrl = (img) => img || "/assets/default-blog.jpg";

  const suggestions = blogPosts.filter((b) => b.slug !== blog.slug);

  const sections = blog.content
    ?.trim()
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean);

  const interlinkText = createInterlinker();


  const formatSection = (para, index, allParas) => {
    // Headings
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

    // Numbered points
    if (/^\d+\.\s+/.test(para)) {
      return (
        <h3 className="blog-subheading" key={index}>
          {interlinkText(para)}
        </h3>
      );
    }

    // Bullet points
    if (/^[-•*]\s+/.test(para)) {
      const items = [];
      for (let i = index; i < allParas.length; i++) {
        const next = allParas[i];
        if (next && /^[-•*]\s+/.test(next)) {
          items.push(
            <li key={i}>{interlinkText(next.replace(/^[-•*]\s+/, ""))}</li>
          );
          allParas[i] = null;
        } else {
          break;
        }
      }
      return (
        <ul key={`ul-${index}`} className="blog-bullet-list">
          {items}
        </ul>
      );
    }

    // Paragraph
    return <p key={index}>{interlinkText(para)}</p>;
  };

  return (
    <main className="blog-detail-container py-5">
      <div className="blog-detail-layout">
        {/* Sidebar */}
        <aside className="blog-sidebar" data-aos="fade-right">
          <h3>Suggested Reads</h3>
          <div className="sidebar-card-list">
            {suggestions.map((sug) => (
              <Link key={sug.slug} href={`/blogs/${sug.slug}`} className="sidebar-card">
                <div className="sidebar-card-img" style={{ backgroundImage: `url(${getImageUrl(sug.imageUrl)})` }} />
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

              {/* Render Blog Content */}
              {sections.map((para, idx, all) => para && formatSection(para, idx, all)).filter(Boolean)}
            </section>
          </article>
        </section>
      </div>
    </main>
  );
};

export default BlogDetail;