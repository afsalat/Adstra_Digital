import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../Context/firebaseConfig";
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

    const serviceID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    const emailData = {
      fullName: formData.fullName,
      company: formData.company || "Not provided",
      email: formData.email,
      phone: formData.phone,
      website: formData.website || "Not provided",
      subject: formData.subject || "No subject provided",
      message: formData.message,
    };

    console.log("📤 Sending EmailJS data:", emailData);

    try {
      await emailjs.send(serviceID, templateID, emailData, publicKey);
      console.log("✅ EmailJS: Email sent successfully");

      await addDoc(collection(db, "enquiries"), formData);
      console.log("✅ Firebase: Enquiry saved");

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
      console.error("❌ EmailJS or Firebase error:", error);
      alert("Submission failed. Please double-check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="enquiry" className="enquiry-section">
      <div className="enquiry-container">
        <div className="enquiry-header">
          <h2>Enquire Now!!!</h2>
          <p>Fill out the form and let's bring your ideas to life.</p>
        </div>

        <form className="enquiry-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="company"
              placeholder="Company Name (if applicable)"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="text"
            name="website"
            placeholder="Website (if available)"
            value={formData.website}
            onChange={handleChange}
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Your Message *"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Enquiry"}
          </button>

          {submitted && (
            <div className="success-message">
              Thank you! We’ll be in touch shortly.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default Enquiry;
