"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/Context/firebaseConfig";
import AOS from "aos";
import "aos/dist/aos.css";
import "./About.css";
import banner from "@/assets/banner_img.jpeg";
import { useRouter } from "next/navigation";

function About() {
  const [aboutData, setAboutData] = useState([]);
  const [showOfferPopup, setShowOfferPopup] = useState(true);
  const router = useRouter();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchData();

    // Show popup every 20 seconds
    const popupInterval = setInterval(() => {
      setShowOfferPopup(true);
    }, 100000);

    return () => clearInterval(popupInterval);
  }, []);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "about"));
      const items = querySnapshot.docs.map((doc) => doc.data());
      setAboutData(items);
    } catch (error) {
      console.error("Error fetching about data:", error);
    }
  };

  const handleNavigate = () => {
    router.push("/about/");
  };

  return (
    <>
      {/* Offer Popup Modal */}
      {showOfferPopup && (
        <div className="offer-popup-overlay" onClick={() => setShowOfferPopup(false)}>
          <div className="offer-popup-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="offer-popup-close"
              onClick={() => setShowOfferPopup(false)}
              aria-label="Close popup"
            >
              ✕
            </button>
            <img
              src="/assets/free_seo.png"
              alt="Free SEO Offer"
              className="offer-popup-image"
            />
          </div>
        </div>
      )}

      {/* Static Banner Image */}
      <div className="row" style={{ backgroundColor: "black" }}>
        <div className="col-12 text-center">
          <img
            src={banner.src}
            alt="Main Banner"
            className="img-fluid rounded"
            style={{
              maxHeight: "550px",
              objectFit: "cover",
              width: "97%",
              marginTop: "50px",
            }}
          />
        </div>
      </div>
      <div id="about" className="container-fluid about-section" style={{ backgroundColor: "black" }}>
        <div className="row align-items-center">
          <div
            className="col-md-6 mb-4 text-center video-container"
            data-aos="fade-up"
          >
            {/* 🎥 Replace with your preferred video */}
            <video
              className="about-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source
                src="https://adstradigital.com/media/video/adstra-logo-intro.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="col-md-6 text-start about-text" data-aos="fade-up">
            <h2 className="fw-bold mb-3">About Adstra Digital</h2>
            {aboutData.length > 0 ? (
              aboutData.map((data, index) => (
                <div key={index}>
                  <p>{data.intro}</p>
                  <p>{data.servicesIntro}</p>
                  <p>{data.difference}</p>
                  <p>{data.commitment}</p>
                </div>
              ))
            ) : (
              <p>Loading content...</p>
            )}
            <button
              onClick={handleNavigate}
              className="btn btn-warning mt-3 px-4 py-2"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
