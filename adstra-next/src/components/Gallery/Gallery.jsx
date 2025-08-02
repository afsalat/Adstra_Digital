'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import './Gallery.css';

import Logo from '../../assets/team/logo_gellery.png';
import team_l_1 from '../../assets/team/team-l-1.webp';
import team_r_1 from '../../assets/team/team-r-1.webp';
import team_r_2 from '../../assets/team/team_04.webp';
import team_l_3 from '../../assets/team/client1.jpeg';
import team_l_2 from '../../assets/team/team_05.webp';
import team_r_3 from '../../assets/team/team_06.webp';

const images = [
  {
    src: team_r_2,
    title: 'Concept Art',
    desc: 'Visual storytelling through illustration.',
  },
  {
    src: team_r_3,
    title: '3D Animation',
    desc: 'Dynamic animations for all industries.',
  },
  {
    src: team_r_1,
    title: 'Product Modeling',
    desc: 'Precision models for marketing.',
  },
  {
    src: team_l_1,
    title: 'Character Design',
    desc: 'Unique and stylized character concepts.',
  },
  {
    src: team_l_3,
    title: 'Environment Art',
    desc: 'Immersive 3D spaces and worlds.',
  },
  {
    src: team_r_3,
    title: 'Simulation',
    desc: 'Interactive real-time simulations.',
  },
  {
    src: team_l_1,
    title: 'AR/VR Ready',
    desc: 'Assets optimized for AR/VR use.',
  },
  {
    src: team_l_2,
    title: 'Rendering',
    desc: 'Photorealistic rendering output.',
  },
];

function Gallery() {
  const [popupData, setPopupData] = useState(null);

  const openPopup = (item) => setPopupData(item);
  const closePopup = () => setPopupData(null);

  return (
    <div id="gallery" className="gallery">
      <h2 className="gallery-title">Gallery</h2>

      <div className="gallery-grid">
        {images.map((item, index) => (
          <div
            key={index}
            className={`gallery-item item-${index + 1}`}
            onClick={() => openPopup(item)}
          >
            <Image src={item.src} alt={item.title} />
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

      {popupData && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closePopup}>
              ×
            </button>
            <Image src={popupData.src} alt={popupData.title} />
            <h3>{popupData.title}</h3>
            <p>{popupData.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
