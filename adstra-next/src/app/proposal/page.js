"use client";

import dynamic from "next/dynamic";

const ProposalBuilder = dynamic(() => import("@/components/ProposalBuilder/ProposalBuilder"), {
  ssr: false,
});

export default function ProposalBuilderPage() {
  return <ProposalBuilder />;
}
