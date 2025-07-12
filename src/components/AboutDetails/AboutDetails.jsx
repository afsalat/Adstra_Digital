import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AOS from "aos";
import "aos/dist/aos.css";
import SEOHelmet from "../../services/SEOHelmet";
import "./AboutDetails.css";

function AboutDetails() {
  const [content, setContent] = useState(null);
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate("/", { state: { scrollToContact: true } });
  };

  useEffect(() => {
    AOS.init({ duration: 600 });
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const docRef = doc(db, "aboutdetails", "uRdguVMJCFd0lQwY6FH2");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setContent(docSnap.data());
    };
    fetchContent();
  }, []);

  return (
    <div className="about-details">
      <SEOHelmet
        title="AdstraDigital– Best Performance-Driven Digital Marketing Agency"
        description="Learn more about Adstra Digital – our mission, values, and team behind our digital success."
        canonical="https://adstradigital.com/about"
      />

      {!content ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="about-section" data-aos="fade-up">
            <h2>Who We Are</h2>
            <p>{content.whoWeAre}</p>
          </div>

          <div className="about-section" data-aos="fade-up" data-aos-delay="100">
            <h2>What We Do</h2>
            <ul>
              {content.WhatWeDo.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="about-section" data-aos="fade-up" data-aos-delay="200">
            <h2>Our Mission</h2>
            <p>{content.OurMission}</p>
          </div>

          <div className="about-section" data-aos="fade-up" data-aos-delay="300">
            <h2>Why Adstra Digital?</h2>
            <ul>
              {content.WhyAdstraDigital.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="about-section team-section" data-aos="fade-up" data-aos-delay="400">
            <h2>Meet the Team</h2>
            <p>{content.MeettheTeam}</p>
          </div>

          <div className="about-section contact-cta" data-aos="fade-up" data-aos-delay="500">
            <h2>Ready to Grow?</h2>
            <p>{content.ReadytoGrow}</p>
            <button className="learn-btn" onClick={handleContactClick}>
              Contact Us
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AboutDetails;
