import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import img from "../../assets/banner-images/business-concept-with-graphic-holography_23-2149160929.webp"
import "./ServiceDetail.css";
import { useParams } from "react-router-dom";

const serviceSections = [
  {
    title: "In-House Professional Photography & Video Production",
    slug: "video-production",
    image: img,
    description:
      "High-quality visuals make a lasting impression. At Adstra Digital, we provide in-house photography and video production, ensuring professional, compelling content that enhances your brand’s identity. Whether it’s corporate branding shoots, product photography, promotional videos, or storytelling content, we make sure your visuals stand out.",
    points: [
      "Professional photoshoots for businesses, brands, and e-commerce.",
      "Product photography with the perfect lighting, angles, and effects.",
      "Corporate video production for marketing and branding.",
      "Event coverage to capture milestone moments.",
      "Creative video editing, motion graphics, and visual enhancements.",
    ],
  },
  {
    title: "Social Media Marketing & Campaigns",
    slug: "social-media-marketing",
    description:
      "We design data-driven marketing campaigns that boost engagement, build brand awareness, and drive conversions across platforms like Facebook, Instagram, LinkedIn, and Twitter.",
    points: [
      "Customized social media strategies to target the right audience.",
      "Daily post scheduling and content creation for consistency.",
      "Influencer collaborations to amplify brand reach.",
      "Hashtag research and audience insights for higher visibility.",
      "Paid advertising campaigns for maximum engagement and conversions.",
    ],
  },
  {
    title: "Lead Generation & Performance Marketing",
    slug: "lead-generation",
    description:
      "We specialize in targeted digital marketing strategies that turn prospects into paying customers using precise advertising techniques and data-driven insights.",
    points: [
      "Google Ads, Facebook Ads, and LinkedIn Ads to reach ideal customers.",
      "Retargeting strategies to reconnect with interested users.",
      "Landing page optimization to improve conversion rates.",
      "A/B testing and audience segmentation for highly effective campaigns.",
      "Monthly performance reports tracking leads and sales conversion.",
    ],
  },
  {
    title: "Branding & Identity Design",
    slug: "branding",
    description:
      "A brand is more than just a logo—it’s the story, message, and identity behind it. We help businesses craft a strong, recognizable brand through thoughtful design, messaging, and strategy.",
    points: [
      "Logo design and brand color selection for a unique identity.",
      "Typography and graphics that align with brand values.",
      "Brand guidelines to ensure consistency in marketing efforts.",
      "Packaging and promotional materials for physical and digital branding.",
      "Rebranding solutions for businesses looking for a fresh start.",
    ],
  },
  {
    title: "SEO & Website Optimization",
    slug: "seo-website-optimization",
    description:
      "We make sure your website ranks higher on Google with smart SEO strategies that enhance its content, speed, and usability.",
    points: [
      "Keyword research and content optimization to boost rankings.",
      "Technical SEO improvements to fix errors and increase speed.",
      "On-page and off-page SEO tactics to enhance visibility.",
      "Local SEO strategies for businesses targeting specific locations.",
      "Link-building and blog content to strengthen domain authority.",
    ],
  },
  {
    title: "Analytics & Reporting",
    slug: "analytics-reporting",
    description:
      "We provide detailed insights that help businesses adjust strategies for better engagement, more conversions, and stronger ROI.",
    points: [
      "Website traffic analysis to understand visitor behavior.",
      "Social media performance tracking to measure engagement levels.",
      "Paid campaign effectiveness tracking conversion rates.",
      "Competitor benchmarking to stay ahead of the competition.",
      "Custom reports and strategic recommendations for improvements.",
    ],
  },
  {
    title: "Content Marketing & Storytelling",
    slug: "content-marketing",
    description:
      "Our team creates high-quality blog articles, videos, and infographics tailored to your brand’s message, ensuring content that connects and converts.",
    points: [
      "Blog writing and industry-specific articles to establish expertise.",
      "Video storytelling for brand messaging and customer engagement.",
      "Infographics and visual content for impactful marketing.",
      "Email marketing campaigns with compelling copy and design.",
      "Strategic content planning for long-term success.",
    ],
  },
  {
    title: "Paid Advertising (PPC & Display Ads)",
    slug: "paid-advertising",
    description:
      "We craft high-impact ad campaigns that ensure effective audience targeting and cost-efficient spending.",
    points: [
      "Google Ads (Search, Display, Shopping, and Video Ads).",
      "Facebook & Instagram Ads for high engagement and conversions.",
      "LinkedIn Ads for corporate and professional targeting.",
      "YouTube Ads for video marketing at scale.",
      "Advanced audience targeting for better ad performance.",
    ],
  }, {
    title: "Google Ads – Targeted Advertising for Maximum Reach",
    slug: "google-ads",
    description:
      "Google Ads is one of the most effective ways to drive traffic, generate leads, and increase conversions. At Adstra Digital, we create highly optimized ad campaigns that ensure businesses reach the right audience at the right time.",
    points: [
      "Search Ads – Appear at the top of Google search results when users look for relevant keywords.",
      "Display Ads – Visually engaging ads placed across websites, apps, and YouTube.",
      "Shopping Ads – Ideal for e-commerce businesses to showcase products directly in search results.",
      "Video Ads – YouTube advertising to capture audience attention through engaging video content.",
      "Remarketing Ads – Reconnect with users who have previously visited your website.",
    ],
  }, {
    title: "Web Development & Design",
    slug: "web-development",
    description:
      "We build responsive, user-friendly websites tailored to your brand and business goals, ensuring optimal performance and seamless user experience.",
    points: [
      "Custom website design aligned with your brand identity.",
      "Responsive development for mobile, tablet, and desktop.",
      "E-commerce solutions with secure payment integrations.",
      "CMS implementation for easy content management.",
      "Website maintenance and performance optimization.",
    ],
  },
];

function FullServices() {
  const { label } = useParams();
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const normalizedLabel = label?.toLowerCase();

  const filteredServices =
    normalizedLabel === "all"
      ? serviceSections
      : serviceSections.filter(
        (service) => service.slug === normalizedLabel
      );

  return (
    <div className="full-services">
      <h2 data-aos="fade-down">
        {normalizedLabel === "all" || !normalizedLabel
          ? "Our Specialized Services"
          : `Specialized Service: ${normalizedLabel.replace(/-/g, " ")}`}
      </h2>
      {filteredServices.map((service, index) => (
        <Tilt
          glareEnable={true}
          glareMaxOpacity={0.2}
          scale={1.05}
          transitionSpeed={100}
          tiltMaxAngleX={10}
          tiltMaxAngleY={10}
          perspective={2000}
          gyroscope={true}
          key={index}
        >
          <div className="service-block" data-aos="fade-up" data-aos-delay={100}>
            <div className="service-content">
              <img src={service.image} alt={service.title} className="service-image" />
              <div className="service-text">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Tilt>
      ))}

      {(normalizedLabel === "all" || !normalizedLabel) && (
        <div className="why-choose" data-aos="fade-up">
          <h2>Why Choose Adstra Digital?</h2>
          <ul className="why">
            <li>Certified Google Ads Experts</li>
            <li>Social Media Marketing & Lead Generation</li>
            <li>Branding & Identity Design</li>
            <li>SEO & Website Optimization</li>
            <li>Creative Content Production</li>
            <li>Paid Advertising (PPC & Display Ads)</li>
            <li>Google Business Profile Management</li>
          </ul>
          <p className="conclusion">
            At Adstra Digital, we help brands elevate their presence, deliver
            elegant experiences, and excel in the digital world. Whether you're
            looking to boost sales, increase brand recognition, or connect with
            the right audience, we have the expertise to make it happen.
          </p>
        </div>
      )}
    </div>
  );
}

export default FullServices;