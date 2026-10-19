"use client";

import React from "react";
import dynamic from "next/dynamic";

const SocialManagement = dynamic(
  () => import("@/components/admin_side/SocialManagement/SocialManagement"),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ color: "#64748b", fontSize: "0.92rem", fontWeight: 500 }}>Loading Social Management...</div>
      </div>
    ),
  }
);

export default function SocialManagementPage() {
  return <SocialManagement />;
}

