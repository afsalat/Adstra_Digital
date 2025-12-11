
import NavBar from "@/components/NavBar/Navbar";
import Banner from "@/components/Banner-0-2/Banner";
import About from "@/components/About/About";
import Service from "@/components/Service/Service";
import Gallery from "@/components/Gallery/Gallery";
import Enquiry from "@/components/Enquiry/Enquiry";
import Blog from "@/components/Blog/Blog";
import ContactUs from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";
import WhatsAppFloatingButton from "@/components/WhatsappIcon/WhatsappIcon";
import TrustedListings from "@/components/TrustedListings/TrustedListings";
import TeamDetails from "@/components/TeamDetails/TeamDetails";

export const metadata = {
  title: "Best Digital Marketing Agency in Kerala | AdstraDigital",
  description:
    "Grow your business with AdstraDigital— a trusted digital marketing Agency. We offer expert SEO, paid advertising, website design, branding & content marketing.",
  alternates: {
    canonical: "https://adstradigital.com/",
  },
  icons: {
    icon: "/favicon.ico",
  },
};


export default function Home() {
  return (
    <div className="Homepage"  style={{backgroundColor:"black"}}>
      <NavBar />
      <Banner />
      <About />
      <Service />
      <Gallery />
      <Enquiry />
      <TrustedListings />
      <TeamDetails />
      <Blog />
      <ContactUs />
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
