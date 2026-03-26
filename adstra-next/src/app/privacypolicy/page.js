import PrivacyPolicy from "@/components/Policy/Policy";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read AdstraDigital's privacy policy about data collection, usage, retention, and user rights.",
  alternates: {
    canonical: "https://adstradigital.com/privacypolicy/",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
