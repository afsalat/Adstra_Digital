import React from "react";
import "./TeamDetails.css";
import { FaUserCircle } from "react-icons/fa";

// Team images
import Afeeda from "../../assets/team/Afeeda.webp";
import Sharda from "../../assets/team/Sharda.webp";
import Nahla from "../../assets/team/Nahla.webp";
import Sruthi from "../../assets/team/Sruthi.webp";
import Vineet from "../../assets/team/Vineet.webp";
import anil from "../../assets/team/Anil.webp";
import geetha from "../../assets/team/Geetha.webp";
import afsal from "../../assets/team/Afsal.webp";
import Athulya from "../../assets/team/Athulya.webp";
import Manoj from "../../assets/team/Manoj.webp";
import Rahul from "../../assets/team/Rahul.webp";
import Wilson from "../../assets/team/Wilson.webp";
import anunnath from "../../assets/team/Anunnath.webp";
import Sudarshan from "../../assets/team/Photographer.webp";

const teamMembers = [
  {
    name: "Fathima Afeeda",
    role: "Designer",
    image: Afeeda,
  },
  {
    name: "Sharda Bai",
    role: "SEO Expert",
    image: Sharda,
  },
  {
    name: "Nahla",  
    role: "Designer",
    image: Nahla,
  },
  {
    name: "Sruthi",
    role: "Marketing",
    image: Sruthi,
  },
  {
    name: "Vineet Singh",
    role: "Video Editor",
    image: Vineet,
  },
  {
    name: "Afsal AT",
    role: "Software Development",
    image: afsal,
  },
  {
    name: "Manoj TD",
    role: "Marketing",
    image: Manoj,
  },
  {
    name: "Athulya",
    role: "A/C",
    image: Athulya,
  },
  {
    name: "Sudarshan TS",
    role: "Photographer",
    image: Sudarshan,
  },
  {
    name: "Anunath P",
    role: "Marketing",
    image: anunnath,
  },
  {
    name: "Wilson K",
    role: "Bns. Dev & oprn",
    image: Wilson,
  },
  {
    name: "Rahul V",
    role: "Project Manager",
    image: Rahul, // No image
  },
  {
    name: "Anil Kumar Vanajyotsna",
    role: "Head of Development",
    image: anil,
  },
  {
    name: "Geetha K B",
    role: "Lead Designer",
    image: geetha,
  },
];

const TeamDetails = () => {
  return (
    <section className="team-section py-5 px-3 px-md-5">
      <h2 className="text-center mb-5">Meet Our Team</h2>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div className="team-card" key={index}>
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="teams-image"
              />
            ) : (
              <div className="teams-image icon-wrapper">
                <FaUserCircle className="teams-icon" />
              </div>
            )}
            <h4 className="mt-3">{member.name}</h4>
            <p className="team-role">{member.role}</p>
            {member.bio && <p className="team-bio">{member.bio}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamDetails;
