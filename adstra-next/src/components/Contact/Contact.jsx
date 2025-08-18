"use client";

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

  if (loading)
    return <p className="text-center py-5">Loading company information...</p>;
  if (!info)
    return (
      <p className="text-danger text-center py-5">
        Failed to load company information.
      </p>
    );

  return (
    <section id="contact" className="contact-section py-5 bg-light text-center">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Contact Us</h2>
          <p className="text-muted">{info.title}</p>
        </div>

        <div className="row g-4 align-items-stretch">
          {/* Contact Info */}
          <div className="col-md-6">
            <div className="contact-inf p-4 h-100 rounded shadow-sm bg-white">
              <h3>Email</h3>
              <p>
                <a href={`mailto:${info.email}`}>{info.email}</a>
              </p>

              <h3>Phone</h3>
              <p>
                <a href={`tel: +91 9744779574`}>+91 9744779574</a>
              </p>

              <h3>Business Hours</h3>
              <p>Monday – Friday: 9:30 AM – 5:30 PM</p>

              <h3>Our Presence</h3>
              <p>
                {info.address_3}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Nadakkavu,+Kozhikode,+Kerala+673011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary ms-2"
                >
                  Go to
                </a>
              </p>
              <p>
                {info.address_2}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=ADSTRA+DIGITAL,+Anganwadi+Road,+Thirunelli,+Near+Indian+Oil+petrol+pump,+Batheri+Mysore+Road,+Sulthan+Bathery,+Kerala+673592"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary ms-2"
                >
                  Go to
                </a>
              </p>
              {/* <p>
                {info.address_1}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Kengeri+Satellite+Town,+Bangalore+560060"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary ms-2"
                >
                  Go to
                </a>
              </p> */}

              <div className="social-links mt-4">
                <h3>Follow Us</h3>
                <a
                  href="https://www.facebook.com/adstradigital/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/adstradigital/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://x.com/adstradigital"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
                <a
                  href="https://www.linkedin.com/company/adstra-digital/about/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
              <b>We’d love to hear from you!</b>
              <p>
                Whether you’re looking to grow your brand, need a digital audit,
                or just have a question — the team at AdstraDigital is here for
                you.{" "}
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="col-md-6">
            <div className="contact-map rounded overflow-hidden shadow-sm h-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.5227192185025!2d76.2796335!3d11.6573199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba607f2554bfa57%3A0xf47e913680e3620a!2sADSTRA%20DIGITAL!5e0!3m2!1sen!2sin!4v1750496038026!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AdstraDigital Office Location"
                width="100%"
                height="100%"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactUs;
