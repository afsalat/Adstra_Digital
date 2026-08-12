"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Mail,
  MessageCircle,
  Phone,
  ReceiptText,
  ShieldCheck,
  UsersRound,
  Workflow,
} from "lucide-react";
import certificationArtwork from "@/assets/logo/CERTIFICATE.png";
import { useModal } from "@/Context/ModalContext";
import "./SoftwareSolutionsPage.css";

const productIndex = [
  { id: "erp", label: "ERP", number: "01" },
  { id: "crm", label: "CRM", number: "02" },
  { id: "hrms", label: "HRMS + Payroll", number: "03" },
  { id: "campus", label: "CampusMS", number: "04" },
  { id: "adinvoice", label: "AdInvoice", number: "05" },
];

const ecosystemNodes = [
  { label: "Ayurvedic ERP", icon: Layers3, className: "node-erp" },
  { label: "CRM", icon: BarChart3, className: "node-crm" },
  { label: "HRMS & Payroll", icon: UsersRound, className: "node-hrms" },
  { label: "CampusMS", icon: GraduationCap, className: "node-campus" },
  { label: "AdInvoice", icon: ReceiptText, className: "node-invoice" },
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  subject: "Ayurvedic ERP",
  message: "",
};

function EcosystemMap() {
  return (
    <div className="software-ecosystem" aria-label="Adstra connected software ecosystem">
      <span className="ecosystem-kicker">CONNECTED OPERATIONS</span>
      <div className="ecosystem-grid" aria-hidden="true" />
      <div className="ecosystem-orbit orbit-one" aria-hidden="true" />
      <div className="ecosystem-orbit orbit-two" aria-hidden="true" />
      <div className="ecosystem-hub">
        <Workflow size={26} />
        <strong>ADSTRA</strong>
        <span>Platform core</span>
      </div>
      {ecosystemNodes.map(({ label, icon: Icon, className }) => (
        <div className={`ecosystem-node ${className}`} key={label}>
          <span><Icon size={18} /></span>
          <strong>{label}</strong>
        </div>
      ))}
      <p className="ecosystem-caption">One operational view. Purpose-built modules.</p>
    </div>
  );
}

function ErpSchematic() {
  const modules = ["Auto timetable", "Finance", "HRMS", "Library", "Inventory"];
  return (
    <div className="erp-schematic" aria-label="ERP module architecture illustration">
      <div className="erp-schematic__topline">
        <span>ERP / SYSTEM MAP</span>
        <span className="system-status"><i /> Live visibility</span>
      </div>
      <div className="erp-core"><Layers3 size={24} /><span>Unified data core</span></div>
      <div className="erp-modules">
        {modules.map((module, index) => (
          <div className="erp-module" key={module}>
            <span>0{index + 1}</span>
            <strong>{module}</strong>
            <Check size={16} />
          </div>
        ))}
      </div>
      <div className="erp-schematic__footer">
        <span>Shared controls</span><span>Connected reporting</span><span>Scalable access</span>
      </div>
    </div>
  );
}

function ProductVisual({ src, alt, badge }) {
  return (
    <div className="product-visual">
      <div className="product-visual__chrome">
        <span /><span /><span />
        <strong>{badge}</strong>
      </div>
      <div className="product-visual__image">
        <Image src={src} alt={alt} fill sizes="(max-width: 800px) 100vw, 52vw" />
      </div>
    </div>
  );
}

function Benefits({ items }) {
  return (
    <ul className="product-benefits">
      {items.map((item) => (
        <li key={item}><CheckCircle2 size={19} aria-hidden="true" /><span>{item}</span></li>
      ))}
    </ul>
  );
}

export default function SoftwareSolutionsPage() {
  const { showAlert } = useModal();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = ({ target }) => {
    setFormData((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const phoneIsValid = /^[0-9+\-\s()]{7,}$/.test(formData.phone);

    if (!formData.fullName.trim() || !emailIsValid || !phoneIsValid || !formData.message.trim()) {
      showAlert("Check your details", "Please complete all required fields with a valid email and phone number.", "warning");
      return;
    }

    setLoading(true);
    setSubmitted(false);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        { ...formData, website: "Product solutions page" },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
      setFormData(initialForm);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("EmailJS Error:", error);
      showAlert("Submission failed", "We could not send your request. Please try again or call our product team.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="software-page">
      <section className="software-hero" aria-labelledby="software-title">
        <div className="software-container software-hero__layout">
          <div className="software-hero__copy">
            <div className="software-eyebrow"><span /> Clinic software, made operational</div>
            <h1 id="software-title">Complete Management Software for <em>Ayurvedic Clinics &amp; Hospitals</em></h1>
            <p className="software-hero__lead">
              Adstra Digital is ISO, IAF, EGAC &amp; QRO certified, delivering specialized ERP, Patient Management, Pharmacy, and Panchakarma systems built around real clinical needs.
            </p>
            <div className="hero-trustline">
              <span><ShieldCheck size={19} /> Certified delivery</span>
              <span><CheckCircle2 size={19} /> Trusted by 5-star clients</span>
            </div>
            <div className="software-actions">
              <a className="software-button software-button--primary" href="#product-enquiry">Request a Demo <ArrowRight size={18} /></a>
              <a className="software-button software-button--text" href="#solutions">Explore Solutions <span>↓</span></a>
            </div>
          </div>
          <EcosystemMap />
        </div>
      </section>

      <nav className="product-index" aria-label="Software solution index">
        <div className="software-container product-index__inner">
          <span className="product-index__label">Solution index</span>
          <div className="product-index__links">
            {productIndex.map((item) => <a href={`#${item.id}`} key={item.id}><small>{item.number}</small>{item.label}</a>)}
          </div>
        </div>
      </nav>

      <section id="solutions" className="product-atlas" aria-labelledby="atlas-heading">
        <div className="software-container atlas-intro">
          <div><span className="section-index">01 / PRODUCT ATLAS</span><h2 id="atlas-heading">Software that meets work where it happens.</h2></div>
          <p>Each solution can stand alone or become part of a connected operational foundation—shaped around your people, controls, and growth plans.</p>
        </div>

        <article id="erp" className="product-chapter product-chapter--erp">
          <div className="software-container product-chapter__grid">
            <div className="product-copy">
              <span className="product-number">01 <i /> Clinic &amp; Hospital Management</span>
              <h2>Ayurvedic ERP</h2>
              <p className="product-statement">Unify patient records, consultations, and dispensary operations in one specialized system.</p>
              <h3>Built for Ayurvedic Healing Centers</h3>
              <Benefits items={["Patient management, appointments, and digital case files", "Integrated pharmacy, stock alerts, and dispensary operations", "Panchakarma booking and consultation scheduling", "Clinical and financial insights at a glance"]} />
              <a className="product-cta" href="#product-enquiry">Request Demo <ArrowRight size={18} /></a>
            </div>
            <ProductVisual src="/assets/ayurvedic_erp.png" alt="ERP dashboard preview" badge="ERP / SYSTEM MAP" />
          </div>
        </article>

        <article id="crm" className="product-chapter product-chapter--reverse">
          <div className="software-container product-chapter__grid">
            <ProductVisual src="/assets/premier-CRM-preview.png" alt="CRM lead and client management dashboard preview" badge="CRM / RELATIONSHIPS" />
            <div className="product-copy">
              <span className="product-number">02 <i /> Customer Relationship Management</span>
              <h2>CRM</h2>
              <p className="product-statement">Turn every lead and client interaction into a clear, trackable relationship.</p>
              <h3>From first contact to follow-through</h3>
              <Benefits items={["Centralized lead tracking and sales visibility", "Clearer client communication across teams", "Secure client portals for confident collaboration", "Stronger relationships and faster conversions"]} />
              <a className="product-cta" href="#product-enquiry">Contact Us <ArrowRight size={18} /></a>
            </div>
          </div>
        </article>

        <article id="hrms" className="product-chapter">
          <div className="software-container product-chapter__grid">
            <div className="product-copy">
              <span className="product-number">03 <i /> People Operations</span>
              <h2>HRMS + Payroll</h2>
              <p className="product-statement">Remove friction from attendance, leave, employee records, and salary workflows.</p>
              <h3>People processes, without the paperwork drag</h3>
              <Benefits items={["Fewer manual bottlenecks in routine HR work", "Consistent leave and attendance approvals", "Organized salary and payroll records", "Clearer workforce visibility for better decisions"]} />
              <a className="product-cta" href="#product-enquiry">Explore HRMS <ArrowRight size={18} /></a>
            </div>
            <ProductVisual src="/assets/hrmspayroll-preview.png" alt="HRMS and payroll analytics dashboard preview" badge="HRMS / PAYROLL" />
          </div>
        </article>

        <article id="campus" className="product-chapter product-chapter--dark product-chapter--reverse">
          <div className="software-container product-chapter__grid">
            <ProductVisual src="/assets/CMS-preview.jpeg" alt="Campus management system dashboard preview" badge="CAMPUS / CONNECTED" />
            <div className="product-copy">
              <span className="product-number">04 <i /> Education Operations</span>
              <h2>Campus Management System</h2>
              <p className="product-statement">Connect admissions, academics, operations, and communication across schools and colleges.</p>
              <h3>A calmer way to run the institution</h3>
              <Benefits items={["Streamlined admission journeys", "Connected academic and administrative workflows", "Timely communication across the campus community", "Clearer institutional oversight for leadership"]} />
              <Link className="product-cta" href="/products/campus-management-system/">Discover CampusMS <ArrowRight size={18} /></Link>
            </div>
          </div>
        </article>

        <article id="adinvoice" className="product-chapter">
          <div className="software-container product-chapter__grid">
            <div className="product-copy">
              <span className="product-number">05 <i /> Everyday Finance</span>
              <h2>AdInvoice</h2>
              <p className="product-statement">Lightweight invoicing for teams that want faster billing without operational clutter.</p>
              <h3>Billing that stays out of your way</h3>
              <Benefits items={["Faster invoice creation for day-to-day billing", "Organized customer and transaction records", "Cleaner payment tracking and follow-up", "Simple workflows that are easy to adopt"]} />
              <a className="product-cta" href="#product-enquiry">Try AdInvoice <ArrowRight size={18} /></a>
            </div>
            <ProductVisual src="/assets/adinvoice-preview.png" alt="AdInvoice billing dashboard preview" badge="ADINVOICE / BILLING" />
          </div>
        </article>
      </section>

      <section className="software-proof" aria-labelledby="proof-title">
        <div className="software-container proof-layout">
          <div className="proof-copy">
            <span className="section-index section-index--light">02 / TRUST &amp; CONTROL</span>
            <h2 id="proof-title">Built for accountable operations.</h2>
            <p>Our delivery approach puts clarity, documented workflows, and dependable support at the center—so software becomes infrastructure your team can trust.</p>
            <div className="proof-certification">
              <Image src={certificationArtwork} alt="ISO 9001:2015, IAF, QRO and EGAC certification marks" sizes="(max-width: 700px) 90vw, 560px" />
            </div>
          </div>
          <div className="outcome-panel">
            <span className="outcome-panel__label">What teams gain</span>
            <div className="outcome"><Clock3 /><div><strong>Time back</strong><p>Less repetition in everyday operational work.</p></div></div>
            <div className="outcome"><Workflow /><div><strong>Fewer handoffs</strong><p>Connected workflows with clearer ownership.</p></div></div>
            <div className="outcome"><BarChart3 /><div><strong>Clearer reporting</strong><p>Information organized for confident decisions.</p></div></div>
            <div className="outcome"><ShieldCheck /><div><strong>Responsible controls</strong><p>Purposeful access and documented processes.</p></div></div>
          </div>
        </div>
      </section>

      <section id="product-enquiry" className="product-enquiry" aria-labelledby="enquiry-title">
        <div className="software-container enquiry-layout">
          <div className="enquiry-intro">
            <span className="section-index">03 / START A CONVERSATION</span>
            <h2 id="enquiry-title">Let’s find the right operational fit.</h2>
            <p>Tell our product team where work is slowing down. We’ll help map the software, integration, or custom build that makes sense.</p>
            <div className="contact-entries">
              <a href="tel:+919744779574"><Phone size={20} /><span><small>Product hotline</small><strong>+91 97447 79574</strong></span></a>
              <a href="mailto:info@adstradigital.com"><Mail size={20} /><span><small>Work email</small><strong>info@adstradigital.com</strong></span></a>
              <a href="https://wa.me/919744779574?text=Hi%2C%20I%27d%20like%20to%20discuss%20Adstra%27s%20software%20solutions." target="_blank" rel="noreferrer"><MessageCircle size={20} /><span><small>WhatsApp</small><strong>Chat with the team</strong></span></a>
            </div>
          </div>

          <form className="product-form" onSubmit={handleSubmit} noValidate>
            <div className="product-form__heading"><span>PRODUCT ENQUIRY</span><p>Required fields are marked *</p></div>
            <div className="form-grid">
              <label><span>Name *</span><input name="fullName" value={formData.fullName} onChange={handleChange} autoComplete="name" required /></label>
              <label><span>Work email *</span><input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required /></label>
              <label><span>Phone *</span><input type="tel" name="phone" value={formData.phone} onChange={handleChange} autoComplete="tel" required /></label>
              <label><span>Organization</span><input name="company" value={formData.company} onChange={handleChange} autoComplete="organization" /></label>
              <label className="form-span"><span>Solution interest</span><select name="subject" value={formData.subject} onChange={handleChange}><option>Ayurvedic ERP</option><option>CRM</option><option>HRMS + Payroll</option><option>Campus Management System</option><option>AdInvoice</option><option>Custom Application</option></select></label>
              <label className="form-span"><span>What would you like to improve? *</span><textarea name="message" value={formData.message} onChange={handleChange} rows="4" required /></label>
            </div>
            <div className="form-submit-row">
              <button type="submit" disabled={loading}>{loading ? "Sending request…" : "Request a product consultation"}<ArrowRight size={18} /></button>
              <p>We’ll use your details only to respond to this enquiry.</p>
            </div>
            <div className="form-status" aria-live="polite">{submitted ? "Thank you. Your request has been sent to our product team." : ""}</div>
          </form>
        </div>
      </section>
    </main>
  );
}
