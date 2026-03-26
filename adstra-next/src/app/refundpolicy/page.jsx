import NonRefundPolicy from "@/components/Refund/Refund";

export const metadata = {
  title: "Refund Policy",
  description:
    "Read the non-refund policy for AdstraDigital services and billing terms.",
  alternates: {
    canonical: "https://adstradigital.com/refundpolicy/",
  },
};

export default function RefundPolicy() {
  return <NonRefundPolicy />;
}
