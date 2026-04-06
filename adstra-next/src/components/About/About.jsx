"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./About.css";

const stats = [
  {
    value: "360°",
    label: "Marketing Support",
    description: "SEO, paid ads, content, design, web, and brand execution under one roof.",
    tone: "violet",
  },
  {
    value: "30+",
    label: "Industries Served",
    description: "Experience built across local businesses, startups, and established brands.",
    tone: "amber",
  },
  {
    value: "24h",
    label: "Response Window",
    description: "Fast turnarounds for active campaigns, production requests, and launches.",
    tone: "blue",
  },
  {
    value: "20+",
    label: "Client Companies",
    description: "Growing brands trust Adstra for strategy, creative, and performance.",
    tone: "violet",
  },
  {
    value: "10+",
    label: "Trusted Listings",
    description: "Featured across agency directories and recognition platforms.",
    tone: "blue",
  },
  {
    value: "ROI",
    label: "Outcome Focused",
    description: "Built to turn attention into measurable business growth, not vanity metrics.",
    tone: "amber",
  },
];

function About() {
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  return (
    <section id="about" className="about-home-section">
      <div className="about-shell">
        <div className="about-heading" data-aos="fade-up">
          <p className="about-kicker">Adstra By The Numbers</p>
          <h2>Stats that reflect how we build, scale, and deliver.</h2>
          <p className="about-intro">
            A compact snapshot of the trust, speed, and range behind our digital
            marketing work.
          </p>
        </div>

        <div className="about-stats-grid">
          {stats.map((stat, index) => (
            <article
              key={stat.label}
              className={`about-stat-card tone-${stat.tone}`}
              data-aos="fade-up"
              data-aos-delay={index * 70}
            >
              <strong>{stat.value}</strong>
              <h3>{stat.label}</h3>
              <p>{stat.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
