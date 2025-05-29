import React from "react";
import ServiceDetail from "../components/ServiceDetails/ServiceDetail";
import NavBar from "../components/NavBar/navbar";
import Footer from "../components/Footer/Footer";
import AboutDetails from "../components/AboutDetails/AboutDetails";


function AboutDetailsPage() {
    return (
        <div>
            <NavBar />
            <AboutDetails />
            <Footer />
        </div>
    )
}

export default AboutDetailsPage;