"use client";

import React from 'react';
import { Instagram, Facebook, Linkedin, Twitter, Youtube, MessageCircle } from 'lucide-react';
import './FloatingSocials.css';

const FloatingSocials = () => {
  const icons = [
    { Icon: Instagram, color: '#E1306C', size: 32, top: '15%', left: '10%', delay: '0s', duration: '18s' },
    { Icon: Facebook, color: '#1877F2', size: 28, top: '65%', left: '5%', delay: '2s', duration: '22s' },
    { Icon: Linkedin, color: '#0A66C2', size: 36, top: '25%', left: '85%', delay: '1s', duration: '20s' },
    { Icon: Twitter, color: '#1DA1F2', size: 24, top: '75%', left: '90%', delay: '3s', duration: '25s' },
    { Icon: Youtube, color: '#FF0000', size: 30, top: '45%', left: '80%', delay: '4s', duration: '19s' },
    { Icon: MessageCircle, color: '#25D366', size: 26, top: '85%', left: '15%', delay: '5s', duration: '24s' },
    { Icon: Instagram, color: '#E1306C', size: 22, top: '35%', left: '95%', delay: '6s', duration: '21s' },
    { Icon: Linkedin, color: '#0A66C2', size: 20, top: '5%', left: '60%', delay: '7s', duration: '23s' },
  ];

  return (
    <div className="floating-socials-container">
      {icons.map((item, index) => (
        <div
          key={index}
          className="floating-icon"
          style={{
            top: item.top,
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            color: item.color,
            opacity: 0.15
          }}
        >
          <item.Icon size={item.size} />
        </div>
      ))}
    </div>
  );
};

export default FloatingSocials;
