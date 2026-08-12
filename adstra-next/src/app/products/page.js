import Script from "next/script";
import NavBar from "@/components/NavBar/Navbar";
import Footer from "@/components/Footer/Footer";
import WhatsAppFloatingButton from "@/components/WhatsappIcon/WhatsappIcon";
import SoftwareSolutionsPage from "@/components/SoftwareSolutionsPage/SoftwareSolutionsPage";

export const metadata = {
  title: "Enterprise Software Solutions | Adstra Digital",
  description: "Explore Adstra Digital ERP, CRM, HRMS and Payroll, Campus Management, invoicing, and custom software solutions for enterprises and institutions.",
  alternates: { canonical: "https://adstradigital.com/products/" },
  openGraph: {
    title: "Enterprise Software Solutions | Adstra Digital",
    description: "Connected ERP, CRM, HRMS, Campus Management, invoicing, and custom applications built around real operational needs.",
    url: "https://adstradigital.com/products/",
    type: "website",
  },
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Adstra Digital Software Solutions",
  url: "https://adstradigital.com/products/",
  description: "Enterprise and institutional software solutions from Adstra Digital.",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      "ERP Solutions",
      "Customer Relationship Management",
      "HRMS and Payroll",
      "Campus Management System",
      "AdInvoice",
    ].map((name, index) => ({ "@type": "ListItem", position: index + 1, name })),
  },
};

export default function ProductsPage() {
  return (
    <div className="public-page-shell">
      <NavBar />
      <SoftwareSolutionsPage />
      <Footer />
      <WhatsAppFloatingButton message="Hi, I’d like to discuss Adstra Digital’s software solutions." />
      <Script id="software-solutions-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
    </div>
  );
}
