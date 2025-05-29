import React from "react";
import "./navbar.css";
import logo from '../../assets/logo/Logo-01.jpg'

function NavBar() {
    return (
        <div className="navbar">
            <div className="navbar-inside">
                <div className="navbar-left">
                    <img src={logo} alt="Company Logo" className="logo" />
                </div>

                <ul className="nav-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/service/all">Service</a></li>
                    <li><a href="/#gallery">Gallery</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/#enquiry">Enquiry</a></li>
                    <ul className="nav-link">
                        <li><a href="/#contact">Contact us</a></li>
                        <li><a href="#blog">Blog</a></li>
                    </ul>
                </ul>


                <div className="navbar-right">
                    <div className="contact-info">
                        <div className="phone">📞 +91 7875176626</div>
                        <div className="email">✉️ info@adstradigital.com</div>
                    </div>
                </div>
            </div>
        </div>  
    );
}

export default NavBar;
