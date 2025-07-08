import React, { useEffect, useState } from "react";
import "./AboutDetails.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

function AboutDetails() {
  const [content, setContent] = useState(null);
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate("/", { state: { scrollToContact: true } });
  };

  // AOS animation init
  useEffect(() => {
    setTimeout(() => {
      AOS.init({ duration: 500, once: true });
    }, 100);
  }, []);

  // Fetch content from Firebase
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

  // Fallback for meta + canonical updates
  useEffect(() => {
    document.title = "About Us | Adstra Digital";

    const metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Learn more about Adstra Digital – our mission, values, and team behind our digital success."
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Learn more about Adstra Digital – our mission, values, and team behind our digital success.";
      document.head.appendChild(meta);
    }

    const canonical = document.querySelector("link[rel='canonical']");
    if (canonical) {
      canonical.setAttribute("href", "https://adstradigital.com/about");
    } else {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", "https://adstradigital.com/about");
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="about-details">
      {/* Helmet for SEO */}
      <Helmet>
        <title key="title">About Us | Adstra Digital</title>
        <meta
          key="description"
          name="description"
          content="Learn more about Adstra Digital – our mission, values, and team behind our digital success."
        />
        <link
          key="canonical"
          rel="canonical"
          href="https://www.adstradigital.com/about"
        />
      </Helmet>

      {!content ? (
        <div>Loading...</div>
      ) : (
        <>
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
