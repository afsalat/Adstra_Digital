"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Banner.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/Context/firebaseConfig";

function Banner() {
  const [messages, setMessages] = useState([]);
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupI, setShowPopupI] = useState(false);

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);
  const openPopupI = () => setShowPopupI(true);
  const closePopupI = () => setShowPopupI(false);

  const tileSets = useMemo(
    () => [
      [
        "https://adstradigital.com/media/landing_imgs/b1.jpeg",
        "https://adstradigital.com/media/landing_imgs/b2.jpeg",
        "https://adstradigital.com/media/landing_imgs/b3.jpeg",
        "https://adstradigital.com/media/landing_imgs/b3.jpeg",
      ],
      [
        "https://adstradigital.com/media/landing_imgs/c1.jpeg",
        "https://adstradigital.com/media/landing_imgs/c2.jpeg",
        "https://adstradigital.com/media/landing_imgs/c3.jpeg",
        "https://adstradigital.com/media/landing_imgs/c4.jpeg",
      ],
      [
        "https://adstradigital.com/media/landing_imgs/d1.jpeg",
        "https://adstradigital.com/media/landing_imgs/d2.jpeg",
        "https://adstradigital.com/media/landing_imgs/d3.jpeg",
        "https://adstradigital.com/media/landing_imgs/d4.jpeg",
      ],
      [
        "https://adstradigital.com/media/landing_imgs/e1.jpeg",
        "https://adstradigital.com/media/landing_imgs/e2.jpeg",
        "https://adstradigital.com/media/landing_imgs/e3.jpeg",
        "https://adstradigital.com/media/landing_imgs/e4.jpeg",
      ],
    ],
    []
  );

  // ✅ Animate headline messages only
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const docRef = doc(db, "banner", "p8jjjOYuVjsDuT2SyCTY");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const list = Array.isArray(data.header) ? data.header : [data.header];
          setMessages(list.filter(Boolean));
        }
      } catch { }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const i = setInterval(() => setIdx((p) => (p + 1) % messages.length), 5000);
    return () => clearInterval(i);
  }, [messages]);

  const headline = useMemo(() => {
    if (!mounted) return "Make demand. Move markets.";
    if (!messages.length) return "Make demand. Move markets.";
    return messages[idx];
  }, [mounted, messages, idx]);

  const words = useMemo(() => headline.split(" "), [headline]);

  const services = useMemo(
    () => [
      "Performance Marketing",
      "SEO & Content",
      "Brand Strategy",
      "Automation & CRM",
      "CRO & Analytics",
      "Video Campaigns",
      "3D/CGI Visuals",
    ],
    []
  );

  // ✅ CTA hover optimization
  const ctaRef = useRef(null);
  const rectRef = useRef(null);

  useEffect(() => {
    if (ctaRef.current)
      rectRef.current = ctaRef.current.getBoundingClientRect();
  }, []);

  const onCtaMove = (e) => {
    if (!rectRef.current) return;
    const { left, top, width, height } = rectRef.current;
    const x = (e.clientX - left - width / 2) / width;
    const y = (e.clientY - top - height / 2) / height;
    requestAnimationFrame(() => {
      if (ctaRef.current) {
        ctaRef.current.style.transform = `translate3d(${x * 4}px, ${y * 4
          }px, 0)`;
      }
    });
  };

  return (
    <section className="kinetic-hero">
      <div className="shimmer" aria-hidden="true" />
      <div className="bloom-left" aria-hidden="true" />
      <div className="bloom-right" aria-hidden="true" />

      <div className="specks" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>

      <div className="wrap">
        <div className="grid">
          <header className="intro" data-aos="fade-up">
            <p className="tag">Adstra Digital — Creative Performance</p>

            <h1 className="kinetic">
              {words.map((w, i) => (
                <span key={i} className="word" style={{ "--d": `${i}` }}>
                  {w}
                </span>
              ))}
            </h1>

            <p className="deck">
              Strategy, content, and automation joined with design to create
              compounding growth across channels.
            </p>

            <div className="cta-row">
              <a href="/#enquiry" onMouseMove={onCtaMove} className="cta primary">
                Start a project
              </a>

              <a
                href="https://wa.me/919744779574"
                target="_blank"
                rel="noopener noreferrer"
                className="cta ghost"
                aria-label="Chat on WhatsApp"
              >
                WhatsApp
              </a>
            </div>
          </header>

          <aside className="reel" data-aos="fade-left" data-aos-delay="100">
            {/* Existing Highlight */}
            <div className="highlight-trigger" onClick={openPopup}>
              <img src="/assets/adinvoice.png" alt="Preview" />
              <p>
                {" "}
                <b>ADinvoice</b> Our new invoice generating platform!!!
              </p>
            </div>

            {/* ✅ Internship Highlight */}
            <div
              className="internship-trigger"
              onClick={() => setShowPopupI("internship")}
            >
              <img src="/assets/intern.png" alt="Internship" />
              <p>Python Internship Program!!!</p>
            </div>

            {/* Popup Section */}
            {showPopup === true && (
              <div className="popup-overlay" onClick={closePopup}>
                <div
                  className="popup-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="popup-close" onClick={closePopup}>
                    ✕
                  </button>
                  <iframe
                    src="https://adinvoice.in"
                    title="Adstra Digital Map"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* ✅ Internship Popup */}
            {showPopupI === "internship" && (
              <div className="popup-overlay" onClick={closePopupI}>
                <div
                  className="popup-conten"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxHeight: "90vh",
                    overflowY: "auto",
                    padding: "2rem",
                  }}
                >
                  <button className="popup-close" onClick={closePopupI}>
                    ✕
                  </button>
                  <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
                    🐍 Python Internship Opportunity at Adstra Digital
                  </h2>

                  <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                    <strong>Are you ready to turn your passion for coding into a career?</strong>
                  </p>

                  <p style={{ marginBottom: "1.5rem" }}>
                    At Adstra Digital, we believe in nurturing talent and giving students
                    the chance to shine in real commercial projects.
                  </p>

                  <h3 style={{ fontSize: "1.4rem", marginTop: "1.5rem", marginBottom: "1rem" }}>
                    ✨ Why Join Us?
                  </h3>

                  <ul style={{
                    listStyle: "none",
                    paddingLeft: "0",
                    marginBottom: "1.5rem",
                    lineHeight: "1.8"
                  }}>
                    <li style={{ marginBottom: "0.8rem" }}>
                      <strong>🎯 Hands-on Experience:</strong> Work directly on major CRM,
                      e-commerce, and other live projects.
                    </li>
                    <li style={{ marginBottom: "0.8rem" }}>
                      <strong>📚 Step-by-Step Learning:</strong> Begin with a written and
                      practical test. Any unskilled areas will be guided and covered by our
                      expert technical mentors.
                    </li>
                    <li style={{ marginBottom: "0.8rem" }}>
                      <strong>🎓 Certified Internship Certificate:</strong> Globally valid
                      recognition of your hard work and achievement.
                    </li>
                    <li style={{ marginBottom: "0.8rem" }}>
                      <strong>💼 Career Pathway:</strong> Successful interns will be offered
                      jobs in our IT division.
                    </li>
                    <li style={{ marginBottom: "0.8rem" }}>
                      <strong>🚀 Growth & Confidence:</strong> Learn, build, and showcase your
                      skills in a professional environment.
                    </li>
                  </ul>

                  <h3 style={{ fontSize: "1.4rem", marginTop: "1.5rem", marginBottom: "1rem" }}>
                    📋 Internship Details
                  </h3>

                  <ul style={{
                    listStyle: "disc",
                    paddingLeft: "1.5rem",
                    marginBottom: "1.5rem",
                    lineHeight: "1.8"
                  }}>
                    <li style={{ marginBottom: "0.8rem" }}>
                      This is a student-paid internship designed to give you industry-level exposure.
                    </li>
                    <li style={{ marginBottom: "0.8rem" }}>
                      Duration and project allocation will be based on performance and learning pace.
                    </li>
                    <li style={{ marginBottom: "0.8rem" }}>
                      You will be part of a team that values creativity, discipline, and innovation.
                    </li>
                  </ul>

                  {/* ✅ Technologies Section */}
                  <div
                    style={{
                      marginTop: "1.5rem",
                      marginBottom: "1.5rem",
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="tech-tag">Python</span>
                    <span className="tech-tag">Django</span>
                    <span className="tech-tag">CRM</span>
                    <span className="tech-tag">E-Commerce</span>
                  </div>

                  <div style={{
                    background: "rgba(255, 215, 0, 0.1)",
                    padding: "1.5rem",
                    borderRadius: "10px",
                    marginBottom: "1.5rem",
                    border: "2px solid rgba(255, 215, 0, 0.3)"
                  }}>
                    <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
                      📞 How to Apply
                    </h3>
                    <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                      Don't just dream about becoming a Python developer — take the first step today!
                    </p>
                    <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                      Call us now at <a href="tel:9744779574" style={{ color: "#FFD700" }}>974477 9574</a> to secure your place.
                    </p>
                    <p style={{ fontStyle: "italic", fontSize: "0.95rem" }}>
                      Seats are limited, and opportunities like this don't wait.
                    </p>
                  </div>

                  <p style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginTop: "1.5rem",
                    marginBottom: "1.5rem"
                  }}>
                    Your future in IT starts here. Join Adstra Digital and code your way to success!
                  </p>

                  <div style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginTop: "1.5rem"
                  }}>
                    <a
                      href="tel:9744779574"
                      className="cta primary"
                      style={{ display: "inline-block" }}
                    >
                      📞 Call Now
                    </a>
                    <a
                      href="https://wa.me/919744779574?text=Hi,%20I'm%20interested%20in%20the%20Python%20Internship%20at%20Adstra%20Digital"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta ghost"
                      style={{ display: "inline-block" }}
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="cards">
              <section className="four-grid" aria-label="Work Showcase">
                {tileSets.map((set, t) => (
                  <figure key={t} className="fg-card">
                    {set.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Tile ${t + 1}`}
                        loading="lazy"
                      />
                    ))}
                    <figcaption>
                      {t === 0
                        ? "Campaign Creative"
                        : t === 1
                          ? "Motion & Reels"
                          : t === 2
                            ? "3D/CGI Visuals"
                            : "Brand Stories"}
                    </figcaption>
                  </figure>
                ))}
              </section>
            </div>

            {showPopup && (
              <div className="popup-overlay" onClick={closePopup}>
                <div
                  className="popup-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="popup-close" onClick={closePopup}>
                    ✕
                  </button>

                  {/* Embedded Website */}
                  <iframe
                    src="https://adinvoice.in"
                    title="Adstra Digital Map"
                    width="100%"
                    height="200"
                    style={{
                      border: "0",
                      borderRadius: "10px",
                      marginTop: "1rem",
                    }}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            <div className="stats">
              <div className="pill">
                <strong>+182%</strong>
                <span>Qualified leads</span>
              </div>
              <div className="pill">
                <strong>-42%</strong>
                <span>CAC reduction</span>
              </div>
              <div className="pill">
                <strong>3x</strong>
                <span>Faster GTM</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="ticker" aria-label="Services">
        <div className="mask">
          <div className="track">
            {services.concat(services).map((s, i) => (
              <span key={i} className="chip">
                • {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
