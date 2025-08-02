"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/context/firebaseConfig"; // ✅ Adjust if your firebaseConfig file path is different
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import "./About.css";
import aboutImage from "@/assets/aboutt.png"; // ✅ Use correct path relative to your asset import
import { useRouter } from "next/navigation";

function About() {
  const [aboutData, setAboutData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "about"));
      const items = querySnapshot.docs.map((doc) => doc.data());
      setAboutData(items);
    } catch (error) {
      console.error("Error fetching about data:", error);
    }
  };

  const handleNavigate = () => {
    router.push("/about");
  };

  return (
    <div id="about" className="container">
      <div className="row align-items-center">
        <div className="col-md-6 mb-4 text-center" data-aos="fade-up">
          <Image
            src={aboutImage}
            alt="About us"
            className="img-fluid"
            placeholder="blur"
          />
        </div>

        <div className="col-md-6 text-start" data-aos="fade-up">
          <h2 className="fw-bold mb-3">About Adstra Digital</h2>
          {aboutData.length > 0 ? (
            aboutData.map((data, index) => (
              <div key={index}>
                <p>{data.intro}</p>
                <p>{data.servicesIntro}</p>
                <p>{data.difference}</p>
                <p>{data.commitment}</p>
              </div>
            ))
          ) : (
            <p>Loading content...</p>
          )}
          <button onClick={handleNavigate} className="btn btn-danger mt-3 px-4 py-2">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default About;
