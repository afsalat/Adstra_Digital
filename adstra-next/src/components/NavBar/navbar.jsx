"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./navbar.css";

const normalizePath = (value = "") => {
  if (!value) return "/";
  if (value === "/") return "/";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const normalizeHashPath = (pathname, hash = "") =>
  hash ? `${normalizePath(pathname)}${hash}` : normalizePath(pathname);

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateActivePath = () => {
      const hash = window.location.hash;
      setActivePath(normalizeHashPath(pathname, hash));
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
    {
      label: "Home",
      href: "/",
      isActive: () => activePath === "/",
    },
    {
      label: "About",
      href: "/about/",
      isActive: () => normalizePath(pathname).startsWith("/about"),
    },
    {
      label: "Services",
      href: "/service/all/",
      isActive: () => normalizePath(pathname).startsWith("/service"),
    },
    {
      label: "Products",
      href: "/#products",
      isActive: () => normalizePath(pathname).startsWith("/products"),
    },
    {
      label: "Gallery",
      href: "/#gallery",
      isActive: () => activePath === "/#gallery",
    },
    {
      label: "Enquiry",
      href: "/#enquiry",
      isActive: () => activePath === "/#enquiry",
    },
    {
      label: "Contact us",
      href: "/#contact",
      isActive: () => activePath === "/#contact",
    },
    {
      label: "Careers",
      href: "/career/",
      isActive: () => normalizePath(pathname).startsWith("/career"),
    },
    {
      label: "Blogs",
      href: "/blogs/all/",
      isActive: () => normalizePath(pathname).startsWith("/blogs"),
    },
  ];

  return (
    <nav className={`navbar fixed-top py-2 ${isScrolled ? "scrolled shadow-sm" : ""}`}>
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
            {navLinks.map(({ label, href, isActive }) => (
              <li className="nav-item" key={label}>
                <Link
                  href={href}
                  className={`nav-link ${isActive() ? "active" : ""}`}
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
