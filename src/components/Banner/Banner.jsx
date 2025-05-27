import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // AOS styles
import "./Banner.css";

// Row 1 Images
import img1 from "../../assets/banner-images/branding-innovation-creative-inspire-concept.jpg";
import img2 from "../../assets/banner-images/business-concept-with-graphic-holography_23-2149160929.webp";
import img3 from "../../assets/banner-images/business-data-presentation.jpg";

// Row 2 Images
import img4 from "../../assets/banner-images/businessman-man-hand-hold-interface-question-marks-sign-web_150455-5796.jpg";
import img5 from "../../assets/banner-images/business-statistics_53876-167065.jpg";
import img6 from "../../assets/banner-images/business-success-report-graph-concept.jpg";
import img7 from "../../assets/banner-images/question-mark-icon-solving-problem-solution-concept_53876-13887.webp";

// Row 3 Images
import img8 from "../../assets/banner-images/cropped-photo-serious-young-man-sitting-office-coworking.jpg";
import img9 from "../../assets/banner-images/data-analytics-tablet.jpg";
import img10 from "../../assets/banner-images/dynamic-data-visualization-3d_23-2151904311.webp";
import img11 from "../../assets/banner-images/logo-designer-working-computer-desktop_23-2149142144.webp";
import img12 from "../../assets/banner-images/magnet-attracts-magnetises-certain-people-candidates-blocks-hiring-highly-qualified-staff_72572-2597.jpg";
import img13 from "../../assets/banner-images/man-filming-with-professional-camera-1.jpg";

// Row 4 Images
import img14 from "../../assets/banner-images/man-filming-with-professional-camera.jpg";
import img15 from "../../assets/banner-images/man-woman-looking-photos.jpg";
import img16 from "../../assets/banner-images/message-online-chat-social-text-concept_53876-167132.webp";
import img17 from "../../assets/banner-images/notepad-laptop-concept.jpg";

// Row 5 Images
import img18 from "../../assets/banner-images/photography-studio-with-equipment-items-arrangement.jpg";
import img19 from "../../assets/banner-images/senior-startup-businesswoman-holding-presentatin-conference-room-briefing-graph-information.jpg";
import img20 from "../../assets/banner-images/side-view-man-working-desk.jpg";
import img21 from "../../assets/banner-images/business-data-presentation.jpg";
import img22 from "../../assets/banner-images/data-analytics-tablet.jpg";
import img23 from "../../assets/banner-images/question-mark-icon-solving-problem-solution-concept_53876-13887.webp";

function Banner() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const imageData = {
    row1: [img1, img2, img3],
    row2: [img4, img5, img6, img7],
    row3: [img8, img9, img10, img11, img12, img13],
    row4: [img14, img15, img16, img17],
    row5: [img18, img19, img20, img21, img22, img23],
  };

  const contentSections = [
    {
      title: "ADSTRA DIGITAL – GROWING BUSINESSES IN THE DIGITAL AGE",
      description: `A Complete Suite of Digital Marketing Solutions to Help You Grow.

At Adstra Digital, we don't just advertise brands—we create memorable experiences and help you achieve real results.

Our team is made up of creative thinkers and strategists who are dedicated to helping businesses succeed in the busy online world.

By mixing the latest tech with data insights and creativity, we turn ideas into smart marketing plans that actually work.`,
    },
    {
      title: "VIDEO PRODUCTION ; PHOTOSHOOTS",
      description: `Your brand deserves attention and to be unforgettable.

• High-quality commercials and corporate videos
• Creative photos that capture your brand’s essence
• Product photography with a stylish twist
• Engaging social media reels and ads

Impact: Videos can boost customer conversion rates by 80% compared to static content!`,
    },
    {
      title: "DATA-DRIVEN CAMPAIGNS ; PERFORMANCE MARKETING",
      description: `Every click, view, and interaction is adjusted for maximum results.

• SEO and PPC to improve ranking and speed up conversions
• Social media marketing for engagement and brand visibility
• Smart ad targeting to reach more people
• Collaborations with influencers for viral growth

Impact: Well-targeted campaigns can increase sales by up to 60%!`,
    },
    {
      title: "BRANDING; DESIGN – CREATIVITY WITH A PURPOSE",
      description: `First impressions matter. We make sure yours stands out.

• Custom brand identity and logo designs
• Eye-catching graphics for social media
• Web and app designs that attract and convert
• Motion graphics and beautiful animations

Impact: 94% of first impressions by consumers are based on design!`,
    },
    {
      title: "CONTENT CREATION ; COPYWRITING – WORDS THAT WORK",
      description: `Your brand voice should be clear and engaging.

• SEO-friendly blogs and website content to drive traffic
• Engaging social media posts and storytelling
• Persuasive ad copy that boosts conversions
• Email marketing campaigns that keep customers coming back

Impact: Quality content can increase audience retention by 72%!`,
    },
    {
      title: "ADVANCED ANALYTICS ; GROWTH STRATEGIES",
      description: `Your business should rely on data, not guesswork.

• Real-time tracking for optimization
• Strategies for improving conversion rates
• Insights into audience behavior for smarter marketing
• Automation tools to streamline the customer journey

Impact: Companies using analytics can see a 5X higher return!`,
    },
    {
      title: "WHY CHOOSE ADSTRA DIGITAL?",
      description: `• Proven Experience: Years of helping businesses succeed online
• Creative Team: Talented designers and strategists at your service
• Smart Tools: Marketing tools designed for efficiency
• Customized Plans: Strategies built for your specific goals
• Honesty and Trust: We deliver what we promise.`,
    },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const showNextSection = () => {
      setIsFading(true); // start fade out
      setTimeout(() => {
        setIsFading(false); // fade in next
        setCurrentSection((prev) => (prev + 1) % contentSections.length);
      }, 1000); // matches CSS fade duration
    };

    const interval = setInterval(showNextSection, 5000); // every 5s
    return () => clearInterval(interval);
  }, [contentSections.length]);

  return (
    <div className="banner">
      <div className="banner-inside">
        {/* Left Side */}
        <div className="banner-left" data-aos="fade-up">
          <div className={`banner-text-wrapper ${isFading ? "fade-out" : "fade-in"}`}>
            <h2 className="banner-title">{contentSections[currentSection].title}</h2>
            <p className="banner-description">
              {contentSections[currentSection].description.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            <button className="enquiry-button1">Enquiry</button>
          </div>
        </div>

        {/* Right Side Image Grid */}
        <div className="banner-right">
          <div className="image-grid" >
            {imageData.row1.length > 0 && (
              <div className="image-row row-large" data-aos="fade-left">
                {imageData.row1.map((src, index) => (
                  <img key={index} src={src} alt={`row1-${index}`} />
                ))}
              </div>
            )}
            {imageData.row2.length > 0 && (
              <div className="image-row row-large" data-aos="fade-right">
                {imageData.row2.map((src, index) => (
                  <img key={index} src={src} alt={`row2-${index}`} />
                ))}
              </div>
            )}
            {imageData.row3.length > 0 && (
              <div className="image-row row-small" data-aos="fade-left">
                {imageData.row3.map((src, index) => (
                  <img key={index} src={src} alt={`row3-${index}`} />
                ))}
              </div>
            )}
            {imageData.row4.length > 0 && (
              <div className="image-row row-large" data-aos="fade-right">
                {imageData.row4.map((src, index) => (
                  <img key={index} src={src} alt={`row4-${index}`} />
                ))}
              </div>
            )}
            {imageData.row5.length > 0 && (
              <div className="image-row row-small" data-aos="fade-left" >
                {imageData.row5.map((src, index) => (
                  <img key={index} src={src} alt={`row5-${index}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
