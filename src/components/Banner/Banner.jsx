import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Banner.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Context/firebaseConfig";

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
      "https://adstradigital.com/media/landing_imgs/b4.jpeg",    ],
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
        } else {
          console.log("No banner document found.");
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
    <div className="banner">
      <div className="banner-inside">
        <div className="banner-left">
          <div className="banner-text-container">
            {loadingMessages ? (
              <p className="banner-title">
                Transform Your Digital Presence. Dominate the Market!
              </p>
            ) : (
              <p className="banner-title zoom-animation">
                {messages[currentMessageIndex]}
              </p>
            )}
            <a href="#enquiry">
              <button className="enquiry-button1">Enquiry</button>
            </a>
          </div>
        </div>

        <div className="banner-right">
          <div className="image-grid">
            {Object.keys(imageData).map((rowKey, rowIndex) => (
              <div
                key={rowIndex}
                className={`image-row ${
                  rowKey === "row3" || rowKey === "row5"
                    ? "row-small"
                    : "row-large"
                }`}
                data-aos={rowIndex % 2 === 0 ? "fade-left" : "fade-right"}
              >
                {imageData[rowKey].map((src, idx) => (
                  <img key={idx} src={src} alt={`${rowKey}-${idx}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
