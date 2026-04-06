"use client";

import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import "./ServiceDetail.css";
import { serviceSections } from "@/data/services";
import ServiceSchema from "@/components/Schema/ServiceSchema";
import { getServiceCardArt } from "@/utils/serviceCardArt";
import { hasImageSrc } from "@/utils/contentImage";

function ServiceCard({ service, index }) {
  const previewPoints = (service.points || service.services || []).slice(0, 3);
  const generatedArt = getServiceCardArt(service);
  const [imageFailed, setImageFailed] = useState(false);
  const cardImage =
    !imageFailed && hasImageSrc(service?.image)
      ? service.image.trim()
      : generatedArt;

  return (
    <article
      className="services-page__card"
      data-aos="fade-up"
      data-aos-delay={index * 70}
    >
      <div className="services-page__card-media">
        <img
          src={cardImage}
          alt={`${service.title} poster`}
          className="services-page__card-image"
          onError={() => setImageFailed(true)}
        />
        <span className="services-page__card-tag">{service.tagline}</span>
      </div>

      <div className="services-page__card-body">
        <div className="services-page__card-copy">
          <span className="services-page__card-kicker">
            {String(previewPoints.length || 3).padStart(2, "0")} focus areas
          </span>
          <h2 className="services-page__card-title">{service.title}</h2>
          <p className="services-page__card-description">
            {service.overview || service.description || service.intro}
          </p>

          <ul className="services-page__card-list">
            {previewPoints.map((item, idx) => (
              <li key={idx}>
                {typeof item === "string" ? item : item.title}
              </li>
            ))}
          </ul>
        </div>

        <Link href={`/service/${service.slug}/`} className="services-page__card-link">
          Explore Service
        </Link>
      </div>
    </article>
  );
}

function FullServices({ label }) {
  const normalizedLabel = label?.toLowerCase();
  const formattedTitle = normalizedLabel
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const currentService =
    normalizedLabel && normalizedLabel !== "all"
      ? serviceSections.find((service) => service.slug === normalizedLabel)
      : null;

  const filteredServices =
    normalizedLabel === "all" || !normalizedLabel
      ? serviceSections
      : serviceSections.filter((service) => service.slug === normalizedLabel);

  useEffect(() => {
    AOS.init({
      duration: 850,
      once: true,
      easing: "ease-out-cubic",
      anchorPlacement: "top-bottom",
    });
    window.scrollTo(0, 0);
  }, [label]);

  return (
    <section className="services-page">
      <div className="services-page__shell">
        {currentService && <ServiceSchema service={currentService} />}

        <div className="services-page__hero">
          <div className="services-page__hero-copy" data-aos="fade-right">
            <span className="services-page__eyebrow">Adstra Services</span>
            <h1>
              {normalizedLabel === "all" || !normalizedLabel
                ? "Digital solutions built for modern growth."
                : `Specialized service for ${formattedTitle}`}
            </h1>
            <p className="services-page__lead">
              From search and paid media to content, design, analytics, and web
              execution, Adstra combines strategy with production so brands can
              grow through one aligned team.
            </p>
          </div>

          <div className="services-page__hero-panel" data-aos="fade-left" data-aos-delay="100">
            <article className="services-page__hero-stat">
              <strong>{filteredServices.length}</strong>
              <span>Service tracks</span>
            </article>
            <article className="services-page__hero-stat">
              <strong>360</strong>
              <span>Delivery model</span>
            </article>
            <article className="services-page__hero-stat">
              <strong>ROI</strong>
              <span>Performance focus</span>
            </article>
          </div>
        </div>

        <div className="services-page__intro-band" data-aos="fade-up">
          <p>
            SEO and website optimization, performance marketing, social media,
            branding, content, analytics, video production, and digital systems
            built to support real business outcomes.
          </p>
        </div>

        {filteredServices.length > 0 ? (
          <div className="services-page__grid">
            {filteredServices.map((service, index) => (
              <ServiceCard key={service.slug} service={service} index={index} />
            ))}
          </div>
        ) : (
          <p className="services-page__empty">No services found.</p>
        )}
      </div>
    </section>
  );
}

export default FullServices;
