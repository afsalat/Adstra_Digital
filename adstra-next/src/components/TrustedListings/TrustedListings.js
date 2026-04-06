import React from "react";
import "./TrustedListings.css";

const interleaveItems = (primary, secondary) => {
  const mixed = [];
  const maxLength = Math.max(primary.length, secondary.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (secondary[index]) {
      mixed.push(secondary[index]);
    }

    if (primary[index]) {
      mixed.push(primary[index]);
    }
  }

  return mixed;
};

const RecognitionSection = () => {
  const featuredListings = [
    {
      name: "BlogAdda",
      img: "https://www.blogadda.com/images/blogadda.png",
      link: "https://www.blogadda.com",
    },
    {
      name: "DesignRush",
      img: "/assets/Top_Digital_Marketing.png",
      link: "https://www.designrush.com/",
    },
    {
      name: "GoodFirms",
      img: "/assets/GF-Blue-1.png",
      link: "https://www.goodfirms.co/",
    },
    {
      name: "Ztrategize",
      img: "/assets/ztrategize-logo.jpeg",
      link: "https://ztrategize.com/",
    },
    {
      name: "iTRate",
      img: "https://itrate.co/storage/mediakit/5-original.png?t=1651643718",
      link: "https://itrate.co/digital-marketing-agencies/all",
    },
  ];

  const clientCompanies = [
    {
      name: "Aartees",
      img: "/assets/client-logos/aartees-logo.png",
      link: "#",
    },
    {
      name: "AdInvoice",
      img: "/assets/client-logos/adinvoicelogo.jpg",
      link: "#",
    },
    {
      name: "Adlotech",
      img: "/assets/client-logos/ADLOTECH logo.png",
      link: "#",
    },
    {
      name: "Agni Jewels",
      img: "/assets/client-logos/agni.jpeg",
      link: "#",
    },
    {
      name: "Al Shefey",
      img: "/assets/client-logos/alshefey.png",
      link: "#",
    },
    {
      name: "Blaze Education",
      img: "/assets/client-logos/blaze_logo_transparent.png",
      link: "#",
    },
    {
      name: "Imprime",
      img: "/assets/client-logos/imprime.png",
      link: "#",
    },
    {
      name: "Lioraa London",
      img: "/assets/client-logos/LIORAA LONDON.png",
      link: "#",
    },
    {
      name: "Premier CRM",
      img: "/assets/client-logos/premier.png",
      link: "#",
    },
    {
      name: "Quick Kerala",
      img: "/assets/client-logos/quikerala_logo.png",
      link: "#",
    },
    {
      name: "Rushikesh Tourism",
      img: "/assets/client-logos/rushikesh-LOGO.png",
      link: "#",
    },
    {
      name: "Tasteio",
      img: "/assets/client-logos/tasteio-logo.png",
      link: "#",
    },
    {
      name: "VB Foods",
      img: "/assets/client-logos/vb-logo.png",
      link: "#",
    },
  ];

  const recognitions = interleaveItems(featuredListings, clientCompanies);
  const splitIndex = Math.ceil(recognitions.length / 2);
  const firstRow = recognitions.slice(0, splitIndex);
  const secondRow = recognitions.slice(splitIndex);
  const firstRowItems = [...firstRow, ...firstRow];
  const secondRowItems = [...secondRow, ...secondRow];

  return (
    <section className="recognition-section" aria-label="Trusted brand listings">
      <div className="recognition-container">
        <div className="recognition-heading">
          <h2 className="recognition-kicker">
            <span className="recognition-kicker__text">Featured on</span>
            <span className="recognition-kicker__accent">many TrustedListings</span>
            <span className="recognition-kicker__text">and trusted by</span>
            <span className="recognition-kicker__accent">many client companies</span>
          </h2>
        </div>

        <div className="recognition-marquee">
          <div className="recognition-track">
            {firstRowItems.map((rec, index) => (
              <a
                key={`marquee-top-${rec.name}-${index}`}
                className="recognition-card"
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
                    loading="lazy"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="recognition-marquee recognition-marquee--reverse">
          <div className="recognition-track recognition-track--reverse">
            {secondRowItems.map((rec, index) => (
              <a
                key={`marquee-bottom-${rec.name}-${index}`}
                className="recognition-card"
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
                    loading="lazy"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecognitionSection;
