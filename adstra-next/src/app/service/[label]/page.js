import Footer from "@/components/Footer/Footer";
import NavBar from "@/components/NavBar/Navbar";
import FullServices from "@/components/ServiceDetails/ServiceDetail";
import ServiceView from "@/components/serviceview/ServiceView";
import { serviceSections } from "@/data/services";
import { notFound } from "next/navigation";
import ServiceSchema from "@/components/Schema/ServiceSchema"; // 👈 Import schema
import ContactUs from "@/components/Contact/Contact";

export async function generateStaticParams() {
  return [
    { label: "all" },
    ...serviceSections.map((post) => ({
      label: post.slug,
    })),
  ];
}

export async function generateMetadata({ params }) {
  const { label: rawLabel } = await params;
  const label = rawLabel?.toLowerCase();
  const service = serviceSections.find((s) => s.slug === label);

  if (!label || label === "all") {
    return {
      title: "All-in-One Digital Solutions from AdstraDigital | Kerala",
      description:
        "Explore the full range of digital solution by AdstraDigital – from branding and content to SEO, SMM, and performance marketing.",
      alternates: {
        canonical: "https://adstradigital.com/service/all/",
      },
    };
  }

  if (!service) return {};

  return {
    title: service.metaTitle || `${service.title} | AdstraDigital`,
    description:
      service.metaDescription || `Discover ${service.title} services from AdstraDigital.`,
    alternates: {
      canonical: `https://adstradigital.com/service/${service.slug}/`,
    },
  };
}

export default async function ServicePage({ params }) {
  const { label: rawLabel } = await params;
  const label = rawLabel?.toLowerCase();
  const service = serviceSections.find((s) => s.slug === label);
  const isAll = !label || label === "all";

  if (!isAll && !service) return notFound();

  return (
    <div style={{ backgroundColor: "black" }}>
      <NavBar />

      {/* ✅ Structured Schema for SEO */}
      {isAll ? (
        <>
          <ServiceSchema isAll />
          <FullServices label={label} />
        </>
      ) : (
        <>
          <ServiceSchema service={service} />
          <ServiceView service={service} />
        </>
      )}
      <ContactUs />
      <Footer />
    </div>
  );
}
