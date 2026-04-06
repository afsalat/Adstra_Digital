"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./navbar.css";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const updateActivePath = () => {
      const hash = window.location.hash;
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

  const closeMenu = () => {
    setIsMenuOpen(false);
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
        <div className="navbar-row d-flex align-items-center w-100">
          <Link href="/">
            <Image
              src="/assets/LG.png"
              alt="Company Logo"
              className="logo me-3"
              width={290}
              height={85}
              priority
            />
          </Link>

          <div className="d-md-none hamburger" onClick={toggleMenu}>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
            <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
          </div>

          <ul
            className={`nav nav-links flex-column flex-md-row ms-md-auto ${isMenuOpen ? "active d-flex" : "d-none d-md-flex"
              }`}
          >
            {navLinks.map(([label, path]) => (
              <li className="nav-item" key={label}>
                <Link
                  href={path}
                  className={`nav-link ${activePath === path ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
