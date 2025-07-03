import React, { useEffect, useState } from "react";
import "./Footer.css";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import logo from "../../assets/logo/brand_logo.png";


function Footer() {
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const docRef = doc(db, "footer", "q9Xm9sF0G67MZmO5yqKO");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFooterData(docSnap.data());
        } else {
          console.error("No footer data found.");
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    };

    fetchFooterData();
  }, []);

  if (!footerData) return null;

  return (
    <footer className="footer bg-light pt-5">
      <div className="container">
        <div className="row text-center text-md-start gy-4 justify-content-between">
          {/* Company Info */}
          <div className="col-md-3">
              <a href="/" className="footer__logo">
                <img
                  src={logo}
                  loading="lazy"
                  alt="Company Logo"
                  className="logo me-3"
                />
              </a>
            <p className="footer__tagline">{footerData.company_caption}</p>
            <p className="small">📞 +91 9744779574</p>
            <p className="small">✉️ info@adstradigital.com</p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled footer__nav">
              <li>
                <a href="/" className="footer__nav-link">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="footer__nav-link">
                  About
                </a>
              </li>
              <li>
                <a href="/blogs/all" className="footer__nav-link">
                  Blog
                </a>
              </li>
              <li>
                <a href="/#contact" className="footer__nav-link">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-md-2">
            <h5 className="fw-bold mb-3">Services</h5>
            <ul className="list-unstyled footer__nav">
              <li>
                <a href="/service/all" className="footer__nav-link">
                  All Services
                </a>
              </li>
              <li>
                <a href="/#digital-marketing" className="footer__nav-link">
                  Digital Marketing
                </a>
              </li>
              <li>
                <a href="/#web-development" className="footer__nav-link">
                  Web Development
                </a>
              </li>
              <li>
                <a href="/#seo" className="footer__nav-link">
                  SEO
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-md-2">
            <h5 className="fw-bold mb-3">Resources</h5>
            <ul className="list-unstyled footer__nav">
              <li>
                <a href="/sitemap" className="footer__nav-link">
                  Sitemap
                </a>
              </li>
              <li>
                <a href="/faqs" className="footer__nav-link">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/policy" className="footer__nav-link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="footer__nav-link">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media & Downloads */}
          <div className="col-md-3">
            <h5 className="fw-bold mb-3">Follow Us</h5>
            <div className="d-flex gap-3 justify-content-center justify-content-md-start mb-3">
              <a
                href="https://www.facebook.com/adstradigital/"
                target="_blank"
                rel="noreferrer"
                className="footer__social-link"
              >
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a
                href="https://x.com/adstradigital"
                target="_blank"
                rel="noreferrer"
                className="footer__social-link"
              >
                <i className="bi bi-twitter-x fs-4"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/adstra-digital/about/"
                target="_blank"
                rel="noreferrer"
                className="footer__social-link"
              >
                <i className="bi bi-linkedin fs-4"></i>
              </a>
              <a
                href="https://www.pinterest.com/adstradigital"
                target="_blank"
                rel="noreferrer"
                className="footer__social-link"
              >
                <i className="bi bi-pinterest fs-4"></i>
              </a>
              <a
                href="https://www.instagram.com/adstradigital/"
                target="_blank"
                rel="noreferrer"
                className="footer__social-link"
              >
                <i className="bi bi-instagram fs-4"></i>
              </a>
            </div>

            <h6 className="fw-semibold mb-2 c-pointer">Downloads</h6>
            <ul className="list-unstyled footer__nav">
              <li className="mb-1">
                <a
                  href={footerData.brochure}
                  target="_blank"
                  rel="noreferrer"
                  className="footer__nav-link"
                  download
                >
                  📄 Brochure
                </a>
              </li>
              <li>
                <a
                  href={footerData.profile_pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="footer__nav-link"
                  download
                >
                  📥 Company Profile
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />
        <div className="text-center small footer__bottom">
          © {new Date().getFullYear()} {footerData.company_name}. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
