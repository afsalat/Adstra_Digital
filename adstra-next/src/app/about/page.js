import AboutDetails from "@/components/AboutDetails/AboutDetails";
import Footer from "@/components/Footer/Footer";
import NavBar from "@/components/NavBar/navbar";

export const metadata = {
  title: "About Us – AdstraDigital",
  description:
    "Learn more about AdstraDigital, Kerala’s leading digital marketing agency offering SEO, branding, advertising, and web development.",
  alternates: {
    canonical: "https://adstradigital.com/about",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <AboutDetails />
      <Footer />
    </>
  );
}
