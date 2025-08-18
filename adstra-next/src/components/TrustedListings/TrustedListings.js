import React from "react";

const RecognitionSection = () => {
  const recognitions = [
    {
      name: "DesignRush",
      img: "assets/Top_Digital_Marketing.png",
      link: "https://www.designrush.com/",
      note: "Listed in the Top Digital Marketing Companies in India — DesignRush",
    },
    {
      name: "GoodFirm",
      img: "assets/GF-Blue-1.png",
      link: "https://www.goodfirms.co/",
      note: "Recognized among Top B2B Agencies — GoodFirms",
    },
    // Add more...
  ];

  return (
    <section className="py-5 bg-light">
      <div className="container text-center">
        <h2 className="fw-bold mb-3">Recognized by Industry Leaders</h2>
        <p className="text-muted mb-4">
          We’re proud to be featured on global platforms for our excellence in
          digital strategy and design.
        </p>

        {/* Horizontal Scroll */}
        <div
          className="d-flex overflow-auto pb-3"
          style={{ gap: "2rem", whiteSpace: "nowrap", justifyContent: "center"}}
        >
          {recognitions.map((rec, index) => (
            <div
              key={index}
              className="flex-shrink-0 text-center"
              style={{ width: "200px" }}
            >
              <a
                href={rec.link}
                target="_blank"
                rel="noopener noreferrer"
                className="d-block"
              >
                <div
                  className="bg-white shadow-sm rounded d-flex align-items-center justify-content-center"
                  style={{ width: "100%", height: "120px" }}
                >
                  <img
                    src={rec.img}
                    alt={rec.name}
                    className="img-fluid"
                    style={{
                      maxHeight: "80px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecognitionSection;
