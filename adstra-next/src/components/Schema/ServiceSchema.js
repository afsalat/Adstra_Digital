"use client";

import React from "react";

export default function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://adstradigital.com/service/all/",
        "url": "https://adstradigital.com/service/all/",
        "name": "All-in-One Digital Solutions from AdstraDigital | Kerala",
        "description":
          "Explore the full range of digital solution by AdstraDigital – from branding and content to SEO, SMM, and performance marketing.",
        "inLanguage": "en",
        "isPartOf": {
          "@id": "https://adstradigital.com",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://share.google/jQUwqdtXBwqetcI3N",
        "name": "AdstraDigital",
        "url": "https://adstradigital.com",
        "logo": {
          "@type": "ImageObject",
          "url":
            "https://adstradigital.com/_next/static/media/logo-new-03.a8aee72e.png",
        },
        "sameAs": [
          "https://www.facebook.com/adstradigital",
          "https://www.instagram.com/adstradigital",
          "https://www.linkedin.com/company/adstradigital",
        ],
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://adstradigital.com/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Services",
            "item": "https://adstradigital.com/service/all/",
          },
        ],
      },
      {
        "@type": "LocalBusiness",
        "name": "AdstraDigital",
        "image":
          "https://adstradigital.com/_next/static/media/logo-new-03.a8aee72e.png",
        "address": {
          "@type": "PostalAddress",
          "streetAddress":
            "First Floor, Husna Complex, Near English Church, Nadakkavu West",
          "addressLocality": "Kozhikode",
          "addressRegion": "Kerala",
          "postalCode": "673011",
          "addressCountry": "IN",
        },
        "url": "https://adstradigital.com",
        "telephone": "+91 9744779574",
        "priceRange": "$$",
        "openingHours": "Mo-Fr 09:00-18:00",
      },
      {
        "@type": "Service",
        "serviceType": "Search Engine Optimization (SEO)",
        "provider": {
          "@id":
            "https://adstradigital.com/service/seo-website-optimization/",
        },
        "areaServed": {
          "@type": "Place",
          "name": "India",
        },
      },
      {
        "@type": "Service",
        "serviceType": "Social Media Management",
        "provider": {
          "@id":
            "https://adstradigital.com/service/social-media-marketing-campaigns/",
        },
        "areaServed": {
          "@type": "Place",
          "name": "India",
        },
      },
      {
        "@type": "Service",
        "serviceType": "Lead Generation & Performance Marketing",
        "provider": {
          "@id":
            "https://adstradigital.com/service/lead-generation-performance-marketing/",
        },
        "areaServed": {
          "@type": "Place",
          "name": "India",
        },
      },
      {
        "@type": "Service",
        "serviceType": "Branding & Identity Design",
        "provider": {
          "@id":
            "https://adstradigital.com/service/branding-identity-design/",
        },
        "areaServed": {
          "@type": "Place",
          "name": "India",
        },
      },
      {
        "@type": "Service",
        "serviceType": "Website Design & Development",
        "provider": {
          "@id": "https://adstradigital.com/service/web-development-design/",
        },
        "areaServed": {
          "@type": "Place",
          "name": "India",
        },
      },
      {
        "@type": "Service",
        "serviceType": "Professional Photography & Video Production",
        "provider": {
          "@id": "https://adstradigital.com/service/video-production/",
        },
        "areaServed": {
          "@type": "Place",
          "name": "India",
        },
      },
      {
        "@type": "Service",
        "serviceType": "Paid Advertising (PPC & Display Ads)",
        "provider": {
          "@id":
            "https://adstradigital.com/service/paid-advertising-ppc-display-ads/",
        },
        "areaServed": {
          "@type": "Place",
          "name": "India",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
