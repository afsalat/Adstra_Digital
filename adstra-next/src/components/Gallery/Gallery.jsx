"use client";

import { useEffect, useRef, useState } from "react";
import "./Gallery.css";

function Gallery() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="gallery" className="gallery-section" ref={sectionRef}>
      <div className="gallery-aurora gallery-aurora--left" />
      <div className="gallery-aurora gallery-aurora--right" />

      <div className="gallery-shell">
        <div className={`gallery-header ${isVisible ? "is-visible" : ""}`}>
          <span className="gallery-kicker">Gallery</span>
          <h2 className="gallery-title">Clean Space For New Gallery Content</h2>
          <p className="gallery-copy">
            All existing gallery images have been removed. This section is now ready
            for your new layout, media, or feature.
          </p>
        </div>

        <div className={`gallery-empty-state ${isVisible ? "is-visible" : ""}`}>
          <div className="gallery-empty-state__grid" />
          <div className="gallery-empty-state__content">
            <span className="gallery-empty-state__label">Empty Canvas</span>
            <h3>Build the next gallery experience here.</h3>
            <p>No image cards are rendered in this section now.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Gallery;
