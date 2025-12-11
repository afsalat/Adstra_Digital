import AboutDetails from "@/components/AboutDetails/AboutDetails";
import ContactUs from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";
import NavBar from "@/components/NavBar/Navbar";
import Script from "next/script";

export const metadata = {
  title: "About Adstra Digital | Marketing Agency in Kerala",
  description:
    "Learn more about Adstra Digital, a marketing agency delivering ROI-driven SEO, ads, and brand strategy with creative solutions and measurable results.",
  alternates: {
    canonical: "https://adstradigital.com/about/",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function AboutPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "About Adstra Digital | Marketing Agency in Kerala",
    url: "https://adstradigital.com/about/",
    description:
      "Learn more about Adstra Digital, a marketing agency delivering ROI-driven SEO, ads, and brand strategy with creative solutions and measurable results.",
    headline: "About Adstra Digital",
    mainEntity: {
      "@type": "Organization",
      name: "Adstra Digital",
      url: "https://adstradigital.com/",
      logo: "https://adstradigital.com/_next/static/media/logo-new-03.a8aee72e.png",
      founder: {
        "@type": "Person",
        name: "Adstra Digital",
      },
      foundingDate: "2025",
      sameAs: [
        "https://www.facebook.com/AdstraDigital",
        "https://www.instagram.com/adstradigital",
        "https://www.linkedin.com/company/adstradigital",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91 9744779574",
        contactType: "Customer Service",
        areaServed: "IN",
        availableLanguage: ["English", "Malayalam", "Hindi"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Husna Complex, near English Church, West Nadakkave",
        addressLocality: "Kozhikode",
        addressRegion: "Kerala",
        postalCode: "673011",
        addressCountry: "IN",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://adstradigital.com/about/",
      },
      keywords:
        "Adstra Digital, Marketing Agency in Kerala, SEO, Google Ads, ROI-driven marketing, brand strategy, social media marketing",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Digital Marketing Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "SEO Services",
              description:
                "Technical SEO, content optimization, and ranking improvement.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Google Ads Management",
              description:
                "ROI-focused Google Ads campaigns for leads and sales.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Branding & Creative",
              description:
                "Visual identity, messaging, and creative campaigns.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Website Design & Development",
              description:
                "Fast, mobile-friendly websites built to convert visitors.",
            },
          },
        ],
      },
    },
  };

  return (
    <div style={{backgroundColor: "black", paddingLeft: "20px"}}>
      <NavBar />
      {/* ✅ SEO-friendly H1 */}
      <h1 className="text-3xl font-bold text-center my-6">
        About Adstra Digital
      </h1>
      <AboutDetails />
      <ContactUs />
      <Footer />

      {/* ✅ Structured Data Schema */}
      <Script
        id="about-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </div>
  );
}
