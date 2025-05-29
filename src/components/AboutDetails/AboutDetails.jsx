import React, { useEffect } from "react";
import "./AboutDetails.css";
import AOS from "aos";
import "aos/dist/aos.css";

function AboutDetails() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="about-details">
      <div className="about-section" data-aos="fade-up">
        <h2>Who We Are</h2>
        <p>
          Adstra Digital is a performance-driven digital marketing agency committed to helping businesses grow,
          thrive, and lead in the digital landscape. Our diverse team of creatives, strategists, analysts, and tech experts work
          together to craft campaigns that make a real impact.
        </p>
      </div>

      <div className="about-section" data-aos="fade-up">
        <h2>What We Do</h2>
        <ul>
          <li><strong>Digital Strategy:</strong> We build data-backed roadmaps tailored to your goals.</li>
          <li><strong>SEO & PPC:</strong> Get discovered faster and drive high-quality traffic to your site.</li>
          <li><strong>Social Media:</strong> Engage, grow, and influence your target audience across all platforms.</li>
          <li><strong>Branding & Design:</strong> Logo, identity, and visuals that leave a lasting impression.</li>
          <li><strong>Content Creation:</strong> From blogs to videos, we tell stories that convert.</li>
          <li><strong>Analytics:</strong> Real-time insights to help optimize and scale your performance.</li>
        </ul>
      </div>

      <div className="about-section" data-aos="fade-up">
        <h2>Our Mission</h2>
        <p>
          To empower businesses with innovative, result-driven marketing strategies that combine creativity and technology.
        </p>
      </div>

      <div className="about-section" data-aos="fade-up">
        <h2>Why Adstra Digital?</h2>
        <ul>
          <li>✅ Proven Track Record with Local & Global Clients</li>
          <li>✅ Dedicated Experts in Every Digital Domain</li>
          <li>✅ Transparent Reporting & ROI-Focused Campaigns</li>
          <li>✅ 100% Custom-Tailored Strategies</li>
        </ul>
      </div>

      <div className="about-section" data-aos="fade-up">
        <h2>Meet the Team</h2>
        <img src="" alt="Adstra Digital Team" className="team-image" />
        <p>
          Behind every great campaign is a passionate team. At Adstra Digital, we believe collaboration is the key to creativity. 
          We’re a mix of marketers, designers, developers, and storytellers who care about your success.
        </p>
      </div>

      <div className="about-section contact-cta" data-aos="fade-up">
        <h2>Ready to Grow?</h2>
        <p>
          Let’s talk! We’d love to understand your business and show you how we can help.
        </p>
        <a href="#contact">
          <button className="learn-btn">Contact Us</button>
        </a>
      </div>
    </div>
  );
}

export default AboutDetails;
