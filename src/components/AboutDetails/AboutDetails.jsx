import React, { useEffect, useState } from "react";
import "./AboutDetails.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

function AboutDetails() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      AOS.init({ duration: 1000, once: true });
    }, 100);
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const docRef = doc(db, "aboutdetails", "uRdguVMJCFd0lQwY6FH2");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setContent(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchContent();
  }, []);

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <div className="about-details">
      <div className="about-section" data-aos="fade-up" data-aos-delay="0">
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
            <li key={index}> {item}</li>
          ))}
        </ul>
      </div>

      <div className="about-section team-section" data-aos="fade-up" data-aos-delay="400">
        <h2>Meet the Team</h2>
        {/* <img src={content.MeetTheTeam.imageUrl} alt="Adstra Digital Team" className="team-image" /> */}
        <p>{content.MeettheTeam}</p>
      </div>

      <div className="about-section contact-cta" data-aos="fade-up" data-aos-delay="500">
        <h2>Ready to Grow?</h2>
        <p>{content.ReadytoGrow}</p>
        <a href="/#contact">
          <button className="learn-btn" aria-label="Contact Adstra Digital">
            Contact Us
          </button>
        </a>
      </div>
    </div>
  );
}

export default AboutDetails;
