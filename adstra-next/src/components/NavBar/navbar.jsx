'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './navbar.css';

import logo from '../../assets/logo/logo-new-03.png';
// import bni from '../../assets/bni.png';

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const navLinks = [
    ['Home', '/'],
    ['About', '/about'],
    ['Services', '/service/all'],
    ['Gallery', '/#gallery'],
    ['Enquiry', '/#enquiry'],
    ['Contact us', '/#contact'],
    ['Blogs', '/blogs/all'],
  ];

  return (
    <nav className="navbar fixed-top bg-white shadow-sm py-2">
      <div className="container d-flex flex-wrap justify-content-between align-items-center">
        {/* Logo */}
        <div className="d-flex align-items-center">
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
        </div>

        {/* Hamburger Menu */}
        <div className="d-md-none hamburger" onClick={toggleMenu}>
          <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
        </div>

        {/* Nav Links */}
        <ul
          className={`nav nav-links flex-column flex-md-row ms-md-auto ${
            isMenuOpen ? 'active d-flex' : 'd-none d-md-flex'
          }`}
        >
          {navLinks.map(([label, path]) => (
            <li className="nav-item" key={label}>
              <Link
                href={path}
                className={`nav-link ${pathname === path ? 'active' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}

          {/* Mobile Contact */}
          <li className="nav-item d-md-none mt-3 text-center">
            <div className="fw-bold">
              📞 +91 9744779574 - ✉️ info@adstradigital.com
            </div>
          </li>
        </ul>

        {/* Desktop Contact Info */}
        <div className="navbar-right d-none d-md-flex align-items-center gap-3 ms-auto">
          <div className="text-end me-2">
            <span className="phone fw-bold d-block">📞 +91 9744779574</span>
            <span className="email fw-bold d-block">✉️ info@adstradigital.com</span>
          </div>
          {/* <Image src={bni} alt="BNI Logo" width={60} height={40} className="bni-logo" /> */}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
