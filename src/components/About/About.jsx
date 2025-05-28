import React, { useEffect } from "react";
import "./About.css";
import AOS from "aos";
import About_image from "../../assets/aboutimage.png"

function About() {

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    })

    return (
        <div className="about">
            <div className="about-right" data-aos="fade-up">
                <img src={About_image} alt="About us" />
            </div>
            <div className="about-left" data-aos="fade-up">
                <h2>About Us</h2>
                <p>
                    We are committed to delivering the best service with a focus on quality and innovation. Our mission is to help businesses grow and succeed through cutting-edge solutions.
                </p>
                <button className="learn-btn">Learn More</button>
            </div>
        </div>
    );
}

export default About;
