"use client";

import React, { useState } from "react";
import "./TeamDetails.css";
import { FaUserCircle } from "react-icons/fa";

const teamMembers = [
  {
    name: "Sharda",
    role: "SEO Division",
    image: "/assets/team/sharda.jpeg",
    content:
      "Shreya is a data-driven expert with a remarkable talent for helping businesses get found online. With her deep understanding of search engine algorithms, she develops long-term strategies that drive organic growth. She specializes in technical SEO, keyword research, and content optimization. Sharda's mission is to provide clients with a clear roadmap to dominate their search rankings.",
  },
  {
    name: "Divya",
    role: "SEO Division",
    image: "/assets/team/divya.jpeg",
    content:
      "Divya is a dynamic social media manager with a knack for creating engaging content and building strong online communities. She excels at translating a brand's voice into a compelling social media presence. Her expertise includes content strategy, community management, and social media advertising. Divya's goal is to help businesses connect authentically with their audience and turn followers into loyal customers.",
  },
  {
    name: "Debashu",
    role: "SEO Division",
    image: "/assets/team/debashu.jpeg",
    content:
      "Debashu is an analytical and detail-oriented SEO specialist who works closely with Sharda to execute on-page and off-page strategies. His skills include link building, competitor analysis, and website auditing. Debashu is passionate about staying on top of the latest SEO trends to ensure your website is always one step ahead.",
  },
  {
    name: "sreekumar",
    role: "Video | Design Division",
    image: "/assets/team/sunsreekumar.webp",
    content:
      "Sree specializes in branding, UI/UX design, and motion graphics. With a sharp eye for aesthetics and brand identity, she creates designs that are not only visually appealing but also strategically aligned with business goals. Her expertise extends to 3D modeling and ad creatives, ensuring every project communicates with impact and clarity.",
  },
  {
    name: "adil",
    role: "Video | Design Division",
    image: null,
    content:
      "Adil is passionate about turning concepts into compelling visual narratives. Skilled in video editing, 3D modeling, and high-quality ad production, he brings stories to life through dynamic visuals. His creativity in motion graphics and promotional content ensures that every video engages, inspires, and drives results.",
  },
  {
    name: "Afsal",
    role: "IT Division",
    image: "assets/team/afsal.jpeg",
    content:
      "Afsal and his team lead the charge in web and application development, delivering sleek, high performance digital solutions. Their expertise ensures every project runs smoothly, from concept to launch.",
  },
  {
    name: "Manoj",
    role: "Sales Marketing Division",
    image: "/assets/team/manoj.jpeg",
    content:
      "Manoj is passionate about helping businesses grow. With expertise in digital lead generation and market research, he ensures your brand connects with the right audience at the right time.",
  },
  {
    name: "amaljith",
    role: "Sales Marketing Division",
    image: "/assets/team/amaljith.jpeg",
    content:
      "Amaljith believes strong relationships build strong businesses. He focuses on clear, consistent, and transparent communication, making sure your goals and feedback always guide our strategies.",
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
    <>
      <section className="team-banner my-5">
        {/* <img
          src="/assets/team/team-banner.jpg"
          alt="Our Team Banner"
          className="img-fluid w-100 rounded"
        /> */}
      </section>
      <section className="team-section py-5 px-3 px-md-5">
        <h2 className="text-center mb-5">Meet Our Team</h2>

        <div className="row g-5">
          {groupedMembers.map(([role, members], idx) => (
            <div key={idx} className="col-md-6 col-sm-12">
              <div className="team-division h-100">
                <h3 className="division-title text-center">{role}</h3>

                <div className="team-grid">
                  {members.map((member, index) => (
                    <div key={index} className="col-md-4 col-sm-6">
                      <article className="team-card text-center p-3 shadow-sm rounded h-100">
                        <figure className="team-figure mb-2">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="teams-image rounded-circle"
                            />
                          ) : (
                            <div className="teams-image icon-wrapper rounded-circle d-flex justify-content-center align-items-center">
                              <FaUserCircle className="teams-icon" />
                            </div>
                          )}
                        </figure>
                        <small className="">{member.role}</small>
                        <hr />
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
    </>
  );
};

export default TeamDetails;
