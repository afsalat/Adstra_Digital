"use client";

import React, { useState } from "react";
import "./TeamDetails.css";
import { FaUserCircle } from "react-icons/fa";

const teamMembers = [
  {
    name: "Sharda",
    role: "SEO Division",
    image: "https://adstradigital.com/media/team/sharda.jpeg",
    content:
      "Sharda is a data-driven expert with a remarkable talent for helping businesses get found online. With her deep understanding of search engine algorithms, she develops long-term strategies that drive organic growth. She specializes in technical SEO, keyword research, and content optimization. Sharda's mission is to provide clients with a clear roadmap to dominate their search rankings.",
  },
  {
    name: "Divya",
    role: "Social Media Division",
    image: "https://adstradigital.com/media/team/divya.jpeg",
    content:
      "Divya is a dynamic social media manager with a knack for creating engaging content and building strong online communities. She excels at translating a brand's voice into a compelling social media presence. Her expertise includes content strategy, community management, and social media advertising. Divya's goal is to help businesses connect authentically with their audience and turn followers into loyal customers.",
  },
  {
    name: "Anamika",
    role: "Social Media Division",
    image: "",
    content:
      "Anamika works as an assistant to Divya, supporting the social media division with content creation, campaign execution, and community engagement. She plays a key role in ensuring smooth daily operations and helps bring innovative ideas to enhance brand visibility and audience interaction.",
  },
  {
    name: "Komal",
    role: "SEO Division",
    image: "https://adstradigital.com/media/team/komal.png",
    content:
      "komal is an analytical and detail-oriented SEO specialist who works closely with Sharda to execute on-page and off-page strategies. her skills include link building, competitor analysis, and website auditing. Komal is passionate about staying on top of the latest SEO trends to ensure your website is always one step ahead.",
  },
  {
    name: "sreekumar",
    role: "Video | Design Division",
    image: "https://adstradigital.com/media/team/sunsreekumar.webp",
    content:
      "Sree specializes in branding, UI/UX design, and motion graphics. With a sharp eye for aesthetics and brand identity, she creates designs that are not only visually appealing but also strategically aligned with business goals. Her expertise extends to 3D modeling and ad creatives, ensuring every project communicates with impact and clarity.",
  },
  {
    name: "Muhammed Jasil",
    role: "Video | Design Division",
    image: null,
    content:
      "Muhammed Jasil is dedicated to building robust and scalable digital solutions. Skilled in full-stack development, API integration, and performance optimization, he ensures that every project runs smoothly from backend logic to frontend experience. His expertise in modern frameworks and problem-solving mindset makes him a key force in driving Adstra Digital’s technology forward.",
  },
  {
    name: "Rafiya",
    role: "Video | Design Division",
    image: null,
    content:
      "Rafiya is passionate about turning concepts into compelling visual narratives. Skilled in video editing, 3D modeling, and high-quality ad production, he brings stories to life through dynamic visuals. His creativity in motion graphics and promotional content ensures that every video engages, inspires, and drives results.",
  },
  {
    name: "Afsal",
    role: "IT Division",
    image: "https://adstradigital.com/media/team/afsal.jpeg",
    content:
      "Afsal and his team lead the charge in web and application development, delivering sleek, high performance digital solutions. Their expertise ensures every project runs smoothly, from concept to launch.",
  },
  {
    name: "Muhammed Mishal",
    role: "IT Division",
    image: "https://adstradigital.com/media/team/mishal.jpeg",
    content:
      "Mishal is an intern developer who is learning and contributing to web and application development projects. He is gaining hands-on experience while supporting the team in delivering quality digital solutions.",
  },
  {
    name: "Manoj",
    role: "Sales Marketing Division",
    image: "https://adstradigital.com/media/team/manoj.jpeg",
    content:
      "Manoj is passionate about helping businesses grow. With expertise in digital lead generation and market research, he ensures your brand connects with the right audience at the right time.",
  },
  {
    name: "Neha",
    role: "Sales Marketing Division",
    image: null,
    content:
      "Neha brings structure and precision to every campaign. From timelines to execution, he ensures projects run smoothly and deliver measurable success for our clients.",
  },
];

const groupByRole = (members) =>
  members.reduce((acc, member) => {
    acc[member.role] = acc[member.role] || [];
    acc[member.role].push(member);
    return acc;
  }, {});

const TeamDetails = () => {
  const groupedMembers = Object.entries(groupByRole(teamMembers));

  // Local ReadMore component
  const ReadMore = ({ text, limit = 80 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return null;

    const toggleReadMore = () => setIsExpanded(!isExpanded);

    return (
      <p className="team-content">
        {isExpanded
          ? text
          : `${text.slice(0, limit)}${text.length > limit ? "..." : ""}`}
        {text.length > limit && (
          <span className="read-more-btn" onClick={toggleReadMore}>
            {isExpanded ? " Read Less" : " Read More"}
          </span>
        )}
      </p>
    );
  };

  return (
    <section className="team-section py-5 px-3 px-md-5">
      <h2 className="text-center text-white mb-5">Meet Our Team</h2>

      <div className="row g-5">
        {groupedMembers.map(([role, members], idx) => (
          <div key={idx} className="col-md-6 col-sm-12">
            <div className="team-division h-100">
              <h3 className="division-title text-center">{role}</h3>

              <div className="team-grid">
                {members.map((member, index) => (
                  <div key={index} className="col-md-4 col-sm-6 mb-4">
                    <article className="team-card text-center p-4 shadow rounded h-100 bg-white border-0">
                      {/* Profile Image */}
                      <figure className="team-figure mb-3 position-relative">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="teams-image shadow-sm"
                            style={{
                              width: "120px",
                              height: "160px",
                            }}
                          />
                        ) : (
                          <div
                            className="teams-image icon-wrapper d-flex justify-content-center align-items-center border-primary shadow-sm"
                            style={{
                              width: "120px",
                              height: "160px",
                              background: "#f8f9fa",
                              marginLeft: "40px",
                            }}
                          >
                            <FaUserCircle
                              className="teams-icon text-muted"
                              size={60}
                            />
                          </div>
                        )}
                      </figure>

                      {/* Member Info */}
                      <h6 className="text-primary fw-bold">{member.role}</h6>
                      <div className="separator my-2 mx-auto"></div>
                      <ReadMore text={member.content} limit={90} />
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamDetails;
