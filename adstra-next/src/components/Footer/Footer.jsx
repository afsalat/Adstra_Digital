"use client";

import React, { useEffect, useState } from "react";
import "./Footer.css";
import { db } from "@/Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import logo from "../../assets/logo/png-white.png";
import { useRouter } from "next/navigation";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const router = useRouter();

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

  const handleContactClick = () => {
    router.push("/#contact");
  };

  if (!footerData) return null;

  return (
    <footer className="footer pt-5">
      <div className="container">
        <div className="row text-center w-100 text-md-start gy-4 justify-content-between">
          {/* Company Info */}
          <div className="col-md-3">
            <a href="/" className="footer__logo">
              <img
                src={logo.src}
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
              <li><a href="/">Home</a></li>
              <li><a href="/about/">About</a></li>
              <li><a href="/blogs/all/">Blog</a></li>
              <li><a onClick={handleContactClick}>Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-md-2">
            <h5 className="fw-bold mb-3">Services</h5>
            <ul className="list-unstyled footer__nav">
              <li><a href="/service/all/">All Services</a></li>
              <li><a href="/service/google-ads/">Digital Marketing</a></li>
              <li><a href="/service/web-development/">Web Development</a></li>
              <li><a href="/service/seo-website-optimization/">SEO</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-md-2">
            <h5 className="fw-bold mb-3">Resources</h5>
            <ul className="list-unstyled footer__nav">
              <li><a href="/sitemap/">Sitemap</a></li>
              <li><a href="/policy/">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Social & Downloads */}
          <div className="col-md-3">
            <h5 className="fw-bold mb-3">Follow Us</h5>
            <div className="d-flex gap-3 justify-content-center justify-content-md-start mb-3">
              <a href="https://www.facebook.com/adstradigital/" target="_blank"><i className="bi bi-facebook fs-4" /></a>
              <a href="https://x.com/adstradigital" target="_blank"><i className="bi bi-twitter-x fs-4" /></a>
              <a href="https://www.linkedin.com/company/adstra-digital/about/" target="_blank"><i className="bi bi-linkedin fs-4" /></a>
              <a href="https://www.pinterest.com/adstradigital" target="_blank"><i className="bi bi-pinterest fs-4" /></a>
              <a href="https://www.instagram.com/adstradigital/" target="_blank"><i className="bi bi-instagram fs-4" /></a>
            </div>
          </div>
        </div>

      </div>
        <hr className="my-4" />
        <div className="text-center small footer__bottom">
          © {new Date().getFullYear()} {footerData.company_name}. All rights reserved.
        </div>
    </footer>
  );
};

export default Footer;
