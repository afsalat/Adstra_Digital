"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Lock,
  Megaphone,
  RotateCw,
} from "lucide-react";
import BlobCursor from "../BlobCursor/BlobCursor";
import CardSwap, { Card } from "../CardSwap/CardSwap";
import "./Banner.css";

function Banner() {
  const slides = [
    {
      title: "Strategy-Led Digital Growth",
      subtitle:
        "We build campaigns, content, and automation systems that turn attention into measurable business results.",
    },
    {
      title: "Creative That Moves People",
      subtitle:
        "From performance ads to visual storytelling, we design bold digital experiences that stay memorable.",
    },
    {
      title: "Technology Behind Better Marketing",
      subtitle:
        "Web, backend, CRM, and execution workflows aligned to help your brand scale faster and smarter.",
    },
  ];

  const stackCards = [
    {
      index: "01",
      icon: Megaphone,
      label: "Client project",
      kicker: "Paid Media",
      title: "Campaign stacks built to convert attention into pipeline.",
      description:
        "Offer framing, creative iteration, landing page flow, and reporting in one loop.",
      footer: "Creative, funnel, and scale",
      variant: "campaign",
      layout: "travel",
      previewImage: "/assets/quickerala-preview.png",
      previewUrl: "https://quickeralaholidays.com/",
      previewAlt: "Quick Kerala Holidays preview",
      statValue: "214%",
      statLabel: "qualified lead growth in 90 days",
    },
    {
      index: "02",
      icon: Bot,
      label: "Client project",
      kicker: "Workflows",
      title: "Follow-ups and CRM actions without manual bottlenecks.",
      description:
        "Capture intent, route leads, trigger nurture sequences, and surface sales signals automatically.",
      footer: "Ops that scale with demand",
      variant: "automation",
      layout: "metrics",
      previewImage: "/assets/tasteio-preview.png",
      previewUrl: "https://thetasteio.com/",
      previewAlt: "Tasteio preview",
      metrics: [
        { value: "32 hrs", label: "saved per week" },
        { value: "8x", label: "faster response time" },
      ],
    },
    {
      index: "03",
      icon: BarChart3,
      label: "Client project",
      kicker: "Measurement",
      title: "Dashboards that show what is working and where to push next.",
      description:
        "Attribution, creative scoring, and weekly performance decisions in one shared view.",
      footer: "Readable by founders and teams",
      variant: "analytics",
      layout: "chart",
      previewImage: "/assets/vjfoods-preview.png",
      previewUrl: "https://vjfoodindustries.com/",
      previewAlt: "VJ Foods preview",
    },
    {
      index: "04",
      icon: Megaphone,
      label: "Our Product",
      kicker: "Creative",
      title: "Ad concepts, hooks, and testing lanes built for volume.",
      description:
        "Structured production cycles that keep message quality high while campaigns keep moving.",
      footer: "Creative systems, not random posts",
      variant: "campaign",
      layout: "panel",
      previewImage: "/assets/adinvoice-preview.png",
      previewUrl: "https://adinvoice.in/",
      previewAlt: "AdInvoice preview",
      statValue: "48",
      statLabel: "new creative tests launched monthly",
    },
    {
      index: "05",
      icon: Megaphone,
      label: "Client project",
      kicker: "Creative",
      title: "Ad concepts, hooks, and testing lanes built for volume.",
      description:
        "Structured production cycles that keep message quality high while campaigns keep moving.",
      footer: "Creative systems, not random posts",
      variant: "campaign",
      layout: "panel",
      previewImage: "/assets/blazeeducation-preview.png",
      previewUrl: "https://www.blazeeducation.com/",
      previewAlt: "Blaze Education preview",
      statValue: "48",
      statLabel: "new creative tests launched monthly",
    },
    {
      index: "06",
      icon: Bot,
      label: "Our Product",
      kicker: "Operations",
      title: "Lead routing, statuses, and handoffs that never drift out of sync.",
      description:
        "Every inquiry reaches the right workflow, owner, and follow-up path without manual chasing.",
      footer: "Sales and marketing stay aligned",
      variant: "automation",
      layout: "metrics",
      previewImage: "/assets/CMS-preview.jpeg",
      previewUrl: "Campus Management System (Upcoming)",
      previewAlt: "CMS preview",
      metrics: [
        { value: "99%", label: "handoff accuracy" },
        { value: "12 min", label: "first-touch average" },
      ],
    },
    {
      index: "07",
      icon: Megaphone,
      label: "Client project",
      kicker: "Conversion",
      title: "Offer pages designed to turn paid clicks into measurable action.",
      description:
        "Sharper hierarchy, faster load time, stronger proof, and cleaner CTA paths for every campaign.",
      footer: "Built for testing and iteration",
      variant: "campaign",
      layout: "panel",
      previewImage: "/assets/rushikeshtourism-preview.png",
      previewUrl: "https://rushikeshtourism.com/",
      previewAlt: "Rushikesh Tourism preview",
      statValue: "+37%",
      statLabel: "conversion lift after page redesign",
    },
    {
      index: "08",
      icon: BarChart3,
      label: "Our Product",
      kicker: "Insights",
      title: "Weekly reporting that turns numbers into decisions fast.",
      description:
        "Performance signals, creative winners, and next actions all surfaced in one operating view.",
      footer: "Clarity for teams and founders",
      variant: "analytics",
      layout: "chart",
      previewImage: "/assets/hrmspayroll-preview.png",
      previewUrl: "HRMS + PAYROLL Application (Upcoming)",
      previewAlt: "HRMS and Payroll preview",
    },
    {
      index: "09",
      icon: Bot,
      label: "Client project",
      kicker: "Lifecycle",
      title: "Email and follow-up flows that keep leads moving after first touch.",
      description:
        "Intent-based sequences deliver the right message at the right step without extra manual work.",
      footer: "Retention and response in one system",
      variant: "automation",
      layout: "metrics",
      previewImage: "/assets/aartees-preview.png",
      previewUrl: "https://www.aartees.com/",
      previewAlt: "Aartees preview",
      metrics: [
        { value: "4.2x", label: "reply rate improvement" },
        { value: "11", label: "automated touchpoints" },
      ],
    },
    {
      index: "10",
      icon: Megaphone,
      label: "Client project",
      kicker: "Storytelling",
      title: "Memorable visuals and messaging tailored for distribution, not just display.",
      description:
        "Campaign narratives, ad formats, and motion built to stay recognisable across platforms.",
      footer: "Creative with strategic consistency",
      variant: "campaign",
      layout: "panel",
      previewImage: "/assets/premier-CRM-preview.png",
      previewUrl: "https://www.premier-crm-secure.com/",
      previewAlt: "Premier CRM preview",
      statValue: "6",
      statLabel: "core asset families shipped per quarter",
    },
    // {
    //   index: "11",
    //   icon: Bot,
    //   label: "Growth Ops",
    //   kicker: "Execution",
    //   title: "The full delivery layer connecting campaigns, content, reporting, and follow-up.",
    //   description:
    //     "A tighter operating system for brands that want speed, consistency, and clear accountability.",
    //   footer: "The engine behind scalable growth",
    //   variant: "automation",
    //   layout: "metrics",
    //   metrics: [
    //     { value: "1 hub", label: "shared execution view" },
    //     { value: "24/7", label: "automated monitoring" },
    //   ],
    // },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3500);

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("resize", checkMobile);
    };
  }, [slides.length]);

  return (
    <section className="kinetic-hero hero-only" aria-label="Hero background video">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
      </video>

      <div className="hero-overlay" aria-hidden="true" />
      <BlobCursor
        blobType="circle"
        fillColor="#f6dc47"
        trailCount={5}
        sizes={[40, 56, 72, 88, 104]}
        innerSizes={[12, 16, 20, 24, 28]}
        innerColor="rgba(255,255,255,0.8)"
        opacities={[0.9, 0.78, 0.64, 0.5, 0.36]}
        trailDurations={[0.12, 0.45, 0.75, 1.1, 1.5]}
        trailDelays={[0, 0.08, 0.18, 0.32, 0.48]}
        shadowColor="rgba(0,0,0,0.75)"
        shadowBlur={5}
        shadowOffsetX={10}
        shadowOffsetY={10}
        filterStdDeviation={30}
        useFilter={true}
        fastDuration={0.1}
        slowDuration={0.6}
        zIndex={100}
      />

      <div className="hero-center">
        <div className="hero-stage">
          <div className="hero-copy-card">
            <p className="hero-eyebrow">Adstra Digital</p>
            <h1 key={slides[activeSlide].title} className="hero-title">
              {slides[activeSlide].title}
            </h1>
            <p key={slides[activeSlide].subtitle} className="hero-subtitle">
              {slides[activeSlide].subtitle}
            </p>

            <div className="hero-actions">
              <Link href="/360-service/" className="hero-button hero-button-primary">
                360 Service
              </Link>
              <Link href="/service/all/" className="hero-button hero-button-secondary">
                Explore Services
              </Link>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-swap-shell">
              <CardSwap
                width={isMobile ? (typeof window !== 'undefined' ? Math.min(window.innerWidth - 40, 420) : 340) : 500}
                height={isMobile ? 320 : 380}
                cardDistance={isMobile ? 40 : 85}
                verticalDistance={isMobile ? 60 : 120}
                delay={3000}
                pauseOnHover
                skewAmount={isMobile ? 6 : 12}
              >
                {stackCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <Card
                      key={card.index}
                      className={`hero-stack-card hero-stack-card--${card.variant}`}
                    >
                      <div className="hero-browser-shell">
                        <div className="hero-browser-tabbar">
                          <div className="hero-browser-tab hero-browser-tab--active">
                            <Icon size={14} />
                            <span>{card.label}</span>
                            <span className="hero-browser-tab-close">×</span>
                          </div>
                          <div className="hero-browser-new-tab">+</div>
                          <div className="hero-browser-index">{card.index}</div>
                        </div>

                        <div className="hero-browser-toolbar">
                          <div className="hero-site-nav">
                            <span className="hero-site-nav-icon">
                              <ChevronLeft size={12} />
                            </span>
                            <span className="hero-site-nav-icon">
                              <ChevronRight size={12} />
                            </span>
                            <span className="hero-site-nav-icon">
                              <RotateCw size={12} />
                            </span>
                          </div>
                          <div className="hero-site-url">
                            <Lock size={12} />
                            <span>{card.previewUrl ?? "https://adstradigital.com/"}</span>
                          </div>
                          <div className="hero-browser-actions">
                            <span />
                            <span />
                            <span />
                          </div>
                        </div>

                        <div className="hero-page-shell">
                          {card.previewImage ? (
                            <div className="hero-page-image-frame">
                              <img
                                src={card.previewImage}
                                alt={card.previewAlt ?? `${card.label} preview`}
                                className="hero-page-image"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="hero-page-header">
                                <div className="hero-page-brand">
                                  <span className="hero-page-brand-mark" />
                                  <strong>Adstra</strong>
                                </div>
                                <div className="hero-page-links">
                                  <span>Home</span>
                                  <span>Work</span>
                                  <span>Services</span>
                                </div>
                                <div className="hero-page-header-cta">Book Call</div>
                              </div>

                              <div className="hero-page-layout">
                                <div className="hero-page-copy">
                                  <p className="hero-stack-kicker">{card.kicker}</p>
                                  <h3>{card.title}</h3>
                                  <p className="hero-site-description">{card.description}</p>
                                  <div className="hero-site-actions">
                                    <span className="hero-site-button">View Case</span>
                                    <span className="hero-site-link">
                                      Explore
                                      <ArrowUpRight size={14} />
                                    </span>
                                  </div>
                                  <div className="hero-page-badge">{card.footer}</div>
                                </div>

                                <div className="hero-site-preview">
                                  {card.layout === "panel" && (
                                    <div className="hero-site-panel">
                                      <div className="hero-stack-orb hero-stack-orb--gold" />
                                      <div className="hero-stack-orb hero-stack-orb--violet" />
                                      <strong>{card.statValue}</strong>
                                      <span>{card.statLabel}</span>
                                    </div>
                                  )}

                                  {card.layout === "metrics" && (
                                    <div className="hero-site-metrics">
                                      {card.metrics.map((metric) => (
                                        <div key={`${card.index}-${metric.label}`}>
                                          <strong>{metric.value}</strong>
                                          <span>{metric.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {card.layout === "chart" && (
                                    <div className="hero-site-chart">
                                      <div className="hero-site-chart-grid" />
                                      <span className="hero-stack-chart-line hero-stack-chart-line--one" />
                                      <span className="hero-stack-chart-line hero-stack-chart-line--two" />
                                      <span className="hero-stack-chart-line hero-stack-chart-line--three" />
                                      <div className="hero-site-chart-legend">
                                        <span>Reach</span>
                                        <span>Leads</span>
                                        <span>Revenue</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </CardSwap>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
