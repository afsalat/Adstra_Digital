"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Bus,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Library,
  LockKeyhole,
  MessageSquareText,
  Moon,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import "./CampusMSPage.css";

const metrics = [
  { value: "158", label: "Frontend pages" },
  { value: "90+", label: "Database models" },
  { value: "28", label: "App modules" },
  { value: "4", label: "User portals" },
];

const portals = [
  {
    name: "Admin Portal",
    count: "114 pages",
    copy: "A complete command centre for school configuration, reports, approvals, finance, academics, and daily operations.",
  },
  {
    name: "Student Portal",
    count: "15 pages",
    copy: "A focused academic hub for assignments, attendance, timetables, fees, library, results, documents, and brain games.",
  },
  {
    name: "Parent Portal",
    count: "8 pages",
    copy: "Real-time visibility into attendance, homework, progress, fees, transport tracking, announcements, and PTM activity.",
  },
  {
    name: "Staff / Teacher Portal",
    count: "6 pages",
    copy: "Classroom, study material, attendance, transport, HR, and staff directory tools for teaching and non-teaching teams.",
  },
];

const modules = [
  { icon: UsersRound, title: "Student Management", copy: "Profiles, enrolment, promotion, leave, attendance history, portal access, and performance analytics." },
  { icon: GraduationCap, title: "Academics & Exams", copy: "Classes, subjects, syllabus, assignments, timetable builder, online tests, report cards, and results." },
  { icon: CreditCard, title: "Finance & Payroll", copy: "Fees, concessions, dues, receipts, payroll, budgets, expenses, donations, and financial reports." },
  { icon: Bus, title: "Transport & Hostel", copy: "Fleet routes, live GPS, bus attendance, hostel rooms, allocations, mess menus, visitors, and dues." },
  { icon: Library, title: "Library & Store", copy: "Book catalogue, issue and return, barcode workflow, shelves, school store POS, inventory, and suppliers." },
  { icon: CalendarDays, title: "Events & Activities", copy: "Events, clubs, competitions, houses, tours, scoreboards, winners gallery, and alumni engagement." },
  { icon: MessageSquareText, title: "Communication", copy: "Announcements, email targeting, notice board, real-time chat, notifications, and broadcast workflows." },
  { icon: ShieldCheck, title: "Security & Reports", copy: "Role permissions, per-portal isolation, audit trail, dynamic reports, PDF and Excel exports." },
];

const aiFeatures = [
  "At-risk student detection using attendance, marks, and behaviour trends",
  "AI timetable generation with teacher availability and conflict resolution",
  "AI report-card remark drafting based on student performance data",
  "Cognitive analytics from six built-in brain games",
];

function CampusMSPage() {
  return (
    <main className="campusms-page">
      <section className="campusms-hero">
        <div className="campusms-hero__grid">
          <div className="campusms-hero__copy">
            <span className="campusms-eyebrow">
              <Sparkles size={16} />
              Enterprise-grade campus operations
            </span>
            <h1>Campus Smart Management System</h1>
            <p>
              A cloud-ready administration platform that unifies academics, finance,
              hostel, transport, HR, communication, AI analytics, and multi-portal
              access for schools, colleges, and universities.
            </p>
            <div className="campusms-hero__actions">
              <Link href="/#enquiry" className="campusms-button campusms-button--primary">
                Book Live Demo
                <ArrowRight size={18} />
              </Link>
              <Link href="/#contact" className="campusms-button campusms-button--ghost">
                Talk to Team
              </Link>
            </div>
          </div>

          <div className="campusms-console" aria-label="CampusMS product interface preview">
            <div className="campusms-console__topbar">
              <span />
              <span />
              <span />
            </div>
            <div className="campusms-console__body">
              <div className="campusms-console__sidebar">
                <span className="is-active" />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="campusms-console__screen">
                <div className="campusms-console__header">
                  <div>
                    <strong>Campus Command Centre</strong>
                    <small>Live academic operations</small>
                  </div>
                  <span>99%</span>
                </div>
                <div className="campusms-console__stats">
                  <article>
                    <strong>1,842</strong>
                    <span>Students</span>
                  </article>
                  <article>
                    <strong>96.4%</strong>
                    <span>Attendance</span>
                  </article>
                  <article>
                    <strong>42</strong>
                    <span>Pending fees</span>
                  </article>
                </div>
                <div className="campusms-console__chart">
                  <span style={{ height: "44%" }} />
                  <span style={{ height: "62%" }} />
                  <span style={{ height: "38%" }} />
                  <span style={{ height: "78%" }} />
                  <span style={{ height: "56%" }} />
                  <span style={{ height: "88%" }} />
                </div>
                <div className="campusms-console__feed">
                  <span>AI timetable draft ready</span>
                  <span>3 leave requests awaiting approval</span>
                  <span>Transport route KZ-04 active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="campusms-metrics">
          {metrics.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="campusms-product-shot">
        <div className="campusms-product-shot__copy">
          <span className="campusms-section-kicker">Validated coverage</span>
          <h2>Nearly every school workflow in one secure system.</h2>
          <p>
            CampusMS has been shaped with expert feedback and built to cover the
            essential operational modules institutions need today, with updates,
            upgrades, additions, and customizations handled for long-term use.
          </p>
        </div>
        <div className="campusms-product-shot__image">
          <Image
            src="/assets/CMS-preview.jpeg"
            alt="Campus Management System interface preview"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="campusms-section">
        <div className="campusms-section__heading">
          <span className="campusms-section-kicker">Four role-specific portals</span>
          <h2>Every stakeholder gets the right dashboard, permissions, and workflows.</h2>
        </div>
        <div className="campusms-portals">
          {portals.map((portal, index) => (
            <article key={portal.name} style={{ "--delay": `${index * 90}ms` }}>
              <span>{portal.count}</span>
              <h3>{portal.name}</h3>
              <p>{portal.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="campusms-section campusms-section--warm">
        <div className="campusms-section__heading">
          <span className="campusms-section-kicker">50+ feature modules</span>
          <h2>Built for daily administration, not just record keeping.</h2>
        </div>
        <div className="campusms-module-grid">
          {modules.map(({ icon: Icon, title, copy }) => (
            <article key={title}>
              <div className="campusms-module-grid__icon">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="campusms-ai">
        <div className="campusms-ai__visual">
          <div className="campusms-ai__orb">
            <Bot size={54} />
          </div>
          <div className="campusms-ai__pulse campusms-ai__pulse--one" />
          <div className="campusms-ai__pulse campusms-ai__pulse--two" />
          <div className="campusms-ai__chip campusms-ai__chip--top">
            <BarChart3 size={16} />
            Early intervention
          </div>
          <div className="campusms-ai__chip campusms-ai__chip--bottom">
            <Bell size={16} />
            Smart alerts
          </div>
        </div>
        <div className="campusms-ai__copy">
          <span className="campusms-section-kicker">AI Brain Module</span>
          <h2>Intelligence that helps teams act earlier and work faster.</h2>
          <p>
            The AI layer brings practical automation into everyday school
            administration, helping administrators and teachers identify risk,
            reduce scheduling effort, and create better student communication.
          </p>
          <ul>
            {aiFeatures.map((feature) => (
              <li key={feature}>
                <CheckCircle2 size={18} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="campusms-trust">
        <article>
          <LockKeyhole size={24} />
          <h3>Enterprise security architecture</h3>
          <p>
            JWT authentication, automatic token refresh, role-based permissions,
            per-portal isolation, class-teacher privileges, and complete audit trails.
          </p>
        </article>
        <article>
          <Moon size={24} />
          <h3>Accessible user experience</h3>
          <p>
            Full light and dark mode support with six selectable colour themes across
            every portal, applied instantly with a consistent interface.
          </p>
        </article>
      </section>

      <section className="campusms-cta">
        <div>
          <span className="campusms-section-kicker">Ready for transformation</span>
          <h2>Give your institution one reliable operating system.</h2>
          <p>
            CampusMS is production-ready, scalable, and designed to grow with
            your institution across academic years, departments, and campuses.
          </p>
        </div>
        <Link href="/#enquiry" className="campusms-button campusms-button--primary">
          Request Demo
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

export default CampusMSPage;
