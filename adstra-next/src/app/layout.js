import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/Context/AuthContext";
import { ModalProvider } from "@/Context/ModalContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://adstradigital.com"
).replace(/\/+$/, "");

const LOGO_PATH = "/assets/logo_new-01.png";
const LOGO_URL = `${SITE_URL}${LOGO_PATH}`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Digital Marketing Company in Kozhikode | AdstraDigital",
  description:
    "Grow your business with AdstraDigital, a trusted digital marketing company. We offer expert SEO, paid advertising, website design, branding, and content marketing.",
  authors: [{ name: "AdstraDigital" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/`,
    title: "Digital Marketing Company in Kozhikode & Wayanad | AdstraDigital",
    description:
      "Grow your business with AdstraDigital, a trusted digital marketing company. We offer expert SEO, paid advertising, website design, branding, and content marketing.",
    images: [
      {
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
    ],
    siteName: "AdstraDigital",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@AdstraDigital",
    title: "Digital Marketing Company in Kozhikode & Wayanad | AdstraDigital",
    description:
      "Grow your business with AdstraDigital, a trusted digital marketing company. We offer expert SEO, paid advertising, website design, branding, and content marketing.",
    images: [LOGO_URL],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  verification: {
    google: "8i-QRA6BvD2XQbq9CBVT_7TJlc6fiWS3EWRwUhYB0VY",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Merriweather:wght@400;700&family=Poppins:wght@500;700&display=swap"
          rel="stylesheet"
        />

        <link
          rel="preload"
          as="image"
          href={LOGO_URL}
        />

        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />

        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        />
      </head>
      <body>
        <AuthProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AuthProvider>

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VZBBBCVJHK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag("js", new Date());
            gtag("config", "G-VZBBBCVJHK");
          `}
        </Script>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />

        <Script id="ld-json" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "AdstraDigital",
            url: SITE_URL,
            logo: LOGO_URL,
            description:
              "Grow your business with AdstraDigital, a trusted digital marketing company. We offer expert SEO, paid advertising, website design, branding, and content marketing.",
            telephone: "+91 9744779574",
            email: "info@adstradigital.com",
            address: {
              "@type": "PostalAddress",
              streetAddress:
                "Popular Arcade, 1st Floor, Near English Church, Nadakkavu",
              addressLocality: "Kozhikode",
              addressRegion: "Kerala",
              postalCode: "673011",
              addressCountry: "IN",
            },
            openingHours: "Mo-Sa 10:00-18:00",
            geo: {
              "@type": "GeoCoordinates",
              latitude: "11.2555",
              longitude: "75.7804",
            },
            sameAs: [
              "https://www.facebook.com/adstradigital",
              "https://www.instagram.com/adstradigital",
              "https://www.linkedin.com/company/adstra-digital",
            ],
          })}
        </Script>
      </body>
    </html>
  );
}
