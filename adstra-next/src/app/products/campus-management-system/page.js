import CampusMSPage from "@/components/CampusMSPage/CampusMSPage";
import ContactUs from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";
import NavBar from "@/components/NavBar/Navbar";
import Script from "next/script";

export const metadata = {
  title: "Campus Smart Management System | Adstra Digital",
  description:
    "CampusMS by Adstra Digital is an enterprise-grade campus management system for schools, colleges, and universities with admin, student, parent, and staff portals.",
  alternates: {
    canonical: "https://adstradigital.com/products/campus-management-system/",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function CampusManagementSystemPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Campus Smart Management System",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "Enterprise-grade campus administration platform for academics, finance, hostel, transport, HR, communication, AI analytics, and multi-portal access.",
    provider: {
      "@type": "Organization",
      name: "Adstra Digital",
      url: "https://adstradigital.com/",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
      price: "0",
      priceCurrency: "INR",
      description: "Contact Adstra Digital for a live demo and custom pricing.",
    },
  };

  return (
    <div className="public-page-shell">
      <NavBar />
      <CampusMSPage />
      <ContactUs />
      <Footer />
      <Script
        id="campusms-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </div>
  );
}
