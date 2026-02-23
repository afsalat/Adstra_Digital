"use client";

import React, { useState } from "react";
import "./TeamDetails.css";
import { FaUserCircle, FaLinkedin, FaTwitter } from "react-icons/fa";

const teamMembers = [
  {
    name: "Sharda",
    role: "SEO Division",
    image: "https://adstradigital.com/media/team/sharda.png",
    content:
      "Sharda is a data-driven expert with a remarkable talent for helping businesses get found online. With her deep understanding of search engine algorithms, she develops long-term strategies that drive organic growth. She specializes in technical SEO, keyword research, and content optimization. Sharda's mission is to provide clients with a clear roadmap to dominate their search rankings.",
  },
  {
    name: "Divya",
    role: "Social Media Division",
    image: "https://adstradigital.com/media/team/divya.png",
    content:
      "Divya is a dynamic social media manager with a knack for creating engaging content and building strong online communities. She excels at translating a brand's voice into a compelling social media presence. Her expertise includes content strategy, community management, and social media advertising. Divya's goal is to help businesses connect authentically with their audience and turn followers into loyal customers.",
  },
  {
    name: "Aradhya",
    role: "Social Media Division",
    image: "https://adstradigital.com/media/team/aradhya.png",
    content:
      "Aradhya works as an assistant to Divya, supporting the social media division with content creation, campaign execution, and community engagement. She plays a key role in ensuring smooth daily operations and helps bring innovative ideas to enhance brand visibility and audience interaction.",
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
    image: "https://adstradigital.com/media/team/sunsreekumar.png",
    content:
      "Sree specializes in branding, UI/UX design, and motion graphics. With a sharp eye for aesthetics and brand identity, she creates designs that are not only visually appealing but also strategically aligned with business goals. Her expertise extends to 3D modeling and ad creatives, ensuring every project communicates with impact and clarity.",
  },
  {
    name: "Afsal",
    role: "IT Division",
    image: "https://adstradigital.com/media/team/afsal.png",
    content:
      "Afsal and his team lead the charge in web and application development, delivering sleek, high performance digital solutions. Their expertise ensures every project runs smoothly, from concept to launch.",
  },
  {
    name: "Muhammed Mishal",
    role: "IT Division",
    image: "https://adstradigital.com/media/team/Mishal.png ",
    content:
      "Mishal is an python developer who is learning and contributing to web and application development projects. He is gaining hands-on experience while supporting the team in delivering quality digital solutions.",
  },
  {
    name: "Manoj",
    role: "Sales Marketing Division",
    image: "https://adstradigital.com/media/team/manoj.png",
    content:
      "Manoj is passionate about helping businesses grow. With expertise in digital lead generation and market research, he ensures your brand connects with the right audience at the right time.",
  },

  {
    name: "Jagath",
    role: "IT Division",
    image: "https://adstradigital.com/media/team/Jagath.png",
    content:
      "Jagath is a skilled Flutter developer specializing in cross-platform mobile application development. With expertise in creating responsive and user-friendly mobile solutions, he delivers high-performance applications that enhance user experience and drive business growth.",
  },
  {
    name: "Jidu",
    role: "Video | Design Division",
    image: "https://adstradigital.com/media/team/Jidu.png",
    content:
      "Jidu is a talented motion graphic designer who brings animations and visual effects to life. With a keen eye for detail and creative storytelling, he creates engaging motion graphics that captivate audiences and enhance brand messaging.",
  },
  {
    name: "Rafia",
    role: "Video | Design Division",
    image: "https://adstradigital.com/media/team/Rafia.png",
    content:
      "Rafia is a creative graphic designer passionate about crafting visually stunning designs. Skilled in UI/UX design, branding, and digital assets, he transforms ideas into compelling visual solutions that elevate brand identity and user engagement.",
  },
  {
    name: "Kiran",
    role: "IT Division",
    image: "https://adstradigital.com/media/team/Kiran.png",
    content:
      "Kiran is a proficient Python developer with expertise in backend development and scripting. He specializes in building robust, scalable solutions and automation scripts that optimize business processes and enhance system performance.",
  },
  {
    name: "Athira",
    role: "IT Division",
    image: "https://adstradigital.com/media/team/athira.png",
    content:
      "Athira is a dedicated Python Developer Intern who is eager to learn and contribute to backend development projects. She assists the team in building efficient solutions and is committed to honing her skills in software development.",
  },
  {
    name: "Iyrine Reetha",
    role: "Sales Marketing Division",
    image: "https://adstradigital.com/media/team/irine.png",
    content:
      "Iyrine Reetha is a dedicated sales and marketing professional who plays a key role in expanding brand reach and driving business growth. She specializes in client relationship management and executing strategic marketing initiatives to deliver impactful results.",
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
      <div className="team-header mb-5">
        <h2 className="team-title text-center text-white mb-2">Meet Our Team</h2>
        <p className="team-subtitle text-center">Talented professionals driving innovation and excellence</p>
      </div>

      <div className="team-container">
        {groupedMembers.map(([role, members], idx) => (
          <div key={idx} className="team-division-wrapper mb-5">
            <div className="division-header">
              <h3 className="division-title">{role}</h3>
              <div className="title-underline"></div>
            </div>

            <div className="team-grid">
              {members.map((member, index) => (
                <div key={index} className="team-card-wrapper">
                  <article className="team-card">
                    {/* Image Container */}
                    <div className="image-container">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="team-image"
                        />
                      ) : (
                        <div className="placeholder-avatar">
                          <FaUserCircle size={80} />
                        </div>
                      )}
                    </div>

                    {/* Content Container */}
                    <div className="card-content">
                      <h4 className="member-name">{member.name}</h4>
                      <p className="member-role">{role}</p>
                      <div className="separator"></div>
                      <ReadMore text={member.content} limit={90} />
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamDetails;
