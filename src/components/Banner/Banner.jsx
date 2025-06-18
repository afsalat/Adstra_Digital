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
      "https://adstradigital.com/media/landing_imgs/branding-innovation-creative-inspire-concept.jpg",
      "https://adstradigital.com/media/landing_imgs/business-concept-with-graphic-holography_23-2149160929.webp",
      "https://adstradigital.com/media/landing_imgs/business-data-presentation.jpg",
    ],
    row2: [
      "https://adstradigital.com/media/landing_imgs/businessman-man-hand-hold-interface-question-marks-sign-web_150455-5796.jpg",
      "https://adstradigital.com/media/landing_imgs/business-statistics_53876-167065.jpg",
      "https://adstradigital.com/media/landing_imgs/business-success-report-graph-concept.jpg",
      "https://adstradigital.com/media/landing_imgs/question-mark-icon-solving-problem-solution-concept_53876-13887.webp",
    ],
    row3: [
      "https://adstradigital.com/media/landing_imgs/cropped-photo-serious-young-man-sitting-office-coworking.jpg",
      "https://adstradigital.com/media/landing_imgs/data-analytics-tablet.jpg",
      "https://adstradigital.com/media/landing_imgs/dynamic-data-visualization-3d_23-2151904311.webp",
      "https://adstradigital.com/media/landing_imgs/logo-designer-working-computer-desktop_23-2149142144.webp",
      "https://adstradigital.com/media/landing_imgs/magnet-attracts-magnetises-certain-people-candidates-blocks-hiring-highly-qualified-staff_72572-2597.jpg",
      "https://adstradigital.com/media/landing_imgs/man-filming-with-professional-camera-1.jpg",
    ],
    row4: [
      "https://adstradigital.com/media/landing_imgs/man-filming-with-professional-camera.jpg",
      "https://adstradigital.com/media/landing_imgs/man-woman-looking-photos.jpg",
      "https://adstradigital.com/media/landing_imgs/message-online-chat-social-text-concept_53876-167132.webp",
      "https://adstradigital.com/media/landing_imgs/notepad-laptop-concept.jpg",
    ],
    row5: [
      "https://adstradigital.com/media/landing_imgs/photography-studio-with-equipment-items-arrangement.jpg",
      "https://adstradigital.com/media/landing_imgs/senior-startup-businesswoman-holding-presentatin-conference-room-briefing-graph-information.jpg",
      "https://adstradigital.com/media/landing_imgs/side-view-man-working-desk.jpg",
      "https://adstradigital.com/media/landing_imgs/business-data-presentation.jpg",
      "https://adstradigital.com/media/landing_imgs/data-analytics-tablet.jpg",
      "https://adstradigital.com/media/landing_imgs/question-mark-icon-solving-problem-solution-concept_53876-13887.webp",
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
