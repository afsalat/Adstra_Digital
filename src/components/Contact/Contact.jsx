import React from "react";
import "./Contact.css";

function ContactUs() {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2>Contact Us</h2>
          <p>We’d love to hear from you! Reach out to us through any of the following channels.</p>
        </div>

        <div className="contact-details">
          <div className="contact-inf">
            <h3>Our Office</h3>
            <p>1234 Collaboration Lane<br />Innovation City, Techland 56789</p>

            <h3>Email</h3>
            <p><a href="mailto:info@astradigital.com">info@astradigital.com</a></p>

            <h3>Phone</h3>
            <p><a href="tel:+917875176626">+91 7875176626</a></p>

            <h3>Business Hours</h3>
            <p>Monday – Friday: 9:30 AM – 6 PM<br />Saturday & Sunday: Closed</p>

            <div className="social-links">
              <h3>Follow Us</h3>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>

          {/* Optional: Embed Google Map */}
          <div className="contact-map">
            <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0195774986144!2d75.78041528468207!3d11.25892977975988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7b4e4b4b4b4b4%3A0x4b4b4b4b4b4b4b4b4!2sSt.+Mary's+English+Church%2C+Kozhikode!5e0!3m2!1sen!2sin!4v1717078500000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactUs;
