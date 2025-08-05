const clientsList = [
  {
    id: "1",
    name: "Ramesh Kumar",
    address: "Bangalore, KA, 560001",
    gstin: "GSTIN1234ABC",
    lut: "LUT00123",
  },
  {
    id: "2",
    name: "Suresh Traders",
    address: "Chennai, TN, 600001",
    gstin: "GSTIN5678XYZ",
    lut: "LUT00987",
  },
];

export default clientsList;


export const predefinedServices = {
  "Digital Marketing": [
    { description: "SEO Optimization", quantity: 1, rate: 0 , gst: "18%"},
    { description: "Social Media Management", quantity: 1, gst: "18%", rate: 0 },
    { description: "Google Ads Setup & Management", quantity: 1, gst: "18%", rate: 0 },
  ],
  "ERP Development": [
    { description: "Backend Development", quantity: 1, gst: "18%", rate: 0 },
    { description: "User Training", quantity: 1, gst: "18%", rate: 0 },
    { description: "Module Integration", quantity: 1, gst: "18%", rate: 0 },
  ],
  "CRM System": [
    { description: "Lead Management Module", quantity: 1, gst: "18%", rate: 0 },
    { description: "Pipeline & Automation Setup", quantity: 1, gst: "18%", rate: 0 },
  ],
  "E-Commerce Website": [
    { description: "Product Catalog Setup", quantity: 1, gst: "18%", rate: 0 },
    { description: "Payment Gateway Integration", quantity: 1, gst: "18%", rate: 0 },
    { description: "Admin Panel & Order Management", quantity: 1, gst: "18%", rate: 0 },
  ],
  "Mobile App Development": [
    { description: "Android App", quantity: 1, gst: "18%", rate: 0 },
    { description: "iOS App", quantity: 1, gst: "18%", rate: 0 },
    { description: "API Integration", quantity: 1, gst: "18%", rate: 0 },
  ],
  "Website Design & Development": [
    { description: "Responsive Web Design", quantity: 1, gst: "18%", rate: 0 },
    { description: "Frontend Development", quantity: 1, gst: "18%", rate: 0 },
    { description: "Backend Integration", quantity: 1, gst: "18%", rate: 0 },
  ],
  "Graphic Design": [
    { description: "Logo Design", quantity: 1, gst: "18%", rate: 0 },
    { description: "Social Media Banners", quantity: 1, gst: "18%", rate: 0 },
    { description: "Brand Guidelines", quantity: 1, gst: "18%", rate: 0 },
  ],
};


export const serviceExtraDetails = {
  "Digital Marketing": `
    Our Digital Marketing package is designed to improve your brand's online visibility and drive targeted traffic.
    - **SEO Optimization**: On-page and off-page SEO to improve search rankings, keyword targeting, meta tags, and backlinking strategies.
    - **Social Media Management**: Consistent posting, audience engagement, and brand voice development across major platforms (Instagram, Facebook, LinkedIn).
    - **Google Ads Setup & Management**: Complete setup of ad campaigns, audience segmentation, A/B testing, and weekly performance reporting.
    You’ll receive analytics dashboards, strategy consultations, and monthly performance reviews.
  `,

  "ERP Development": `
    Our ERP development services streamline your operations through customized, modular enterprise solutions.
    - **Backend Development**: Scalable server-side logic using modern stacks (Node.js/Django), integrated with database architecture.
    - **User Training**: Hands-on training sessions for your team to ensure smooth adoption and usage of ERP modules.
    - **Module Integration**: Seamless connection of finance, HR, inventory, and custom modules with real-time syncing and reporting.
    This includes cloud deployment, role-based access control, and long-term support.
  `,

  "CRM System": `
    A complete CRM solution to manage your sales pipeline, customer data, and automation workflows.
    - **Lead Management Module**: Centralized lead capture from websites, ads, and calls with status tracking and assignment.
    - **Pipeline & Automation Setup**: Visual sales pipelines, deal tracking, and automated follow-ups via email/SMS/WhatsApp.
    Integrates with your existing tools like Gmail, Calendars, or third-party APIs, with support for dashboard-based analytics.
  `,

  "E-Commerce Website": `
    We deliver a robust and user-friendly online store optimized for performance and conversion.
    - **Product Catalog Setup**: Organized product pages with categories, filters, descriptions, and SEO-optimized URLs.
    - **Payment Gateway Integration**: Secure integration with Razorpay, Stripe, or PayPal, including COD options.
    - **Admin Panel & Order Management**: Custom dashboard for managing orders, customers, inventory, discounts, and reports.
    Includes responsive UI/UX, mobile optimization, and optional PWA support for app-like experience.
  `,

  "Mobile App Development": `
    End-to-end development of mobile apps with pixel-perfect design and performance across Android and iOS.
    - **Android App**: Native/Hybrid Android app with Firebase backend or REST APIs, push notifications, and material design UI.
    - **iOS App**: Swift/React Native-based app development with Apple guidelines compliance, App Store submission support.
    - **API Integration**: Secure connection with external services (payment, geolocation, CRMs) using RESTful APIs or GraphQL.
    Also includes testing, performance monitoring, and deployment to Google Play & App Store.
  `,

  "Website Design & Development": `
    Clean, modern, and responsive websites tailored to your brand and goals.
    - **Responsive Web Design**: Cross-device compatibility, pixel-perfect layout, and accessibility standards.
    - **Frontend Development**: Built using React.js, Vue, or standard HTML/CSS with animation and interactive components.
    - **Backend Integration**: Dynamic content handling using Node.js, PHP, or Django, with CMS or custom dashboard support.
    Optimized for fast load times, SEO readiness, and secured hosting integration.
  `,

  "Graphic Design": `
    Powerful brand visuals designed to leave a lasting impact across digital and print media.
    - **Logo Design**: Multiple logo concepts with revisions, suitable for digital, print, favicon, and watermark usage.
    - **Social Media Banners**: Branded creatives for Facebook, Instagram, LinkedIn with event, product, and offer themes.
    - **Brand Guidelines**: A structured brand kit including typography, color palettes, logo rules, and visual dos/don’ts.
    Delivery includes source files (PSD/AI) and optimized PNGs or SVGs for multiple use-cases.
  `,
};
