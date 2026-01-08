"use client";

import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Enquiry.css";

function Enquiry() {
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

  // Initialize EmailJS
  emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);

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
      alert("Please fill all required fields with valid information.");
      return;
    }

    setLoading(true);

    const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

    const emailData = {
      ...formData,
      company: formData.company || "Not provided",
      website: formData.website || "Not provided",
      subject: formData.subject || "No subject provided",
    };

    try {
      await emailjs.send(serviceID, templateID, emailData);
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
      console.error("EmailJS Error:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="enquiry" className="py-5 enquiry-section">
      <div className="container position-relative">
        {/* Banner Image at Top */}
        <div className="enquiry-banner-container mb-4">
          <img
            src="/assets/adinvoice_pricing.jpeg"
            alt="Enquiry Banner"
            className="enquiry-banner-img"
          />
        </div>

        <div className="card enquiry-card mx-auto">
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-gold">Enquire Now!!!</h2>
              <p className="text-white">
                Fill out the form and let's bring your ideas to life.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
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

                <div className="col-md-6">
                  <input
                    type="text"
                    name="company"
                    placeholder="Company Name (if applicable)"
                    value={formData.company}
                    onChange={handleChange}
                    className="form-control enquiry-input"
                  />
                </div>

                <div className="col-md-6">
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

                <div className="col-md-6">
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

                <div className="col-12 text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-gld px-5 py-2 fw-bold"
                  >
                    {loading ? "Sending..." : "Send Enquiry"}
                  </button>
                </div>
              </div>

              {submitted && (
                <div className="alert alert-success mt-4 text-center fw-semibold">
                  Thank you! We’ll be in touch shortly.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Enquiry;
