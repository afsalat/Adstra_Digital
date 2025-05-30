import React, { useEffect, useState } from "react";
import "./Contact.css";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

function ContactUs() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const docRef = doc(db, "contact", "9YknLHusmTjsVxZgZa5P");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInfo(docSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  if (loading) {
    return <p>Loading company information...</p>;
  }

  if (!info) {
    return <p>Failed to load company information.</p>;
  }

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2>Contact Us</h2>
          <p>{info.title}</p>
        </div>

        <div className="contact-details">
          <div className="contact-inf">
            <h3>Our Office</h3>
            <p>{info.address}</p>

            <h3>Email</h3>
            <p><a href={`mailto:${info.email}`}>{info.email}</a></p>

            <h3>Phone</h3>
            <p><a href={`tel:${info.Pphone}`}>{info.Phone}</a></p>

            <h3>Business Hours</h3>
            <p>{info.working_hours}</p>

            <div className="social-links">
              <h3>Follow Us</h3>
              <a href={info.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href={info.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
              <a href={info.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>

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
