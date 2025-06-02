import React, { useEffect, useRef, useState } from "react";
import "./Service.css";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { db } from "../../Context/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

function SpinningBox({ position, images, label, slug, description }) {
  const navigate = useNavigate();
  const meshRef = useRef();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const textures = useLoader(THREE.TextureLoader, images);
  const materials = textures.map(
    (texture) => new THREE.MeshStandardMaterial({ map: texture })
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  const handleClick = () => {
    navigate(`/service/${encodeURIComponent(slug)}`);
  };

  return (
    <mesh ref={meshRef} position={position} material={materials}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <Html position={[0, 1.1, 0]} center>
        <div className="box-on-face" data-aos="fade-up">
          <h3>{label}</h3>
          <p>{description}</p>
          <button className="learn-more-btn" onClick={handleClick}>
            Learn More
          </button>
        </div>
      </Html>
    </mesh>
  );
}

function Service() {
  const [boxData, setBoxData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "service"));
        const data = querySnapshot.docs.map((doc) => doc.data());
        console.log("Fetched service data:", data);
        setBoxData(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="service" style={{ width: "100%", height: "100vh" }}>
      <h2 className="service-title" style={{ textAlign: "center", margin: "20px" }}>
        Our Services
      </h2>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        {boxData.map((box, idx) => {
          const position = [
            Math.random() * 12 - 6,
            Math.random() * 4 - 2,
            Math.random() * 2 - 1
          ];
          return (
            <SpinningBox
              key={idx}
              position={position}
              images={box.images}
              label={box.label}
              slug={box.slug}
              description={box.description}
            />
          );
        })}
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}

export default Service;
