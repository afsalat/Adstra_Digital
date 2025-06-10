import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Banner.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Context/firebaseConfig";
import img1 from "../../assets/banner-images/branding-innovation-creative-inspire-concept.jpg";
import img2 from "../../assets/banner-images/business-concept-with-graphic-holography_23-2149160929.webp";
import img3 from "../../assets/banner-images/business-data-presentation.jpg";
import img4 from "../../assets/banner-images/businessman-man-hand-hold-interface-question-marks-sign-web_150455-5796.jpg";
import img5 from "../../assets/banner-images/business-statistics_53876-167065.jpg";
import img6 from "../../assets/banner-images/business-success-report-graph-concept.jpg";
import img7 from "../../assets/banner-images/question-mark-icon-solving-problem-solution-concept_53876-13887.webp";
import img8 from "../../assets/banner-images/cropped-photo-serious-young-man-sitting-office-coworking.jpg";
import img9 from "../../assets/banner-images/data-analytics-tablet.jpg";
import img10 from "../../assets/banner-images/dynamic-data-visualization-3d_23-2151904311.webp";
import img11 from "../../assets/banner-images/logo-designer-working-computer-desktop_23-2149142144.webp";
import img12 from "../../assets/banner-images/magnet-attracts-magnetises-certain-people-candidates-blocks-hiring-highly-qualified-staff_72572-2597.jpg";
import img13 from "../../assets/banner-images/man-filming-with-professional-camera-1.jpg";
import img14 from "../../assets/banner-images/man-filming-with-professional-camera.jpg";
import img15 from "../../assets/banner-images/man-woman-looking-photos.jpg";
import img16 from "../../assets/banner-images/message-online-chat-social-text-concept_53876-167132.webp";
import img17 from "../../assets/banner-images/notepad-laptop-concept.jpg";
import img18 from "../../assets/banner-images/photography-studio-with-equipment-items-arrangement.jpg";
import img19 from "../../assets/banner-images/senior-startup-businesswoman-holding-presentatin-conference-room-briefing-graph-information.jpg";
import img20 from "../../assets/banner-images/side-view-man-working-desk.jpg";
import img21 from "../../assets/banner-images/business-data-presentation.jpg";
import img22 from "../../assets/banner-images/data-analytics-tablet.jpg";
import img23 from "../../assets/banner-images/question-mark-icon-solving-problem-solution-concept_53876-13887.webp";

function Banner() {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const imageData = {
    row1: [img1, img2, img3],
    row2: [img4, img5, img6, img7],
    row3: [img8, img9, img10, img11, img12, img13],
    row4: [img14, img15, img16, img17],
    row5: [img18, img19, img20, img21, img22, img23],
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
              <p className="banner-description">Loading...</p>
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
