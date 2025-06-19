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

  if (loading) return <p className="text-center py-5">Loading company information...</p>;
  if (!info) return <p className="text-danger text-center py-5">Failed to load company information.</p>;

  return (
    <section id="contact" className="contact-section py-5 bg-light">
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
              <p><a href={`mailto:${info.email}`}>{info.email}</a></p>

              <h3>Phone</h3>
              <p><a href={`tel:${info.Pphone}`}>{info.Phone}</a></p>

              <h3>Business Hours</h3>
              <p>{info.working_hours}</p>

              <h3>Our Presence</h3>
              <p>{info.address_1}</p>
              <p>{info.address_2}</p>
              <p>{info.address_3}</p>

              <div className="social-links mt-4">
                <h3>Follow Us</h3>
                <a href={info.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href={info.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href={info.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="col-md-6">
            <div className="contact-map rounded overflow-hidden shadow-sm h-100">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15738.75983755624!2d75.776457!3d11.268645!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba65e98173164d3%3A0x3d7ba61c13bba84!2sCalicut!5e0!3m2!1sen!2sin!4v1718791012345!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactUs;
