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
    { description: "SEO Optimization", quantity: 1, rate: 0, gst: "18%" },
    {
      description: "Social Media Management",
      quantity: 1,
      gst: "18%",
      rate: 0,
    },
    {
      description: "Google Ads Setup & Management",
      quantity: 1,
      gst: "18%",
      rate: 0,
    },
  ],
  "CRM / ERP Solutions": [
    { description: "Lead Management Module", quantity: 1, gst: "18%", rate: 0 },
    {
      description: "Pipeline & Automation Setup",
      quantity: 1,
      gst: "18%",
      rate: 0,
    },
  ],
  "Custom App Development": [
    { description: "Backend Development", quantity: 1, gst: "18%", rate: 0 },
    { description: "User Training", quantity: 1, gst: "18%", rate: 0 },
    { description: "Module Integration", quantity: 1, gst: "18%", rate: 0 },
  ],
  "E-Commerce Website": [
    { description: "Product Catalog Setup", quantity: 1, gst: "18%", rate: 0 },
    {
      description: "Payment Gateway Integration",
      quantity: 1,
      gst: "18%",
      rate: 0,
    },
    {
      description: "Admin Panel & Order Management",
      quantity: 1,
      gst: "18%",
      rate: 0,
    },
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
    { description: "Marketing Collaterals", quantity: 1, gst: "18%", rate: 0 },
    { description: "Digital Design", quantity: 1, gst: "18%", rate: 0 },
  ],
  "Project Management": [
    { description: "planning and design", quantity: 1, gst: "18%", rate: 0 },
    { description: "monitering and control", quantity: 1, gst: "18%", rate: 0 },
    { description: "execution and closure", quantity: 1, gst: "18%", rate: 0 },
  ],
  Campaigns: [
    { description: "PPC and SEM", quantity: 1, gst: "18%", rate: 0 },
    { description: "Promotional Campaign", quantity: 1, gst: "18%", rate: 0 },
    {
      description: "Lead Generation Campaign",
      quantity: 1,
      gst: "18%",
      rate: 0,
    },
  ],
  "Photoshoot & Video Production": [
    { description: "Photoshoot", quantity: 1, rate: 0, gst: "18%" },
    { description: "Video Production", quantity: 1, rate: 0, gst: "18%" },
  ],

  "Video Editing & Creative Enhancements": [
    { description: "Editing", quantity: 1, rate: 0, gst: "18%" },
    { description: "Creative Enhancements", quantity: 1, rate: 0, gst: "18%" },
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

  "Photoshoot & Video Production": `
    Our Photoshoot & Video Production package is designed to professionally showcase your brand, products, or events.
    - **Photoshoot**: High-quality photos tailored to your brand and marketing needs.
    - **Video Production**: Cinematic video shoots from concept to capture, ensuring every frame reflects quality and creativity.
    You’ll receive content ready for marketing, social media, and presentations.
  `,

  "Video Editing & Creative Enhancements": `
    Our Video Editing & Creative Enhancements package transforms raw footage into compelling visual stories.
    - **Editing**: Includes transitions, subtitles, voice-overs, and branding elements.
    - **Creative Enhancements**: Special edits for reels, promos, and social media content that stand out.
    You’ll get polished, shareable videos that engage your audience effectively.
  `,

  "Custom App Development": `
    Our ERP development services streamline your operations through customized, modular enterprise solutions.
    - **Backend Development**: Scalable server-side logic using modern stacks (Node.js/Django), integrated with database architecture.
    - **User Training**: Hands-on training sessions for your team to ensure smooth adoption and usage of ERP modules.
    - **Module Integration**: Seamless connection of finance, HR, inventory, and custom modules with real-time syncing and reporting.
    This includes cloud deployment, role-based access control, and long-term support.
  `,

  "Project Management": `
    Our Project Management package is designed to ensure successful planning, execution, and closure of projects.
    - **Planning and Design**: Define project scope, objectives, and roadmap for efficient execution.
    - **Monitoring and Control**: Track progress, manage risks, and ensure quality standards are met.
    - **Execution and Closure**: Implement the plan, complete deliverables, and formally close the project with reviews.
    You’ll benefit from structured workflows, timely delivery, and optimized resource utilization.
  `,

  "CRM / ERP Solutions": `
    Our CRM / ERP Solutions package provides custom-built systems to manage customer relationships, sales, inventory, and operations—all in one platform.
    - **CRM Management**: Organize and manage customer relationships effectively.
    - **ERP Implementation**: Streamline business processes including sales, inventory, and operations.
    - **Workflow Automation**: Automate repetitive tasks for efficiency and accuracy.
    You’ll benefit from real-time analytics, improved operational efficiency, and better decision-making.
  `,
  "Graphic Design": `
    Our Graphic Design package delivers creative visual designs tailored for branding, marketing, and digital platforms.
    - **Logo Design**: Unique and professional logos representing your brand identity.
    - **Marketing Collaterals**: Posters, brochures, social media creatives, and more.
    - **Digital Design**: Custom graphics for websites, social media, and online campaigns.
    You’ll receive visually captivating designs that communicate your brand effectively.
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
};
