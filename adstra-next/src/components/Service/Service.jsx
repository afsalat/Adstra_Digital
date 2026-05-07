"use client";

import dynamic from "next/dynamic";
import "./Service.css";

const ServiceSkybox = dynamic(() => import("./ServiceSkybox"), {
  ssr: false,
});

const serviceCards = [
  {
    id: "service-01",
    title: "Brand Strategy",
    icon: "Compass",
    description: "Positioning, voice, identity systems, and market direction.",
  },
  {
    id: "service-02",
    title: "Web Experience",
    icon: "Monitor",
    description: "High-conversion websites with custom UI and performance-first builds.",
  },
  {
    id: "service-03",
    title: "Paid Media",
    icon: "Zap",
    description: "Search, social, and retargeting campaigns tuned for ROI.",
  },
  {
    id: "service-04",
    title: "Social Campaigns",
    icon: "Share2",
    description: "Content calendars, creative direction, and platform-native growth.",
  },
  {
    id: "service-05",
    title: "Content Studio",
    icon: "PenTool",
    description: "Campaign copy, video, motion, and branded visual storytelling.",
  },
  {
    id: "service-06",
    title: "SEO Systems",
    icon: "Search",
    description: "Technical SEO, content architecture, and search visibility strategy.",
  },
  {
    id: "service-07",
    title: "Analytics Setup",
    icon: "Activity",
    description: "Tracking, reporting, event pipelines, and decision-ready dashboards.",
  },
  {
    id: "service-08",
    title: "Funnel Design",
    icon: "Filter",
    description: "Lead journeys, landing pages, and conversion flow optimization.",
  },
  {
    id: "service-09",
    title: "Automation",
    icon: "Cpu",
    description: "CRM workflows, lifecycle messaging, and retention systems.",
  },
  {
    id: "service-10",
    title: "Video Production",
    icon: "Video",
    description: "Short-form ads, explainers, and polished branded media assets.",
  },
];

export default function Service() {
  return (
    <section className="services-section" id="services">
      <div className="services-shell">
        <div className="services-header">
          <span className="services-kicker">Our 360 Service</span>
          <h2 className="services-title">Our 360 Service</h2>
          <p className="services-copy">
            Walk through the environment, approach service cards, and click one to
            trigger the next interaction.
          </p>
        </div>

        <div className="services-viewer">
          <ServiceSkybox imageUrl="/sky/kloppenheim_06_puresky_4k.exr" cards={serviceCards} />
        </div>
      </div>
    </section>
  );
}
