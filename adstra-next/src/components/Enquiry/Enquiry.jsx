"use client";

import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Enquiry.css";
import { useModal } from "@/Context/ModalContext";

const serviceHighlights = [
  {
    title: "Brand Strategy",
    copy: "Positioning, messaging, and identity systems built for long-term growth.",
  },
  {
    title: "Web Experience",
    copy: "High-conversion websites with custom UI, motion, and performance-first builds.",
  },
  {
    title: "Paid Media",
    copy: "Search, social, retargeting, and campaign optimization tuned for ROI.",
  },
  {
    title: "Content & Creative",
    copy: "Reels, ads, graphics, and storytelling that makes the brand feel alive.",
  },
];

const deliveryPoints = [
  "Dedicated strategy and execution support",
  "Fast turnarounds with clear communication",
  "Conversion-first design and growth thinking",
];

function Enquiry() {
  const { showAlert } = useModal();
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Note: Public key should ideally be initialized once, but for simplicity in this component:
  // emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const { fullName, email, phone, message } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s()]+$/;

    if (!fullName || !email || !phone || !message) return false;
    if (!emailRegex.test(email)) return false;
    if (!phoneRegex.test(phone)) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert("Incomplete Form", "Please fill all required fields with valid information before submitting.", "warning");
      return;
    }

    setLoading(true);

    const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    const emailData = {
      ...formData,
      company: formData.company || "Not provided",
      website: formData.website || "Not provided",
      subject: formData.subject || "No subject provided",
    };

    try {
      await emailjs.send(serviceID, templateID, emailData, publicKey);
      setSubmitted(true);
      setFormData({
        fullName: "",
        company: "",
        email: "",
        phone: "",
        website: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("EmailJS Error:", error);
      }
      showAlert("Submission Failed", "There was an error sending your enquiry. Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="enquiry" className="py-5 enquiry-section">
      <div className="container position-relative enquiry-container">
        <div className="enquiry-layout">
          <div className="enquiry-content">
            <span className="enquiry-badge">Start Your Project</span>
            <h2 className="text-gold enquiry-title">Let&apos;s Build Your Next Growth Move</h2>
            <p className="enquiry-subtext">
              Tell us what you&apos;re planning and we&apos;ll shape the right mix of
              strategy, design, media, and execution for it.
            </p>

            <div className="enquiry-service-grid">
              {serviceHighlights.map((service) => (
                <article className="enquiry-service-card" key={service.title}>
                  <span className="enquiry-service-card__dot" />
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                </article>
              ))}
            </div>

            <div className="enquiry-benefits">
              <div className="enquiry-benefits__panel">
                <span className="enquiry-benefits__eyebrow">Why clients choose Adstra</span>
                <ul className="enquiry-benefits__list">
                  {deliveryPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="enquiry-metric">
                <span className="enquiry-metric__value">360°</span>
                <span className="enquiry-metric__label">Creative, performance, and web execution under one roof.</span>
              </div>
            </div>
          </div>

          <div className="card enquiry-card">
            <div className="card-body p-4 p-md-4">
              <div className="enquiry-form-header">
                <h3>Quick Enquiry Form</h3>
                <p>Send your brief and we&apos;ll reply with the next step.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="form-control enquiry-input"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <input
                      type="text"
                      name="company"
                      placeholder="Company Name"
                      value={formData.company}
                      onChange={handleChange}
                      className="form-control enquiry-input"
                    />
                  </div>

                  <div className="col-12">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control enquiry-input"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control enquiry-input"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <input
                      type="text"
                      name="website"
                      placeholder="Website (if available)"
                      value={formData.website}
                      onChange={handleChange}
                      className="form-control enquiry-input"
                    />
                  </div>

                  <div className="col-12">
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-control enquiry-input"
                    />
                  </div>

                  <div className="col-12">
                    <textarea
                      name="message"
                      placeholder="Your Message *"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-control enquiry-input"
                      rows="5"
                      required
                    />
                  </div>

                  <div className="col-12 enquiry-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-gld enquiry-submit fw-bold"
                    >
                      {loading ? "Sending..." : "Send Enquiry"}
                    </button>
                  </div>
                </div>

                {submitted && (
                  <div className="alert alert-success mt-4 text-center fw-semibold enquiry-success">
                    Thank you! We&apos;ll be in touch shortly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Enquiry;
