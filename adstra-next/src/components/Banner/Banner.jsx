"use client";

import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Banner.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/Context/firebaseConfig";
import banner from "@/assets/banner_new.png";

function Banner() {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const imageData = {
    row1: [
      "https://adstradigital.com/media/landing_imgs/a1.jpeg",
      "https://adstradigital.com/media/landing_imgs/a2.jpeg",
      "https://adstradigital.com/media/landing_imgs/a3.jpeg",
    ],
    row2: [
      "https://adstradigital.com/media/landing_imgs/b1.jpeg",
      "https://adstradigital.com/media/landing_imgs/b2.jpeg",
      "https://adstradigital.com/media/landing_imgs/b3.jpeg",
      "https://adstradigital.com/media/landing_imgs/b4.jpeg",
    ],
    row3: [
      "https://adstradigital.com/media/landing_imgs/c1.jpeg",
      "https://adstradigital.com/media/landing_imgs/c2.jpeg",
      "https://adstradigital.com/media/landing_imgs/c3.jpeg",
      "https://adstradigital.com/media/landing_imgs/c4.jpeg",
      "https://adstradigital.com/media/landing_imgs/c5.jpeg",
    ],
    row4: [
      "https://adstradigital.com/media/landing_imgs/d1.jpeg",
      "https://adstradigital.com/media/landing_imgs/d2.jpeg",
      "https://adstradigital.com/media/landing_imgs/d3.jpeg",
      "https://adstradigital.com/media/landing_imgs/d4.jpeg",
    ],
    row5: [
      "https://adstradigital.com/media/landing_imgs/e1.jpeg",
      "https://adstradigital.com/media/landing_imgs/e2.jpeg",
      "https://adstradigital.com/media/landing_imgs/e3.jpeg",
      "https://adstradigital.com/media/landing_imgs/e4.jpeg",
      "https://adstradigital.com/media/landing_imgs/e5.jpeg",
    ],
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const docRef = doc(db, "banner", "p8jjjOYuVjsDuT2SyCTY");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedMessages = Array.isArray(data.header)
            ? data.header
            : [data.header];
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error("Error fetching banner header:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [messages]);

  return (
      <div className="banner py-4 pb-6">
        <div className="container">
          <div className="row align-items-start flex-wrap-reverse">
            {/* Left */}
            <div className="col-lg-6 col-md-12 banner-left pt-5 text-center text-lg-start">
              <div className="banner-text-container d-flex flex-column gap-5">
                <h1 className="banner-title zoom-animation">
                  {loadingMessages
                    ? "Transform Your Digital Presence. Dominate the Market!"
                    : messages[currentMessageIndex]}
                </h1>
                <a href="#enquiry">
                  <button className="enquiry-button1">Enquiry</button>
                </a>
              </div>
            </div>

            {/* Right */}
            <div className="col-lg-6 col-md-12 banner-right">
              <div className="image-grid d-flex flex-column gap-2">
                {Object.keys(imageData).map((rowKey, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={`image-row d-flex gap-2 overflow-auto ${
                      rowKey === "row3" || rowKey === "row5"
                        ? "row-small"
                        : "row-large"
                    }`}
                    data-aos={rowIndex % 2 === 0 ? "fade-left" : "fade-right"}
                    data-aos-duration={1000 + rowIndex * 200}
                  >
                    {imageData[rowKey].map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        loading="lazy"
                        alt={`Banner image ${rowKey} ${idx + 1}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Static Banner Image */}
        <div className="row mt-4">
          <div className="col-12 text-center">
            <img
              src={banner.src}
              alt="Main Banner"
              className="img-fluid rounded"
              style={{
                maxHeight: "550px",
                objectFit: "cover",
                width: "97%",
                marginTop: "180px",
              }}
            />
          </div>
        </div>
      </div>
  );
}

export default Banner;
