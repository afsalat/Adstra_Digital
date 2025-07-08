import React, { useState } from "react";
import "./navbar.css";
import logo from "../../assets/logo/logo-new-03.png";
import bni from "../../assets/bni.png"

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className="navbar fixed-top bg-white shadow-sm py-2">
      <div className="container d-flex flex-wrap justify-content-between align-items-center">
        {/* Left - Logo */}
        <div className="d-flex align-items-center">
          <a href="/">
            <img
              src={logo}
              loading="lazy"
              alt="Company Logo"
              className="logo me-3"
            />
          </a>
        </div>

        {/* Hamburger - Visible only on small screens */}
        <div className="d-md-none hamburger" onClick={toggleMenu}>
          <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
          <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
          <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
        </div>

        {/* Center - Links */}
        <ul
          className={`nav nav-links flex-column flex-md-row ms-md-auto ${
            isMenuOpen ? "active d-flex" : "d-none d-md-flex"
          }`}
        >
          <li className="nav-item">
            <a className="nav-link" href="/">
              Home
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/about">
              About
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/service/all">
              Services
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/#gallery">
              Gallery
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/#enquiry">
              Enquiry
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/#contact">
              Contact us
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/blogs/all">
              Blogs
            </a>
          </li>

          {/* Show contact info on mobile inside the menu */}
          <li className="nav-item d-md-none mt-3 text-center">
            <div className="fw-bold">
              📞 +91 9744779574 - ✉️ info@adstradigital.com
            </div>
          </li>
        </ul>

        {/* Right - Desktop Only Contact Info */}
      <div className="navbar-right d-none d-md-flex align-items-center gap-3 ms-auto">
        <div className="text-end">
          <span className="phone fw-b old d-block">📞 +91 9744779574</span>
          <span className="email fw-bold d-block">✉️ info@adstradigital.com</span>
        </div>
      </div>
      </div>
    </nav>
  );
}

export default NavBar;
