import NavBar from "@/components/NavBar/Navbar";
import Service from "@/components/Service/Service";
import Footer from "@/components/Footer/Footer";
import WhatsAppFloatingButton from "@/components/WhatsappIcon/WhatsappIcon";

export const metadata = {
  title: "Our 360 Service | AdstraDigital",
  description:
    "Explore AdstraDigital's 360 service experience in an interactive walkthrough environment.",
  alternates: {
    canonical: "https://adstradigital.com/360-service/",
  },
};

export default function Service360Page() {
  return (
    <div className="public-page-shell">
      <NavBar />
      <Service />
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
