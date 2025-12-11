"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./navbar.css";

import logo from "@/assets/logo/png-white.png";
import iso from "@/assets/logo/CERTIFICATE.png";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const updateActivePath = () => {
      const hash = window.location.hash; // "#gallery" or ""
      if (hash) {
        setActivePath(`${pathname}${hash}`);
      } else {
        setActivePath(pathname);
      }
    };

    updateActivePath();
    window.addEventListener("hashchange", updateActivePath);
    return () => window.removeEventListener("hashchange", updateActivePath);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const navLinks = [
    ["Home", "/"],
    ["About", "/about/"],
    ["Services", "/service/all/"],
    ["Gallery", "/#gallery"],
    ["Enquiry", "/#enquiry"],
    ["Contact us", "/#contact"],
    ["Careers", "/career/"],
    ["Blogs", "/blogs/all/"],
  ];

  return (
    <nav className="navbar fixed-top shadow-sm py-2">
      <div className="container d-flex flex-column">
        {/* Top Row: Logo & Menu */}
        <div className="d-flex justify-content-between align-items-center w-100">
          <Link href="/">
            <Image
              src={logo}
              alt="Company Logo"
              className="logo me-3"
              width={150}
              height={50}
              priority
            />
          </Link>

          {/* Hamburger (Mobile) */}
          <div className="d-md-none hamburger" onClick={toggleMenu}>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
          </div>

          {/* Nav Links */}
          <ul
            className={`nav nav-links flex-column flex-md-row ms-md-auto ${
              isMenuOpen ? "active d-flex" : "d-none d-md-flex"
            }`}
          >
            {navLinks.map(([label, path]) => (
              <li className="nav-item" key={label}>
                <Link
                  href={path}
                  className={`nav-link ${activePath === path ? "active" : ""}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="iso mt-0 mt-md-0">
            <Image
              src={iso}
              alt="ISO Certified"
              width={260}
              height={70}
              className="iso-logo"
            />
          </div>
        </div>

        {/* Bottom Row: Contact Info */}
        <div className="navbar-bottom d-flex justify-content-end mt-2 w-100">
          <div className="contact-info d-flex flex-column flex-md-row align-items-center gap-3">
            <a href="tel:+919876543210" className="phone">
              📞 +91 9744779574
            </a>
            <a href="mailto:info@adstradigital.com" className="email">
              ✉️ info@adstradigital.com
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
