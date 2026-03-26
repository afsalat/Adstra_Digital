import React from "react";
import "./TrustedListings.css";

const RecognitionSection = () => {
  const recognitions = [
    {
      name: "BlogAdda",
      img: "https://www.blogadda.com/images/blogadda.png",
      link: "https://www.blogadda.com",
      note: "Proud to be a part of BlogAdda community",
      external: true,
      width: 120,
      height: 24,
    },
    {
      name: "DesignRush",
      img: "assets/Top_Digital_Marketing.png",
      link: "https://www.designrush.com/",
      note: "Listed in the Top Digital Marketing Companies in India — DesignRush",
      external: true,
    },
    {
      name: "GoodFirm",
      img: "assets/GF-Blue-1.png",
      link: "https://www.goodfirms.co/",
      note: "Recognized among Top B2B Agencies — GoodFirms",
      external: true,
    },
    {
      name: "Ztrategize",
      img: "assets/ztrategize-logo.jpeg",
      link: "https://ztrategize.com/",
      note: "Proud to Be Listed Among India’s Best Digital Marketing Agencies by Ztrategize",
      external: true,
    },
    {
      name: "iTRate",
      img: "https://itrate.co/storage/mediakit/5-original.png?t=1651643718",
      link: "https://itrate.co/digital-marketing-agencies/all",
      note: "Recognized by iTRate as a Top Digital Marketing Agency",
      external: true,
      width: 200,
    },
  ];

  return (
    <section className="recognition-section">
      <div className="recognition-container">
        <h2 className="recognition-title">Recognized by Industry Leaders</h2>
        <p className="recognition-subtitle">
          We’re proud to be featured on global platforms for our excellence in
          digital strategy and design.
        </p>

        <div className="recognition-marquee">
          <div className="recognition-track">
            {[...recognitions].map((rec, index) => (
              <div key={index} className="recognition-card">
                <a
                  href={rec.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={rec.name}
                  aria-label={rec.name}
                >
                  <div className="recognition-logo">
                    <img
                      src={rec.img}
                      alt={rec.name}
                      width={rec.width || undefined}
                      height={rec.height || undefined}
                      loading="lazy"
                    />
                  </div>
                </a>
                {rec.note && <div className="recognition-note">{rec.note}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecognitionSection;
