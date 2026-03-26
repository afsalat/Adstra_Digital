import TermsAndConditions from "@/components/TermsNCondition/Terms";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Read the terms and conditions for using AdstraDigital services and platform.",
  alternates: {
    canonical: "https://adstradigital.com/TermsNconditions/",
  },
};

export default function TermsNconditionsPage() {
  return <TermsAndConditions />;
}
