import React, { useState } from "react";
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
        <div className="whatsapp-popup">
          Chat with us on WhatsApp!
        </div>
      )}
      <div className="whatsapp-float" onClick={handleClick}>
        <img src={icon} alt="WhatsApp" className="whatsapp-icon" />
      </div>
    </div>
  );
}

export default WhatsAppFloatingButton;
