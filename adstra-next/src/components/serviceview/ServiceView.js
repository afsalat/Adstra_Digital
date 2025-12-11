"use client";

import React from "react";
import "./ServiceView.css";
import { CheckCircle, Star, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServiceView({ service }) {
  const router = useRouter();

  if (!service) return <p className="not-found">Service not found.</p>;

  return (
    <div className="srvice-detail-wrapper">
      {/* Title */}
      <h1 className="srvice-title">{service.title}</h1>
      <p className="srvice-subtitle">{service.description || service.intro}</p>

      {/* Image */}
      <div className="srvice-image-wrapper">
        <img src={service.image} alt={service.title} className="srvice-image" />
      </div>

      {/* Highlights */}
      {(service.services || service.points) && (
        <section className="highlight-section">
          <h2 className="section-heading">
            <Lightbulb size={22} className="icon yellow" />
            Key Highlights
          </h2>
          <ul className="highlight-list">
            {(service.services || service.points).map((item, idx) => (
              <li key={idx} className="highlight-item">
                <CheckCircle className="icon green" size={20} />
                <div>
                  {typeof item === "string" ? (
                    <span>{item}</span>
                  ) : (
                    <>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Benefits */}
      {service.benefits && (
        <section className="benefit-section">
          <h2 className="section-heading">
            <Star size={20} className="icon yellow" />
            Why Choose Us
          </h2>
          <ul className="benefit-list">
            {service.benefits.map((benefit, idx) => (
              <li key={idx}>{benefit}</li>
            ))}
          </ul>
        </section>
      )}                    

      {/* CTA */}
      {service.cta && (
        <div className="cta-section">
          <h3>{service.cta.headline}</h3>
          <p>{service.cta.subtext}</p>
          {service.cta.note && <small>{service.cta.note}</small>}
          <button className="cta-button" onClick={() => router.push("/#enquiry")}>{service.cta.button}</button>
        </div>
      )}
    </div>
  );
}