"use client";

import dynamic from "next/dynamic";
import "./TeamDetails.css";

const TeamLanyards = dynamic(() => import("./TeamLanyards"), {
  ssr: false,
});

const featuredMembers = [
  {
    name: "Afsal A T",
    role: "Team Lead (Development)",
    accent: "#7be0b1",
    copy: "Web platforms, engineering systems, and launch-ready builds.",
    frontImage: "/team-lanyards/afsal.jpeg",
    backImage: "/team-lanyards/back.jpeg",
  },
  {
    name: "Manoj T D",
    role: "Business Development",
    accent: "#d3a8ff",
    copy: "Lead generation, market insight, and client growth strategy.",
    frontImage: "/team-lanyards/manoj.jpg",
    backImage: "/team-lanyards/back.jpeg",
  },
  {
    name: "Iyrine Reetha D P",
    role: "Business Development Coordinator",
    accent: "#ffd37b",
    copy: "Business coordination, client communication, and relationship support.",
    frontImage: "/team-lanyards/reetha.jpg",
    backImage: "/team-lanyards/back.jpeg",
  },
  {
    name: "Sunsreekumar K",
    role: "Creative Lead",
    accent: "#6fb5ff",
    copy: "Creative direction, visual storytelling, and campaign design systems.",
    frontImage: "/team-lanyards/sun.jpg",
    backImage: "/team-lanyards/back.jpeg",
  },
];

const TeamDetails = () => {
  return (
    <section className="team-section" id="team">
      <div className="team-shell">
        <div className="team-header">
          <span className="team-kicker">Interactive Team View</span>
          <h2 className="team-title">Meet Our Team</h2>
          <p className="team-subtitle">
            Drag the lanyards to explore the people behind strategy, design,
            campaigns, and development.
          </p>
        </div>

        <div className="team-stage">
          <TeamLanyards members={featuredMembers} position={[0, 0, 26]} />
        </div>
      </div>
    </section>
  );
};

export default TeamDetails;
