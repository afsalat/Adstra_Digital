const BASE_URL = "https://adstradigital.com";

const organizationSchema = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "AdstraDigital",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/favicon.png`,
  },
  sameAs: [
    "https://www.facebook.com/adstradigital",
    "https://www.instagram.com/adstradigital",
    "https://www.linkedin.com/company/adstradigital",
  ],
};

export default function ServiceSchema({ service, isAll = false }) {
  if (!isAll && !service) return null;

  if (isAll) {
    const pageUrl = `${BASE_URL}/service/all/`;
    const graph = [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "All-in-One Digital Solutions from AdstraDigital | Kerala",
        description:
          "Explore the full range of digital solutions by AdstraDigital, from branding and content to SEO, social media, and performance marketing.",
        inLanguage: "en",
        isPartOf: {
          "@id": `${BASE_URL}/#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#services`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Video Production",
            url: `${BASE_URL}/service/video-production/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Social Media Marketing",
            url: `${BASE_URL}/service/social-media-marketing/`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Lead Generation & Performance Marketing",
            url: `${BASE_URL}/service/lead-generation-performance-marketing/`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Branding",
            url: `${BASE_URL}/service/branding/`,
          },
          {
            "@type": "ListItem",
            position: 5,
            name: "SEO & Website Optimization",
            url: `${BASE_URL}/service/seo-website-optimization/`,
          },
          {
            "@type": "ListItem",
            position: 6,
            name: "Analytics & Reporting",
            url: `${BASE_URL}/service/analytics-reporting/`,
          },
          {
            "@type": "ListItem",
            position: 7,
            name: "Content Marketing",
            url: `${BASE_URL}/service/content-marketing/`,
          },
          {
            "@type": "ListItem",
            position: 8,
            name: "Google Ads",
            url: `${BASE_URL}/service/google-ads/`,
          },
          {
            "@type": "ListItem",
            position: 9,
            name: "Web Development",
            url: `${BASE_URL}/service/web-development/`,
          },
        ],
      },
      organizationSchema,
    ];

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": graph,
          }),
        }}
      />
    );
  }

  const serviceUrl = `${BASE_URL}/service/${service.slug}/`;
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${serviceUrl}#webpage`,
      url: serviceUrl,
      name: service.metaTitle || `${service.title} | AdstraDigital`,
      description:
        service.metaDescription ||
        service.description ||
        service.intro ||
        `Explore ${service.title} by AdstraDigital.`,
      inLanguage: "en",
      isPartOf: {
        "@id": `${BASE_URL}/#website`,
      },
      breadcrumb: {
        "@id": `${serviceUrl}#breadcrumb`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${serviceUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${BASE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Services",
          item: `${BASE_URL}/service/all/`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: service.title,
          item: serviceUrl,
        },
      ],
    },
    {
      "@type": "Service",
      "@id": `${serviceUrl}#service`,
      name: service.title,
      serviceType: service.title,
      description:
        service.metaDescription ||
        service.description ||
        service.intro ||
        `Explore ${service.title} by AdstraDigital.`,
      provider: {
        "@id": `${BASE_URL}/#organization`,
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      url: serviceUrl,
    },
    organizationSchema,
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
