"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AOS from "aos";
import "aos/dist/aos.css";
import "./AboutDetails.css";

function AboutDetails() {
  const [content, setContent] = useState(null);
  const router = useRouter();

  const handleContactClick = () => {
    router.push("/?scrollToContact=true");
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
      {!content ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="about-section" data-aos="fade-up">
            <h2>About Us</h2>
            <p>{content.AboutAdstraDigital}</p>
          </div>

          <div className="about-section" data-aos="fade-up" data-aos-delay="100">
            <h2>How We Work</h2>
            <p>We keep things practical and straightforward:</p>
            <ul>
              {content.HowWeWork.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
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

          <div className="about-section" data-aos="fade-up" data-aos-delay="200">
            <h2>Training & Support</h2>
            <p>{content.TrainingSupport}</p>
          </div>

          <div className="about-section" data-aos="fade-up" data-aos-delay="200">
            <h2>Why Choose Us</h2>
            <p>{content.WhyChooseUs}</p>
          </div>

          <div className="about-section" data-aos="fade-up" data-aos-delay="200">
            <h2>Your Strategic Growth Partner</h2>
            <p>{content.YourStrategicGrowthPartner}</p>
          </div>

          <div className="about-section" data-aos="fade-up" data-aos-delay="200">
            <h2>Local Value, National Standards</h2>
            <p>{content.LocalValueNationalStandards}</p>
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
