import React from "react";
import { useParams } from "react-router-dom";
import "./ServiceDetail.css";



const services = [
  {
    label: "video-production",
    title: "VIDEO PRODUCTION ; PHOTOSHOOTS",
    description: `Your brand deserves attention and to be unforgettable.
Visual storytelling is key in today’s marketing. We provide:`,
    features: [
      "High-quality commercials and corporate videos",
      "Creative photos that capture your brand’s essence",
      "Product photography with a stylish twist",
      "Engaging social media reels and ads",
    ],
    impact: "Videos can boost customer conversion rates by 80% compared to static content!",
  },
  {
    label: "data-driven-campaigns",
    title: "DATA-DRIVEN CAMPAIGNS ; PERFORMANCE MARKETING",
    description: `Every click, view, and interaction is adjusted for maximum results.
Our campaign experts create effective marketing plans that deliver measurable outcomes.`,
    features: [
      "SEO and PPC to improve ranking and speed up conversions",
      "Social media marketing for engagement and brand visibility",
      "Smart ad targeting to reach more people",
      "Collaborations with influencers for viral growth",
    ],
    impact: "Well-targeted campaigns can increase sales by up to 60%!",
  },
  {
    label: "branding",
    title: "BRANDING; DESIGN – CREATIVITY WITH A PURPOSE",
    description: `First impressions matter. We make sure yours stands out.`,
    features: [
      "Custom brand identity and logo designs",
      "Eye-catching graphics for social media",
      "Web and app designs that attract and convert",
      "Motion graphics and beautiful animations",
    ],
    impact: "94% of first impressions by consumers are based on design!",
  },
  {
    label: "content-creation",
    title: "CONTENT CREATION ; COPYWRITING – WORDS THAT WORK",
    description: `Your brand voice should be clear and engaging.`,
    features: [
      "SEO-friendly blogs and website content to drive traffic",
      "Engaging social media posts and storytelling",
      "Persuasive ad copy that boosts conversions",
      "Email marketing campaigns that keep customers coming back",
    ],
    impact: "Quality content can increase audience retention by 72%!",
  },
  {
    label: "advanced-analytics",
    title: "ADVANCED ANALYTICS ; GROWTH STRATEGIES",
    description: `Your business should rely on data, not guesswork.`,
    features: [
      "Real-time tracking for optimization",
      "Strategies for improving conversion rates",
      "Insights into audience behavior for smarter marketing",
      "Automation tools to streamline the customer journey",
    ],
    impact: "Companies using analytics can see a 5X higher return!",
  },
];

const whyChooseUs = [
  "Proven Experience: Years of helping businesses succeed online",
  "Creative Team: Talented designers and strategists at your service",
  "Smart Tools: Marketing tools designed for efficiency",
  "Customized Plans: Strategies built for your specific goals",
  "Honesty and Trust: We deliver what we promise.",
];


function ServiceDetails() {
  const { label } = useParams();

  if (!label) return <p style={{ textAlign: "center" }}>Invalid route</p>;

  const isAll = label?.toLowerCase() === "all";

const selectedServices = isAll
  ? services
  : services.filter((s) => s.label === decodeURIComponent(label.toLowerCase()));


  if (selectedServices.length === 0) {
    return <p style={{ textAlign: "center" }}>Service not found</p>;
  }

  return (
    <div className="service-details">
      <header>
        <h1>
          {isAll
            ? "ADSTRA DIGITAL – GROWING BUSINESSES IN THE DIGITAL AGE"
            : selectedServices[0].title}
        </h1>
        {isAll && (
          <>
            <p>A Complete Suite of Digital Marketing Solutions to Help You Grow</p>
            <p>
              At Adstra Digital, we don't just advertise brands—we create memorable experiences and help you achieve real results.
            </p>
            <p>
              By mixing the latest tech with data insights and creativity, we turn ideas into smart marketing plans that actually work.
            </p>
          </>
        )}
      </header>

      <section className="services">
        {selectedServices.map(({ title, description, features, impact }, idx) => (
          <article key={idx} className="service">
            <h3>{title}</h3>
            <p>{description}</p>
            <ul>
              {features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <p className="impact">
              <strong>Impact:</strong> {impact}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default ServiceDetails;