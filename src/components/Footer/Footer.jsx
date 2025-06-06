import React, { useEffect, useState } from "react";
import "./Footer.css";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

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
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__logo-section">
          <h2 className="footer__logo">{footerData.company_name}</h2>
          <p className="footer__tagline">{footerData.company_caption}</p>
        </div>

        <nav className="footer__nav" aria-label="Footer Navigation">
          <a href="/policy" className="footer__nav-link">Privacy Policy</a>
          <a href="#!" className="footer__nav-link">Terms of Service</a>
          <a href="/#enquiry" className="footer__nav-link">Contact Us</a>
        </nav>

        <div className="footer__socials" aria-label="Social Media Links">
          <a href={footerData.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer__social-link">
            {/* Facebook SVG */}
            <svg width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.466.099 2.797.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.675V1.325C24 .6 23.4 0 22.675 0z" />
            </svg>
          </a>
          <a href={footerData.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="footer__social-link">
            {/* Twitter SVG */}
            <svg width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775a4.932 4.932 0 0 0 2.163-2.724 9.86 9.86 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.373 4.482A13.949 13.949 0 0 1 1.64 3.161a4.916 4.916 0 0 0 1.523 6.557 4.903 4.903 0 0 1-2.229-.616v.06a4.916 4.916 0 0 0 3.946 4.814 4.902 4.902 0 0 1-2.224.084 4.918 4.918 0 0 0 4.59 3.417 9.867 9.867 0 0 1-6.102 2.104c-.395 0-.787-.023-1.17-.069a13.945 13.945 0 0 0 7.557 2.213c9.054 0 14.002-7.496 14.002-13.986 0-.21 0-.423-.015-.633A10.012 10.012 0 0 0 24 4.59z" />
            </svg>
          </a>
          <a href={footerData.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer__social-link">
            {/* LinkedIn SVG */}
            <svg width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.039-1.852-3.039-1.853 0-2.136 1.445-2.136 2.939v5.669H9.066V9h3.104v1.561h.044c.433-.82 1.49-1.685 3.065-1.685 3.277 0 3.881 2.158 3.881 4.967v6.609zM5.337 7.433a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM6.895 20.452H3.781V9h3.114v11.452zM22.225 0H1.771C.792 0 0 .772 0 1.723v20.554C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.277V1.723C24 .772 23.2 0 22.225 0z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} {footerData.company_name}. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
