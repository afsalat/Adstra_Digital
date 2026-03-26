import Career from "@/components/Career/Career";
import ContactUs from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";
import NavBar from "@/components/NavBar/Navbar";

export const metadata = {
  title: "Careers at AdstraDigital",
  description:
    "Explore career opportunities at AdstraDigital in digital marketing, development, and strategy.",
  alternates: {
    canonical: "https://adstradigital.com/career/",
  },
};

export default function CareerPage() {
  return (
    <>
      <NavBar />
      <Career />
      <ContactUs />
      <Footer />
    </>
  );
}
