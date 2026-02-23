"use client";

import { motion } from "framer-motion";
import "./AdInvoice.css";

const adInvoiceServices = [
    {
        icon: "📄",
        title: "Invoice Generator",
        description:
            "Create professional, customizable invoices with automatic calculations, tax handling, and multiple payment options.",
        features: ["Auto-numbering", "Tax calculation", "PDF export"],
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
        icon: "🧾",
        title: "Receipt Creator",
        description:
            "Generate instant payment receipts with transaction details, perfect for tracking and record-keeping.",
        features: ["Instant generation", "Transaction tracking", "Print-ready"],
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
        icon: "📋",
        title: "Proposal Builder",
        description:
            "Build compelling business proposals with pricing tables, service breakdowns, and professional formatting.",
        features: ["Service tables", "Custom sections", "Brand styling"],
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
];

export default function AdInvoice() {
    return (
        <section className="adinvoice-section">
            <div className="adinvoice-container">
                <motion.div
                    className="adinvoice-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="adinvoice-badge">AdInvoice</span>
                    <h2 className="adinvoice-title">Streamline Your Business Documents</h2>
                    <p className="adinvoice-subtitle">
                        Professional invoices, receipts, and proposals in minutes. Simplify
                        your workflow with our powerful document generation tools.
                    </p>
                </motion.div>

                <div className="adinvoice-grid">
                    {adInvoiceServices.map((service, index) => (
                        <motion.div
                            key={service.title}
                            className="adinvoice-card"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                        >
                            <span className="adinvoice-card-border" aria-hidden="true" />
                            <span className="adinvoice-card-noise" aria-hidden="true" />

                            <div
                                className="adinvoice-icon-wrap"
                                style={{ background: service.gradient }}
                            >
                                <span className="adinvoice-icon">{service.icon}</span>
                            </div>

                            <div className="adinvoice-card-content">
                                <h3 className="adinvoice-card-title">{service.title}</h3>
                                <p className="adinvoice-card-description">
                                    {service.description}
                                </p>

                                <ul className="adinvoice-features">
                                    {service.features.map((feature) => (
                                        <li key={feature}>
                                            <span className="feature-check">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className="adinvoice-cta">
                                    Try Now
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M5 12h14M13 5l7 7-7 7"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="adinvoice-footer"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <p className="adinvoice-footer-text">
                        Ready to transform your business documentation?
                    </p>
                    <a href="#enquiry" className="adinvoice-main-cta">
                        Get Started Today
                        <span className="cta-arrow">→</span>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
