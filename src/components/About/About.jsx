import React, { useEffect } from "react";
import "./About.css";
import AOS from "aos";
import "aos/dist/aos.css";
import About_image from "../../assets/aboutimage.png";

function About() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div id="about" className="about">
      <div className="about-right" data-aos="fade-up">
        <img src={About_image} alt="About us" />
      </div>
      <div className="about-left" data-aos="fade-up">
        <h2>About Adstra Digital</h2>
        <p>
          At <strong>Adstra Digital</strong>, we specialize in helping businesses grow in the fast-paced digital age. 
          As a full-service digital marketing agency, we combine strategy, creativity, and data to deliver 
          measurable results that matter.
        </p>
        <p>
          Whether you're a startup or an established brand, our team of experts offers customized solutions across:
          <ul>
            <li>✔️ Search Engine Optimization (SEO)</li>
            <li>✔️ Pay-Per-Click Advertising (PPC)</li>
            <li>✔️ Social Media Management & Ads</li>
            <li>✔️ Branding & Design</li>
            <li>✔️ Content Creation & Copywriting</li>
            <li>✔️ Data Analytics & Growth Strategy</li>
            <li>✔️ Video Production & Professional Photoshoots</li>
          </ul>
        </p>
        <p>
          What sets us apart is our commitment to transparency, innovation, and ROI-focused marketing. 
          Our creative and analytical approach ensures your brand doesn't just get seen—it gets results.
        </p>
        <p>
          With Adstra Digital, you're not just hiring a marketing team—you're partnering with people who genuinely 
          care about your growth.
        </p>
        <button className="learn-btn">Learn More</button>
      </div>
    </div>
  );
}

export default About;
