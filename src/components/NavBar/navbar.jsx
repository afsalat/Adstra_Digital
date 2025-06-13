import React, { useState } from "react";
import "./navbar.css";
import logo from '../../assets/logo/logo_icon.jpeg';

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="navbar">
      <div className="navbar-inside">
        <div className="navbar-left">
          <img src={logo} alt="Company Logo" className="logo" />
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
          <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
          <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
        </div>

        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <li><a href="/">Home</a></li>
          <li><a href="/service/all">Service</a></li>
          <li><a href="/#gallery">Gallery</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/#enquiry">Enquiry</a></li>
          <li><a href="/#contact">Contact us</a></li>
          <li><a href="/blogs/all">Blog</a></li>
        </ul>

        <div className="navbar-right">
          <div className="contact-info">
            <div className="phone">📞 +91 9744779574</div>
            <div className="email">✉️ info@adstradigital.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
