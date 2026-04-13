"use client";

import Image from "next/image";
import Link from "next/link";
import "./ProductsShowcase.css";

const products = [
  {
    name: "HRMS with Payroll",
    status: "Upcoming Product",
    image: "/assets/hrmspayroll-preview.png",
    imageAlt: "HRMS with Payroll product preview",
    description:
      "A centralized HR and payroll platform built to simplify attendance, leave, employee records, salary processing, and reporting for growing teams.",
    points: [
      "Attendance, leave, and employee lifecycle management",
      "Payroll workflows with cleaner approvals and reporting",
      "Designed for businesses that want fewer manual HR bottlenecks",
    ],
    primaryLabel: "Request Demo",
    primaryHref: "/#enquiry",
    secondaryLabel: "Talk to Team",
    secondaryHref: "/#contact",
  },
  {
    name: "Campus Management System",
    status: "Upcoming Product",
    reverse: true,
    image: "/assets/CMS-preview.jpeg",
    imageAlt: "Campus Management System product preview",
    description:
      "A structured platform for institutions that need better control over admissions, administration, communication, and everyday academic operations.",
    points: [
      "Admission, student, and administrative process tracking",
      "Clearer coordination across departments and stakeholders",
      "Built for scalability, visibility, and faster day-to-day workflows",
    ],
    primaryLabel: "Book Walkthrough",
    primaryHref: "/#enquiry",
    secondaryLabel: "Contact Us",
    secondaryHref: "/#contact",
  },
  {
    name: "AdInvoice",
    status: "Live Product",
    image: "/assets/adinvoice-preview.png",
    imageAlt: "AdInvoice product preview",
    description:
      "An invoicing and business document platform that helps teams create estimates, invoices, and records faster with a cleaner operational flow.",
    points: [
      "Professional invoicing with faster document generation",
      "Useful for teams that need a lightweight billing workflow",
      "Built to reduce admin friction and keep records organized",
    ],
    primaryLabel: "Visit AdInvoice",
    primaryHref: "https://adinvoice.in/",
    secondaryLabel: "Enquire Now",
    secondaryHref: "/#enquiry",
    external: true,
  },
];

function ProductsShowcase() {
  return (
    <section id="products" className="products-section">
      <div className="products-shell">
        <div className="products-heading">
          <span className="products-kicker">Our Products</span>
          <h2>Products built to support operations, workflow clarity, and business growth.</h2>
          <p>
            Alongside service delivery, we are building focused products that help
            teams manage operations, billing, and internal systems with less friction.
          </p>
        </div>

        <div className="products-list">
          {products.map((product) => (
            <article
              className={`products-card ${product.reverse ? "products-card--reverse" : ""}`}
              key={product.name}
            >
              <div className="products-card__media">
                <div className="products-card__image-wrap">
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    sizes="(max-width: 992px) 100vw, 46vw"
                    className="products-card__image"
                  />
                </div>
              </div>

              <div className="products-card__content">
                <span className="products-card__status">{product.status}</span>
                <h3>{product.name}</h3>
                <p>{product.description}</p>

                <ul className="products-card__points">
                  {product.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>

                <div className="products-card__actions">
                  {product.external ? (
                    <a
                      href={product.primaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="products-button products-button--primary"
                    >
                      {product.primaryLabel}
                    </a>
                  ) : (
                    <Link
                      href={product.primaryHref}
                      className="products-button products-button--primary"
                    >
                      {product.primaryLabel}
                    </Link>
                  )}

                  <Link
                    href={product.secondaryHref}
                    className="products-button products-button--secondary"
                  >
                    {product.secondaryLabel}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductsShowcase;
