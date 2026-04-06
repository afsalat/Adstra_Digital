"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AOS from "aos";
import "aos/dist/aos.css";
import "./AboutDetails.css";

const defaultMetrics = [
  {
    value: "360",
    suffix: "deg",
    label: "Integrated delivery",
    description: "Strategy, creative, web, and performance aligned in one system.",
  },
  {
    value: "ROI",
    suffix: "",
    label: "Outcome mindset",
    description: "Every campaign is designed to move business metrics, not just impressions.",
  },
  {
    value: "24",
    suffix: "h",
    label: "Fast response",
    description: "Quick iteration windows for active campaigns, launches, and client requests.",
  },
  {
    value: "Local",
    suffix: "",
    label: "Kerala roots",
    description: "Regional understanding with execution standards built for wider markets.",
  },
];

function AboutDetails() {
  const [content, setContent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    AOS.init({
      duration: 850,
      once: true,
      easing: "ease-out-cubic",
      anchorPlacement: "top-bottom",
    });
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const docRef = doc(db, "aboutdetails", "uRdguVMJCFd0lQwY6FH2");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContent(docSnap.data());
      }
    };

    fetchContent();
  }, []);

  const handleContactClick = () => {
    router.push("/?scrollToContact=true");
  };

  const handleServicesClick = () => {
    router.push("/#service");
  };

  const howWeWork = content?.HowWeWork || [];
  const whatWeDo = content?.WhatWeDo || [];
  const metrics = [
    defaultMetrics[0],
    {
      value: String(whatWeDo.length || 6),
      suffix: "+",
      label: "Core service areas",
      description: "Execution across search, ads, social, design, development, and branding.",
    },
    {
      value: String(howWeWork.length || 4),
      suffix: "",
      label: "Execution principles",
      description: "A practical process that keeps strategy, timelines, and reporting clear.",
    },
    defaultMetrics[3],
  ];

  if (!content) {
    return (
      <section className="about-page">
        <div className="about-page__shell">
          <div className="about-page__loading">
            <span className="about-page__eyebrow">About Adstra Digital</span>
            <h1>Loading our story, capabilities, and approach.</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="about-page">
      <div className="about-page__shell">
        <div className="about-page__hero">
          <div className="about-page__hero-copy" data-aos="fade-right">
            <span className="about-page__eyebrow" data-aos="fade-up" data-aos-delay="30">About Adstra Digital</span>
            <h1>
              Built for brands that need sharper strategy, cleaner execution,
              and measurable growth.
            </h1>
            <p className="about-page__lead">{content.AboutAdstraDigital}</p>

            <div className="about-page__actions" data-aos="fade-up" data-aos-delay="140">
              <button className="about-page__button about-page__button--primary" onClick={handleContactClick}>
                Start a Conversation
              </button>
              <button className="about-page__button about-page__button--secondary" onClick={handleServicesClick}>
                Explore Services
              </button>
            </div>
          </div>

          <div className="about-page__hero-panel" data-aos="fade-left" data-aos-delay="120">
            <div className="about-page__hero-card" data-aos="zoom-in" data-aos-delay="180">
              <p className="about-page__panel-label">How We Work</p>
              <ul className="about-page__checklist">
                {howWeWork.slice(0, 4).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="about-page__spotlight" data-aos="zoom-in" data-aos-delay="250">
              <p className="about-page__panel-label">Growth Partner</p>
              <p>{content.YourStrategicGrowthPartner}</p>
            </div>
          </div>
        </div>

        <div className="about-page__metrics">
          {metrics.map((metric, index) => (
            <article
              className="about-page__metric-card"
              key={metric.label}
              data-aos="fade-up"
              data-aos-delay={80 + index * 70}
            >
              <div className="about-page__metric-value">
                {metric.value}
                {metric.suffix && <span>{metric.suffix}</span>}
              </div>
              <h3>{metric.label}</h3>
              <p>{metric.description}</p>
            </article>
          ))}
        </div>

        <div className="about-page__story-grid">
          <article className="about-page__feature-card about-page__feature-card--story" data-aos="fade-up-right">
            <span className="about-page__section-tag">Who We Are</span>
            <h2>A digital team built to turn ambition into practical momentum.</h2>
            <p>{content.AboutAdstraDigital}</p>
            <p>{content.LocalValueNationalStandards}</p>
          </article>

          <article className="about-page__feature-card" data-aos="fade-up-left" data-aos-delay="120">
            <span className="about-page__section-tag">Execution Rhythm</span>
            <h2>How we keep work clear, accountable, and moving.</h2>
            <ol className="about-page__steps">
              {howWeWork.map((item, index) => (
                <li key={index}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <div className="about-page__section-block" data-aos="fade-up">
          <div className="about-page__section-header">
            <span className="about-page__section-tag">Capabilities</span>
            <h2>What we actually do for growing brands.</h2>
            <p>
              We bring strategic planning and hands-on production into one
              workflow, so clients do not need to manage separate teams just to
              move faster.
            </p>
          </div>

          <div className="about-page__capabilities-grid">
            {whatWeDo.map((item, index) => (
              <article
                className="about-page__capability-card"
                key={index}
                data-aos="zoom-in-up"
                data-aos-delay={index * 60}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="about-page__value-grid">
          <article className="about-page__value-card" data-aos="fade-up">
            <span className="about-page__section-tag">Mission</span>
            <h3>Our Mission</h3>
            <p>{content.OurMission}</p>
          </article>

          <article className="about-page__value-card" data-aos="fade-up" data-aos-delay="90">
            <span className="about-page__section-tag">Support</span>
            <h3>Training & Support</h3>
            <p>{content.TrainingSupport}</p>
          </article>

          <article className="about-page__value-card" data-aos="fade-up" data-aos-delay="180">
            <span className="about-page__section-tag">Why Adstra</span>
            <h3>Why Choose Us</h3>
            <p>{content.WhyChooseUs}</p>
          </article>

          <article className="about-page__value-card" data-aos="fade-up" data-aos-delay="270">
            <span className="about-page__section-tag">Standards</span>
            <h3>Local Value, National Standards</h3>
            <p>{content.LocalValueNationalStandards}</p>
          </article>
        </div>

        <div className="about-page__closing" data-aos="fade-up">
          <div className="about-page__closing-copy" data-aos="fade-right" data-aos-delay="60">
            <span className="about-page__section-tag">Ready To Grow</span>
            <h2>Strategy matters more when the execution team can actually deliver it.</h2>
            <p>{content.ReadytoGrow}</p>
          </div>

          <div className="about-page__closing-panel" data-aos="fade-left" data-aos-delay="140">
            <p className="about-page__panel-label">What clients get</p>
            <ul className="about-page__checklist">
              <li>Clear strategic direction with practical next steps.</li>
              <li>Creative, media, and technical execution in one place.</li>
              <li>Reporting focused on business outcomes instead of noise.</li>
            </ul>
            <button className="about-page__button about-page__button--primary" onClick={handleContactClick}>
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutDetails;
