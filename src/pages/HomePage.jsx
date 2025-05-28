import React from "react";
import Banner from "../components/Banner/Banner";
import NavBar from "../components/NavBar/navbar";
import About from "../components/About/About";
import Service from "../components/Service/Service";
import Gallery from "../components/Gallery/Gallery";
import Enquiry from "../components/Enquiry/Enquiry";
import Footer from "../components/Footer/Footer";
import Blog from "../components/Blog/Blog";


function HomePage() {
    return (
        <div className="Homepage">
            <NavBar />
            <Banner />
            <About />
            <Service />
            <Gallery />
            <Enquiry /> 
            <Blog />
            <Footer />
        </div>
    )
}


export default HomePage;