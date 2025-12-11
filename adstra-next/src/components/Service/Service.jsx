"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { db } from "../../Context/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./Service.css";

export default function Service() {
  const [services, setServices] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snap = await getDocs(collection(db, "service"));
        const data = snap.docs.map((doc) => doc.data());
        setServices(data);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };
    fetchServices();
  }, []);

  return (
    <section className="services-section">
      <div className="services-container">
        <h2 className="services-title">Our Specialized Services</h2>

        <div className="services-grid">
          {services.map((srv, i) => (
            <Tilt key={srv.slug || i}>
              <motion.button
                type="button"
                className="service-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                onClick={() =>
                  router.push(`/service/${encodeURIComponent(srv.slug)}`)
                }
                aria-label={`Learn more about ${srv.label}`}
              >
                <span className="card-border" aria-hidden="true" />
                <span className="card-noise" aria-hidden="true" />

                <div className="img-wrap">
                  <Image
                    src={srv.images?.[0] || "/placeholder.jpg"}
                    alt={srv.label}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 340px"
                    className="img"
                    priority={i === 0}
                  />
                  <span className="img-reflection" aria-hidden="true" />
                </div>

                <div className="card-content">
                  <h3 className="service-title">{srv.label}</h3>
                  <p className="service-description">{srv.description}</p>
                  <span className="learn-more-btn">
                    Learn More
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14M13 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </motion.button>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tilt({ children }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [7, -7]);
  const rotateY = useTransform(x, [-50, 50], [-9, 9]);

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    x.set((px / rect.width) * 100 - 50);
    y.set((py / rect.height) * 100 - 50);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="tilt-wrap"
      style={{ perspective: 1100 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div
        className="tilt-inner"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
