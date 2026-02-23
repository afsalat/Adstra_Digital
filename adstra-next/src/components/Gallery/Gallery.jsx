"use client";

import React, { useState } from "react";
import Image from "next/image";
import "./Gallery.css";

import Logo from "../../assets/logo-v-white.png";
import team_l_3 from "../../assets/team/client1.jpeg";

const images = [
    {
        src: null,
        title: "Concept Art",
        desc: "Visual storytelling through illustration.",
    },
    {
        src: null,
        title: "3D Animation",
        desc: "Dynamic animations for all industries.",
    },
    {
        src: null,
        title: "Product Modeling",
        desc: "Precision models for marketing.",
    },
    {
        src: null,
        title: "Character Design",
        desc: "Unique and stylized character concepts.",
    },
    {
        src: team_l_3,
        title: "Environment Art",
        desc: "Immersive 3D spaces and worlds.",
    },
    {
        src: null,
        title: "Simulation",
        desc: "Interactive real-time simulations.",
    },
    {
        src: null,
        title: "AR/VR Ready",
        desc: "Assets optimized for AR/VR use.",
    },
    {
        src: null,
        title: "Rendering",
        desc: "Photorealistic rendering output.",
    },
];

function Gallery() {
    const [popupData, setPopupData] = useState(null);

    const openPopup = (item) => setPopupData(item);
    const closePopup = () => setPopupData(null);

    return (
        <div id="gallery" className="gallery">
            {/* 🎥 Background video */}
            {/* <video autoPlay muted loop playsInline className="bg-video">
        <source
          src="https://adstradigital.com/media/video/adstra-golddest.mp4"
          type="video/mp4"
        />
      </video> */}

            {/* overlay */}
            <div className="gallery-overlay"></div>

            <h2 className="gallery-title">Gallery</h2>

            <div className="gallery-grid">
                {images.map((item, index) => (
                    <div
                        key={index}
                        className={`gallery-item item-${index + 1}`}
                        onClick={() => openPopup(item)}
                    >
                        {item.src && <Image src={item.src} alt={item.title} />}
                        <div className="image-overlay">
                            <h4>{item.title}</h4>
                            <p>{item.desc}</p>
                        </div>
                    </div>
                ))}

                <div className="center-branding">
                    <Image src={Logo} alt="Adstra Logo" className="brand-logo" />
                </div>
            </div>

            {/* Popup */}
            {popupData && (
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closePopup}>
                            ×
                        </button>
                        <div className="popup-body">
                            <div className="popup-left">
                                {popupData.src && <Image src={popupData.src} alt={popupData.title} />}
                            </div>
                            <div className="popup-right">
                                <h3>{popupData.title}</h3>
                                <p>{popupData.desc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Gallery;
