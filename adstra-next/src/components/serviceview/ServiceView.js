"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";
import "./ServiceView.css";
import { serviceSections } from "@/data/services";
import { getServiceCardArt } from "@/utils/serviceCardArt";
import { hasImageSrc } from "@/utils/contentImage";

export default function ServiceView({ service }) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const heroImage =
    !imageFailed && hasImageSrc(service?.image)
      ? service.image.trim()
      : getServiceCardArt(service);

  useEffect(() => {
    setImageFailed(false);
  }, [service.slug]);

  useEffect(() => {
    AOS.init({
      duration: 850,
      once: true,
      easing: "ease-out-cubic",
      anchorPlacement: "top-bottom",
    });
  }, []);

  if (!service) return <p className="not-found">Service not found.</p>;

  const highlights = service.services || service.points || [];
  const benefits = service.benefits || [];
  const relatedServices = serviceSections
    .filter((item) => item.slug !== service.slug)
    .slice(0, 3);

  return (
    <section className="service-page">
      <div className="service-page__shell">
        <div className="service-page__hero">
          <div className="service-page__hero-copy" data-aos="fade-right">
            <span className="service-page__eyebrow">Professional Service</span>
            <h1>{service.title}</h1>
            <p className="service-page__tagline">{service.tagline}</p>
            <p className="service-page__lead">{service.intro || service.description}</p>

            <div className="service-page__actions" data-aos="fade-up" data-aos-delay="100">
              <button
                className="service-page__button service-page__button--primary"
                onClick={() => router.push("/#enquiry")}
              >
                {service.cta?.button || "Start Your Project"}
              </button>
              <Link
                className="service-page__button service-page__button--secondary"
                href="/service/all/"
              >
                View All Services
              </Link>
            </div>
          </div>

          <div className="service-page__hero-visual" data-aos="fade-left" data-aos-delay="120">
            <div className="service-page__image-frame">
              <img
                src={heroImage}
                alt={service.title}
                className="service-page__image"
                onError={() => setImageFailed(true)}
              />
            </div>

            <div className="service-page__meta-grid">
              <article className="service-page__meta-card">
                <strong>{highlights.length}+</strong>
                <span>Service pillars</span>
              </article>
              <article className="service-page__meta-card">
                <strong>ROI</strong>
                <span>Execution mindset</span>
              </article>
              <article className="service-page__meta-card">
                <strong>360</strong>
                <span>Strategy coverage</span>
              </article>
            </div>
          </div>
        </div>

        <div className="service-page__story-grid">
          <article className="service-page__panel" data-aos="fade-up-right">
            <span className="service-page__section-tag">Overview</span>
            <h2>Designed to move from attention to action.</h2>
            <p>{service.overview || service.description || service.intro}</p>
          </article>

          <article className="service-page__panel service-page__panel--accent" data-aos="fade-up-left">
            <span className="service-page__section-tag">What Clients Get</span>
            <ul className="service-page__checklist">
              <li>Clear strategy aligned to your business objective.</li>
              <li>Execution handled with creative, technical, and performance discipline.</li>
              <li>Work built to improve visibility, conversion, and brand trust.</li>
            </ul>
          </article>
        </div>

        <section className="service-page__section-block" data-aos="fade-up">
          <div className="service-page__section-header">
            <span className="service-page__section-tag">Capabilities</span>
            <h2>What’s included in this service.</h2>
            <p>
              Each engagement is built around practical execution, not vague
              deliverables. These are the key areas we focus on when delivering
              this service.
            </p>
          </div>

          <div className="service-page__capabilities-grid">
            {highlights.map((item, idx) => (
              <article
                key={idx}
                className="service-page__capability-card"
                data-aos="zoom-in-up"
                data-aos-delay={idx * 60}
              >
                <span>{String(idx + 1).padStart(2, "0")}</span>
                {typeof item === "string" ? (
                  <p>{item}</p>
                ) : (
                  <>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>

        {benefits.length > 0 && (
          <section className="service-page__benefits" data-aos="fade-up">
            <div className="service-page__section-header">
              <span className="service-page__section-tag">Why It Works</span>
              <h2>Why brands choose Adstra for this service.</h2>
            </div>

            <div className="service-page__benefit-list">
              {benefits.map((benefit, idx) => (
                <article
                  key={idx}
                  className="service-page__benefit-item"
                  data-aos="fade-up"
                  data-aos-delay={idx * 50}
                >
                  <span>{String(idx + 1).padStart(2, "0")}</span>
                  <p>{benefit}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="service-page__related" data-aos="fade-up">
          <div className="service-page__section-header">
            <span className="service-page__section-tag">Related Services</span>
            <h2>Explore adjacent capabilities.</h2>
          </div>

          <div className="service-page__related-grid">
            {relatedServices.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/service/${item.slug}/`}
                className="service-page__related-card"
                data-aos="fade-up"
                data-aos-delay={idx * 70}
              >
                <span>{item.tagline}</span>
                <h3>{item.title}</h3>
                <p>{item.intro || item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {service.cta && (
          <section className="service-page__cta" data-aos="zoom-in-up">
            <div className="service-page__cta-copy">
              <span className="service-page__section-tag">Ready To Start</span>
              <h2>{service.cta.headline}</h2>
              <p>{service.cta.subtext}</p>
              {service.cta.note && <small>{service.cta.note}</small>}
            </div>
            <button
              className="service-page__button service-page__button--primary"
              onClick={() => router.push("/#enquiry")}
            >
              {service.cta.button}
            </button>
          </section>
        )}
      </div>
    </section>
  );
}
