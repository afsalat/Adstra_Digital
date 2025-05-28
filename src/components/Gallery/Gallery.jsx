import React from "react";
import "./Gallery.css";
import Logo from "../../assets/logo/Logo-01.jpg"

const images = [
  {
    src: "/images/gallery1.jpg",
    title: "Concept Art",
    desc: "Visual storytelling through illustration.",
  },
  {
    src: "/images/gallery2.jpg",
    title: "3D Animation",
    desc: "Dynamic animations for all industries.",
  },
  {
    src: "/images/gallery3.jpg",
    title: "Product Modeling",
    desc: "Precision models for marketing.",
  },
  {
    src: "/images/gallery4.jpg",
    title: "Character Design",
    desc: "Unique and stylized character concepts.",
  },
  {
    src: "/images/gallery5.jpg",
    title: "Environment Art",
    desc: "Immersive 3D spaces and worlds.",
  },
  {
    src: "/images/gallery6.jpg",
    title: "Simulation",
    desc: "Interactive real-time simulations.",
  },
  {
    src: "/images/gallery7.jpg",
    title: "AR/VR Ready",
    desc: "Assets optimized for AR/VR use.",
  },
  {
    src: "/images/gallery8.jpg",
    title: "Rendering",
    desc: "Photorealistic rendering output.",
  },
];

function Gallery() {
  return (
    <div className="gallery">
      <h2 className="gallery-title">Gallery</h2>
      <div className="gallery-grid">
        {images.map((item, index) => (
          <div key={index} className={`gallery-item item-${index + 1}`}>
            <img src={item.src} alt={item.title} />
            <div className="image-overlay">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}

        <div className="center-branding">
          <img src={Logo} alt="Adstra Logo" className="brand-logo" />
        </div>
      </div>
    </div>
  );
}

export default Gallery;
