import React from 'react';
import './Policy.css';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/');
    };



    return (
        <div className="privacy-policy">
            <button className="back-button" onClick={handleBack}>
                ← Back to Home
            </button>

            <p><strong>ADSTRA DIGITAL Privacy Policy</strong></p>
            <p><strong>Last updated:</strong> 01 May 2025</p>

            <p>
                This Privacy Policy describes how ADSTRA DIGITAL (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from <a href="https://www.adstradigital.com" target="_blank" rel="noopener noreferrer">https://www.adstradigital.com</a> or otherwise communicate with us.
            </p>

            <p>
                By using our Services, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree, please do not use our Services.
            </p>

            <p>
                We may update this Privacy Policy from time to time. The updated policy will be posted here with a revised "Last updated" date.
            </p>

            <p>
                We collect personal information in order to provide and improve our Services. This may include contact details (name, address, phone, email), order details, account information, shopping activity, and customer support messages.
            </p>

            <p>
                We also collect "Usage Data" through cookies and similar technologies including your IP address, browser details, and device data.
            </p>

            <p>
                We may receive information from third parties like Shopify and payment processors to help us operate the Site and provide our services.
            </p>

            <p>
                Your data is used to deliver services, support transactions, send marketing messages, enhance security, and improve user experience.
            </p>

            <p>
                We use cookies to remember preferences, analyze traffic, and personalize content. Learn more at <a href="https://www.shopify.com/legal/cookies" target="_blank" rel="noopener noreferrer">Shopify Cookies Policy</a>.
            </p>

            <p>
                We may share your information with service providers, marketing partners, affiliates, or as required by law. This includes basic contact, order, account, and browsing information.
            </p>

            <p>
                We may share or sell personal data for marketing purposes. Information shared includes identifiers, commercial data, and usage activity.
            </p>

            <p>
                Public content you post (like reviews) may be accessible to others. Please consider this when submitting any content through our Services.
            </p>

            <p>
                Our Site may contain links to third-party websites. We are not responsible for their privacy practices or content.
            </p>

            <p>
                Our Services are not intended for children under 16, and we do not knowingly collect data from minors. If you believe a child has submitted data, please contact us to request removal.
            </p>
        </div>
    );
};

export default PrivacyPolicy;
