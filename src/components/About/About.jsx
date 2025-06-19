import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Context/firebaseConfig";
import "./About.css";
import AOS from "aos";
import "aos/dist/aos.css";
import About_image from "../../assets/aboutimage.png";
import { useNavigate } from "react-router-dom";

function About() {
  const [aboutData, setAboutData] = useState([]);
  const navigate = useNavigate();

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

  const handlenavigate = () => {
    navigate("about/");
  };

  return (
    <div id="about" className="container my-5">
      <div className="row align-items-center">
        <div
          className="col-md-6 mb-4 mb-md-0 text-center"
          data-aos="fade-up"
        >
          <img
            src={About_image}
            alt="About us"
            className="img-fluid"
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
          <button onClick={handlenavigate} className="btn btn-danger mt-3 px-4 py-2">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default About;
