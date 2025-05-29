import React, { useEffect, useRef } from "react";
import "./Service.css";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import AOS from "aos";
import { useNavigate } from "react-router-dom";

function SpinningBox({ position, images, label, description }) {
  const navigate = useNavigate();
  const meshRef = useRef();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  })


  const [
    frontTexture,
    backTexture,
    topTexture,
    bottomTexture,
    leftTexture,
    rightTexture,
  ] = useLoader(THREE.TextureLoader, images);

  const materials = [
    new THREE.MeshStandardMaterial({ map: frontTexture }),
    new THREE.MeshStandardMaterial({ map: backTexture }),
    new THREE.MeshStandardMaterial({ map: topTexture }),
    new THREE.MeshStandardMaterial({ map: bottomTexture }),
    new THREE.MeshStandardMaterial({ map: leftTexture }),
    new THREE.MeshStandardMaterial({ map: rightTexture }),
  ];

  // Animate rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  // Button click handler
  const handleClick = () => {
    navigate(`/service/${label}`);
  };

  return (
    <mesh ref={meshRef} position={position} material={materials}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      {/* Label & description & button on top using Html */}
      <Html position={[0, 1.1, 0]} center>
        <div className="box-on-face">
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


  const boxData = [
    {
      position: [-6, 2, 0],
      label: "VIDEO PRODUCTION",
      description: "Your brand deserves attention and to be unforgettable.",
      images: [
        "https://dummyimage.com/256x256/007bff/ffffff.png&text=Modeling+Front",
        "https://dummyimage.com/256x256/0056b3/ffffff.png&text=Modeling+Back",
        "https://dummyimage.com/256x256/003d80/ffffff.png&text=Modeling+Top",
        "https://dummyimage.com/256x256/00265c/ffffff.png&text=Modeling+Bottom",
        "https://dummyimage.com/256x256/001933/ffffff.png&text=Modeling+Left",
        "https://dummyimage.com/256x256/000d19/ffffff.png&text=Modeling+Right",
      ],
    },
    {
      position: [-3, 2, 0],
      label: "DATA-DRIVEN CAMPAIGNS",
      description: "Every click, view, and interaction is adjusted for maximum results.",
      images: [
        "https://dummyimage.com/256x256/ff6347/ffffff.png&text=Animation+Front",
        "https://dummyimage.com/256x256/cc4a33/ffffff.png&text=Animation+Back",
        "https://dummyimage.com/256x256/a33a27/ffffff.png&text=Animation+Top",
        "https://dummyimage.com/256x256/7f2c1e/ffffff.png&text=Animation+Bottom",
        "https://dummyimage.com/256x256/5f2418/ffffff.png&text=Animation+Left",
        "https://dummyimage.com/256x256/45180f/ffffff.png&text=Animation+Right",
      ],
    },
    {
      position: [0, 2, 0],
      label: "BRANDING",
      description: "First impressions matter. We make sure yours stands out.",
      images: [
        "https://dummyimage.com/256x256/32cd32/ffffff.png&text=ARVR+Front",
        "https://dummyimage.com/256x256/28a428/ffffff.png&text=ARVR+Back",
        "https://dummyimage.com/256x256/208120/ffffff.png&text=ARVR+Top",
        "https://dummyimage.com/256x256/166816/ffffff.png&text=ARVR+Bottom",
        "https://dummyimage.com/256x256/104410/ffffff.png&text=ARVR+Left",
        "https://dummyimage.com/256x256/0a2b0a/ffffff.png&text=ARVR+Right",
      ],
    },
    {
      position: [3, 2, 0],
      label: "CONTENT CREATION",
      description: "Your brand voice should be clear and engaging.",
      images: [
        "https://dummyimage.com/256x256/ffa500/ffffff.png&text=Rendering+Front",
        "https://dummyimage.com/256x256/cc8400/ffffff.png&text=Rendering+Back",
        "https://dummyimage.com/256x256/a36700/ffffff.png&text=Rendering+Top",
        "https://dummyimage.com/256x256/7f4c00/ffffff.png&text=Rendering+Bottom",
        "https://dummyimage.com/256x256/5f3800/ffffff.png&text=Rendering+Left",
        "https://dummyimage.com/256x256/451f00/ffffff.png&text=Rendering+Right",
      ],
    },
    {
      position: [0, -1, 0],
      label: "ADVANCED ANALYTICS",
      description: "Your business should rely on data, not guesswork.",
      images: [
        "https://dummyimage.com/256x256/800080/ffffff.png&text=WebGL+Front",
        "https://dummyimage.com/256x256/660066/ffffff.png&text=WebGL+Back",
        "https://dummyimage.com/256x256/4d004d/ffffff.png&text=WebGL+Top",
        "https://dummyimage.com/256x256/330033/ffffff.png&text=WebGL+Bottom",
        "https://dummyimage.com/256x256/1a001a/ffffff.png&text=WebGL+Left",
        "https://dummyimage.com/256x256/0d000d/ffffff.png&text=WebGL+Right",
      ],
    },
    {
      position: [-3, -1, 0],
      label: "WHY CHOOSE ADSTRA DIGITAL",
      description: "Honesty and Trust: We deliver what we promise.",
      images: [
        "https://dummyimage.com/256x256/ff1493/ffffff.png&text=Product+Front",
        "https://dummyimage.com/256x256/cc117a/ffffff.png&text=Product+Back",
        "https://dummyimage.com/256x256/a30f60/ffffff.png&text=Product+Top",
        "https://dummyimage.com/256x256/7f0b4a/ffffff.png&text=Product+Bottom",
        "https://dummyimage.com/256x256/5f0837/ffffff.png&text=Product+Left",
        "https://dummyimage.com/256x256/450525/ffffff.png&text=Product+Right",
      ],
    }
  ]

  return (
    <div className="service" style={{ width: "100%", height: "100vh" }}>
      <h2
        className="service-title"
        style={{ textAlign: "center", margin: "20px" }}
      >
        Our Services
      </h2>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        {boxData.map((box, idx) => (
          <SpinningBox
            key={idx}
            position={box.position}
            images={box.images}
            label={box.label}
            description={box.description}
            data-aos="fade-up"
          />
        ))}
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}

export default Service;
