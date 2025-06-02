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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { fullName, email, phone, message } = formData;

    if (!fullName || !email || !phone || !message) {
      alert("Please fill in all required fields.");
      return;
    }

    const serviceID = "YOUR_SERVICE_ID";
    const templateID = "YOUR_TEMPLATE_ID";
    const publicKey = "YOUR_PUBLIC_KEY";

    emailjs
      .send(serviceID, templateID, formData, publicKey)
      .then(
        (response) => {
          console.log("Email sent successfully!", response.status, response.text);
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
        },
        (error) => {
          console.error("Failed to send email:", error);
          alert("Oops! Something went wrong. Please try again later.");
        }
      );
  };

  return (
    <section id="enquiry" className="enquiry-section">
      <div className="enquiry-container">
        <div className="enquiry-header">
          <h2>Let's Collaborate</h2>
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
          <button type="submit">Send Enquiry</button>
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
