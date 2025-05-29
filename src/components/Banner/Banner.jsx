import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Banner.css";
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
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  const messages = [
    "Elevate Your Brand with Next-Level Digital Marketing!",
    "Strategy. Creativity. Growth. We Turn Clicks into Conversions!",
    "SEO | PPC | Social Media | Content | Analytics | Branding.",
    "Let's Build Your Digital Success Together!",
    "Transform Your Digital Presence. Dominate the Market!",
    "Innovative Strategies | Global Reach | Guaranteed Results",
    "Unleash the Power of Digital. Stand Out. Win More",
    "Digital Excellence Starts Here—Grow, Engage, Dominate!",
    "Data-Driven Strategies | High-Impact Marketing | Measurable Success",
    "Elevate Your Brand. Expand Your Reach. Maximize Your ROI",
    "Your Digital Future Starts Now—Let's Create Something Extraordinary!",
  ];

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
    const currentMessage = messages[currentMessageIndex];

    if (charIndex < currentMessage.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 50); // character typing speed
      return () => clearTimeout(timeout);
    } else {
      // Wait before moving to the next message
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setDisplayedText("");
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2500); // how long the full message stays before next
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentMessageIndex]);

  return (
    <div className="banner">
      <div className="banner-inside">
        {/* Left Side - Typing Message */}
        <div className="banner-left" data-aos="fade-up">
          <div className="banner-text-wrapper">
            <p className="banner-title typing">{displayedText}</p>
            <a href="#enquiry"><button className="enquiry-button1">Enquiry</button></a>
          </div>
        </div>

        {/* Right Side - Image Grid */}
        <div className="banner-right">
          <div className="image-grid">
            {Object.keys(imageData).map((rowKey, rowIndex) => (
              <div
                key={rowIndex}
                className={`image-row ${
                  rowKey === "row3" || rowKey === "row5" ? "row-small" : "row-large"
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
