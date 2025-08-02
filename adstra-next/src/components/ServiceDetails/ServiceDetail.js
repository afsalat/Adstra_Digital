"use client";

import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./ServiceDetail.css";
import Link from "next/link"; // ✅ for navigation
import { serviceSections } from "@/data/services";
import ServiceSchema from "@/components/Schema/ServiceSchema";

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
    AOS.init({ duration: 500 });
    window.scrollTo(0, 0);
  }, [label]);

  return (
    <div className="full-services">
      {/* Optional: Structured data for current page */}
      {currentService && <ServiceSchema service={currentService} />}

      <h1 data-aos="fade-down">
        {normalizedLabel === "all" || !normalizedLabel
          ? "Digital Solutions"
          : `Specialized Service: ${formattedTitle}`}
      </h1>

      <h2 className="service-subtitle">
        SEO & Website Optimization Google Ads & Paid Advertising Social Media
        Marketing & Lead Generation Branding & Identity Design Creative Content
        Production Web Design & Development Google Business Profile Management
      </h2>

      {filteredServices.length > 0 ? (
        filteredServices.map((service, index) => (
          <Tilt
            key={index}
            glareEnable
            glareMaxOpacity={0.1}
            scale={1.02}
            tiltMaxAngleX={3}
            tiltMaxAngleY={3}
            transitionSpeed={500}
            gyroscope={true}
          >
            <div
              className="service-block"
              data-aos="fade-up"
              data-aos-delay={100}
            >
              <div className="service-content">
                <img
                  src={service.image}
                  alt={service.title}
                  className="service-image"
                />
                <div className="service-text">
                  <h3>{service.title}</h3>
                  <p>{service.description || service.intro}</p>
                  <ul>
                    {(service.points || service.services)
                      ?.slice(0, 3)
                      .map((item, idx) => (
                        <li key={idx}>
                          {typeof item === "string" ? (
                            item
                          ) : (
                            <>
                              <strong>{item.title}:</strong> {item.description}
                            </>
                          )}
                        </li>
                      ))}
                  </ul>
                  <Link href={`/service/${service.slug}`}>
                    <button className="learn-morebtn">Learn More</button>
                  </Link>
                </div>
              </div>
            </div>
          </Tilt>
        ))
      ) : (
        <p style={{ textAlign: "center" }}>No services found.</p>
      )}
    </div>
  );
}

export default FullServices;
