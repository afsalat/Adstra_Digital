"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Career.css";

const perks = [
  "Work on digital projects that blend strategy, creative, and technology.",
  "Collaborate with a fast-moving team that values ownership and clarity.",
  "Keep learning through real client work, experimentation, and feedback.",
  "Build campaigns and platforms for ambitious brands across industries.",
];

const jobs = [
  {
    title: "Python Developer Intern",
    type: "Internship",
    desc:
      "Support internal tools, backend workflows, and digital systems that improve delivery speed and operational quality.",
    location: "Kozhikode, India",
    phone: "+91 9744779574",
    email: "info.adstradigital@gmail.com",
  },
  {
    title: "Marketing Executive",
    type: "Full Time",
    desc:
      "Plan campaigns, coordinate execution, and turn market insight into growth-focused marketing actions for client brands.",
    location: "Kozhikode, India",
    phone: "+91 9744779574",
    email: "info.adstradigital@gmail.com",
  },
];

export default function Career() {
  useEffect(() => {
    AOS.init({
      duration: 850,
      once: true,
      easing: "ease-out-cubic",
      anchorPlacement: "top-bottom",
    });
  }, []);

  return (
    <section className="career-page">
      <div className="career-page__shell">
        <div className="career-page__hero">
          <div className="career-page__hero-copy" data-aos="fade-right">
            <span className="career-page__eyebrow">Careers At Adstra</span>
            <h1>Join a team that builds with clarity, pace, and ambition.</h1>
            <p className="career-page__lead">
              At <strong>Adstra Digital</strong>, we believe strong work comes
              from people who care about craft, collaboration, and measurable
              outcomes. Explore opportunities to grow with a team that values
              ideas and execution equally.
            </p>

            <div className="career-page__hero-metrics" data-aos="fade-up" data-aos-delay="120">
              <article>
                <strong>{jobs.length}</strong>
                <span>Current openings</span>
              </article>
              <article>
                <strong>24h</strong>
                <span>Fast response culture</span>
              </article>
              <article>
                <strong>360</strong>
                <span>Cross-functional exposure</span>
              </article>
            </div>
          </div>

          <div className="career-page__hero-panel" data-aos="fade-left" data-aos-delay="140">
            <div className="career-page__image-frame">
              <img
                src="http://localhost:8000/media/team/carrer-office.jpg"
                alt="Career at Adstra Digital"
                className="career-page__image"
              />
            </div>

            <div className="career-page__spotlight">
              <span className="career-page__section-tag">Why Adstra</span>
              <p>
                Small enough to move fast. Skilled enough to deliver serious
                work. Structured enough to help you grow.
              </p>
            </div>
          </div>
        </div>

        <div className="career-page__benefits">
          <div className="career-page__section-header" data-aos="fade-up">
            <span className="career-page__section-tag">Work Environment</span>
            <h2>Why people enjoy building here.</h2>
            <p>
              We keep the environment practical, collaborative, and focused on
              improvement, so people can do meaningful work without noise.
            </p>
          </div>

          <div className="career-page__benefit-grid">
            {perks.map((perk, index) => (
              <article
                key={perk}
                className="career-page__benefit-card"
                data-aos="zoom-in-up"
                data-aos-delay={index * 70}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{perk}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="career-page__openings" data-aos="fade-up">
          <div className="career-page__section-header">
            <span className="career-page__section-tag">Current Openings</span>
            <h2>Open roles with room to grow.</h2>
            <p>
              Find the role that matches your strengths and help us build better
              digital outcomes for ambitious brands.
            </p>
          </div>

          <div className="career-page__jobs-grid">
            {jobs.map((job, index) => (
              <article
                className="career-page__job-card"
                key={job.title}
                data-aos="fade-up"
                data-aos-delay={index * 90}
              >
                <div className="career-page__job-top">
                  <span className="career-page__job-type">{job.type}</span>
                  <h3>{job.title}</h3>
                  <p>{job.desc}</p>
                </div>

                <div className="career-page__job-meta">
                  <div>
                    <label>Location</label>
                    <span>{job.location}</span>
                  </div>
                  <div>
                    <label>Email</label>
                    <a href={`mailto:${job.email}`}>{job.email}</a>
                  </div>
                  <div>
                    <label>Phone</label>
                    <a href={`tel:${job.phone}`}>{job.phone}</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="career-page__cta" data-aos="zoom-in-up">
          <div className="career-page__cta-copy">
            <span className="career-page__section-tag">Still Interested?</span>
            <h2>Didn’t find your exact role?</h2>
            <p>
              We’re always open to meeting thoughtful people who can strengthen
              the team. Send your resume and portfolio, and we’ll reach out when
              there’s a strong fit.
            </p>
          </div>

          <a className="career-page__cta-button" href="mailto:info.adstradigital@gmail.com">
            info.adstradigital@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
