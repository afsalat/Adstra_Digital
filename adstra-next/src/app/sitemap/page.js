"use client";

import React from "react";
import Link from "next/link";

export default function SiteMap() {
  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold">🌐 Website Sitemap</h2>
      <div className="d-flex justify-content-center flex-wrap gap-4">
        {/* Home */}
        <div className="dropdown">
          <button
            className="btn btn-primary dropdown-toggle px-4 py-2 shadow"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Home
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link className="dropdown-item" href="/">
                Main Home
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" href="/about/">
                About Us
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" href="/#contact">
                Contact
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" href="/#enquiry">
                Enquiry
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div className="dropdown">
          <button
            className="btn btn-success dropdown-toggle px-4 py-2 shadow"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Services
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link className="dropdown-item" href="/service/video-production/">
                In-House Professional Photography & Video Production
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/service/social-media-marketing/"
              >
                Social Media Marketing & Campaigns
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/service/lead-generation-performance-marketing/"
              >
                Lead Generation & Performance Marketing
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" href="/service/branding/">
                Branding & Identity Design
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/service/seo-website-optimization/"
              >
                SEO & Website Optimization
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/service/analytics-reporting/"
              >
                Analytics & Reporting
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/service/content-marketing/"
              >
                Content Marketing & Storytelling
              </Link>
            </li>
            {/* <li>
              <Link className="dropdown-item" href="/service/paid-advertising/">
                Paid Advertising (PPC & Display Ads)
              </Link>
            </li> */}
            <li>
              <Link className="dropdown-item" href="/service/google-ads/">
                Google Ads – Targeted Advertising for Maximum Reach
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" href="/service/web-development/">
                Web Development & Design
              </Link>
            </li>
          </ul>
        </div>

        {/* Blogs */}
        <div className="dropdown">
          <button
            className="btn btn-warning dropdown-toggle px-4 py-2 shadow"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Blogs
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/kerala-trusted-mobile-app-development-company-adstra-digital/"
              >
                Kerala's Most Trusted Mobile App Development Company – Build
                High-Quality Apps That Grow Your Business
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/10-reasons-flutter-future-mobile-app-development/"
              >
                10 Reasons Flutter Is the Future of Mobile App Development
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/best-digital-marketing-agencies-india/"
              >
                Best Digital Marketing Company in India – Top Agencies That
                Deliver Real Results
              </Link>
            </li>

            <li>
              <Link
                className="dropdown-item"
                href="/blogs/adstra-digital-iso-iaf-certified-agency-digital-marketing/"
              >
                Adstra Digital – ISO & IAF Certified Agency for Excellence in
                Digital Marketing
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/need-more-traffic-top-digital-marketing-agencies-kerala/"
              >
                Need More Traffic? Find Kerala’s Top Digital Marketing Agencies
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/google-gemini-seo-secrets-to-rank-in-ai-search-results/"
              >
                Google Gemini SEO: Secrets to Getting Your Website Featured in
                AI Search Results
              </Link>
            </li>

            {/* ✅ Newly added blog */}
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/ai-seo-strategy-to-rank-in-ai-powered-search-results/"
              >
                AI SEO Strategy: How to Rank in AI-Powered Search Results
              </Link>
            </li>

            {/* ✅ Existing blogs */}
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/web3-and-digital-marketing-complete-guide-for-businesses/"
              >
                Web 3.0 & Digital Marketing: Complete Guide for Businesses
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/social-media-strategy-to-boost-your-conversion-rate/"
              >
                Social Media Strategy to Boost Your Conversion Rate
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/google-ads-services-increase-business-roi/"
              >
                Google Ads Services: How They Can Increase Your Business ROI
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/ecommerce-in-india-2025-growth-trends-digital-strategy/"
              >
                E-Commerce in India: Growth, Trends & Digital Strategy 2025
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/performance-max-2-ai-driven-paid-marketing-guide/"
              >
                Performance Max 2.0 Explained: The Complete Strategy Guide to
                AI-Driven Paid Marketing
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/google-sge-ai-search-impact-2025/"
              >
                What Is Google SGE & AI-Powered Search? How It Will Affect Your
                Website Traffic
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/digital-strategy-essential-2025/"
              >
                Why Digital Strategy Will Be Essential for Every Brand in 2025
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/seo-aeo-geo-ppc-2025-digital-strategy/"
              >
                Business Needs in 2025: SEO, AEO, GEO & PPC Explained
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/branding-trends-2025-logo-design-marketing/"
              >
                How Logo Design Will Elevate Your Digital Marketing Strategy
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/ai-marketing-benefits-business-growth/"
              >
                What is AI Marketing? Key Benefits and How It Drives Business
                Growth
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/in-house-video-photography/"
              >
                House Video & Photography: Turning Brand Vision Into Reality
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/birth-of-creativity-ideas/"
              >
                The Birth of Creativity: How Great Ideas Begin with a Whisper
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                href="/blogs/perfect-video-shoot-client-happy/"
              >
                How to Make Your Video Shoot Perfect (And Keep Your Client Happy
                Too)
              </Link>
            </li>
          </ul>
        </div>

        {/* Extra Links */}
        <div className="dropdown">
          <button
            className="btn btn-danger dropdown-toggle px-4 py-2 shadow"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            More
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link className="dropdown-item" href="/policy/">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
