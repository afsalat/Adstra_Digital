"use client";

import React, { useState } from "react";
import Image from "next/image";
import "./WhatsappIcon.css";
import icon from "../../assets/logo/whtap1.png";


function WhatsAppFloatingButton({ phone = "9744779574", message }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = () => {
    const defaultMsg = message || "Hi, I’d like to know more about your services.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="whatsapp-float-wrapper"
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      {showPopup && (
        <div className="whatsapp-popup">Chat with us on WhatsApp!</div>
      )}
      <div className="whatsapp-float" onClick={handleClick}>
        <Image
          src={icon}
          alt="WhatsApp"
          className="whatsapp-icon"
          width={70}
          height={70}
        />
      </div>
    </div>
  );
}

export default WhatsAppFloatingButton;
