"use client";

import React from "react";
import Image from "next/image";

function FounderProfile() {
  return (
    <div className="founder-profile text-center">
      <Image
        src="/assets/founder.jpeg"
        alt="Founder"
        width={1000}
        height={700}
        className="founder-img"
        priority
      />
      {/* Optional name/title (uncomment if needed) */}
      {/* <h3 className="founder-name mt-3">John Doe</h3>
      <p className="founder-title">Founder & CEO</p> */}
    </div>
  );
}

export default FounderProfile;
