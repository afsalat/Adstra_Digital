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
    { description: "Search Engine Optimization (On-page & Off-page)", quantity: 1, rate: 12000, gst: "18%" },
    { description: "Social Media Strategy & Content Creation (12 Posts/mo)", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Google & Meta Ads Setup & Performance Optimization", quantity: 1, rate: 10000, gst: "18%" },
  ],

  "Social Media Marketing": [
    { description: "Monthly Social Media Content Calendar (Reels, Carousels & Posts)", quantity: 1, rate: 18000, gst: "18%" },
    { description: "Meta Ads (Instagram & Facebook) Campaign Management", quantity: 1, rate: 12000, gst: "18%" },
    { description: "Profile Optimization (Bio, Highlights, Links, SEO)", quantity: 1, rate: 5000, gst: "18%" },
  ],

  "Lead Generation & Performance Ads": [
    { description: "High-Converting Custom Landing Page Design & Funnel Setup", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Multi-Channel Paid Ads Funnel (Meta, Google & YouTube)", quantity: 1, rate: 20000, gst: "18%" },
    { description: "CRM Lead Automation & WhatsApp Auto-Responder Flow", quantity: 1, rate: 10000, gst: "18%" },
  ],

  "Website Design & Development": [
    { description: "UI/UX Wireframing & Responsive Custom Design", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Modern Web Frontend Development (Next.js / React)", quantity: 1, rate: 25000, gst: "18%" },
    { description: "Backend Integration, Dynamic CMS & Speed Optimization", quantity: 1, rate: 15000, gst: "18%" },
  ],

  "E-Commerce Website": [
    { description: "E-Commerce Store Setup & Product Catalog Configuration", quantity: 1, rate: 25000, gst: "18%" },
    { description: "Payment Gateway, Shipping API & Invoice Automation", quantity: 1, rate: 10000, gst: "18%" },
    { description: "Admin Dashboard, Inventory Tracking & Coupon Engine", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Mobile-First Conversion Rate Optimization (CRO)", quantity: 1, rate: 10000, gst: "18%" },
  ],

  "Mobile App Development": [
    { description: "Mobile App UI/UX Design System & Interactive Prototypes", quantity: 1, rate: 25000, gst: "18%" },
    { description: "Cross-Platform Mobile App (Flutter / React Native - iOS & Android)", quantity: 1, rate: 65000, gst: "18%" },
    { description: "Scalable Backend REST API & Cloud Database Architecture", quantity: 1, rate: 25000, gst: "18%" },
    { description: "Apple App Store & Google Play Store Publishing & CI/CD", quantity: 1, rate: 10000, gst: "18%" },
  ],

  "CRM / ERP Solutions": [
    { description: "Business Process Mapping & Architecture Consultation", quantity: 1, rate: 25000, gst: "18%" },
    { description: "Sales Pipeline & Lead Management CRM Module", quantity: 1, rate: 35000, gst: "18%" },
    { description: "Billing, Tax Invoicing & Inventory Management System", quantity: 1, rate: 35000, gst: "18%" },
    { description: "User Roles, Permissions & Team Training Sessions", quantity: 1, rate: 15000, gst: "18%" },
  ],

  "Branding & Identity Design": [
    { description: "Primary Logo Design (3 Concepts, Scalable Vectors & Color Codes)", quantity: 1, rate: 12000, gst: "18%" },
    { description: "Brand Identity Manual (Typography, Palette & Usage Guidelines)", quantity: 1, rate: 10000, gst: "18%" },
    { description: "Brand Stationery (Business Cards, Letterhead & Social Media Kit)", quantity: 1, rate: 8000, gst: "18%" },
  ],

  "Graphic Design": [
    { description: "Marketing Collateral Design (Flyers, Brochures & Pitch Decks)", quantity: 1, rate: 8000, gst: "18%" },
    { description: "Monthly Social Media Graphics Package (15 Creatives)", quantity: 1, rate: 12000, gst: "18%" },
    { description: "Packaging & Print Production Ready Assets", quantity: 1, rate: 10000, gst: "18%" },
  ],

  "Photoshoot & Video Production": [
    { description: "Commercial Brand & Product Photography (Full Day Studio/Location)", quantity: 1, rate: 25000, gst: "18%" },
    { description: "Cinematic Corporate / Promo Video Production & Direction", quantity: 1, rate: 35000, gst: "18%" },
    { description: "Drone & 4K Aerial Videography with Licensed Pilot", quantity: 1, rate: 15000, gst: "18%" },
  ],

  "Video Editing & Creative Enhancements": [
    { description: "Social Media Reels / TikToks / Shorts Editing (Pack of 10)", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Commercial Video Post-Production, Color Grading & Sound Mix", quantity: 1, rate: 20000, gst: "18%" },
    { description: "Custom Motion Graphics, Lower Thirds & Animated Titles", quantity: 1, rate: 10000, gst: "18%" },
  ],

  "SEO & Search Optimization": [
    { description: "Comprehensive Technical SEO & Core Web Vitals Audit", quantity: 1, rate: 10000, gst: "18%" },
    { description: "On-Page SEO, Content Optimization & Schema Markup", quantity: 1, rate: 12000, gst: "18%" },
    { description: "High-Authority Backlink Acquisition & Monthly Keyword Tracking", quantity: 1, rate: 15000, gst: "18%" },
  ],

  "Content Marketing & Copywriting": [
    { description: "SEO Blog Articles & Industry Thought Leadership (4 Articles/mo)", quantity: 1, rate: 10000, gst: "18%" },
    { description: "High-Converting Website Copywriting (5 Core Pages)", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Email Marketing Sequences & Newsletter Campaign Setup", quantity: 1, rate: 8000, gst: "18%" },
  ],

  "Website Maintenance & AMC": [
    { description: "High-Speed Managed Cloud Server Hosting, SSL & CDN Setup", quantity: 1, rate: 8000, gst: "18%" },
    { description: "Monthly Security Audits, Daily Backups & Core Plugin Updates", quantity: 1, rate: 12000, gst: "18%" },
    { description: "Dedicated Technical Support & Performance Monitoring (24/7)", quantity: 1, rate: 5000, gst: "18%" },
  ],

  "Influencer Marketing & PR": [
    { description: "Influencer Identification, Outreach & Contract Negotiations", quantity: 1, rate: 20000, gst: "18%" },
    { description: "Campaign Strategy, Creative Briefs & Deliverables Quality Check", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Digital PR Distribution Across Regional & National Media", quantity: 1, rate: 15000, gst: "18%" },
  ],

  "Custom App Development": [
    { description: "Technical Architecture & System Requirements Specification", quantity: 1, rate: 20000, gst: "18%" },
    { description: "Enterprise Core Backend Development & RESTful APIs", quantity: 1, rate: 45000, gst: "18%" },
    { description: "Cloud Infrastructure Setup, Dockerization & CI/CD Pipeline", quantity: 1, rate: 15000, gst: "18%" },
  ],

  "Project Management": [
    { description: "Agile Project Planning, Sprint Milestones & Scope Roadmap", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Dedicated Scrum Master, QA Testing & Weekly Progress Reports", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Production Deployment, User Handover & Training Documentation", quantity: 1, rate: 10000, gst: "18%" },
  ],

  Campaigns: [
    { description: "High-ROI PPC Campaign Setup (Google Search & Shopping Ads)", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Seasonal Festival / Product Launch Promotional Campaign", quantity: 1, rate: 15000, gst: "18%" },
    { description: "Full-Funnel Retargeting & Lead Generation Campaign", quantity: 1, rate: 12000, gst: "18%" },
  ],
};

export const serviceExtraDetails = {
  "Digital Marketing": `
    Our Digital Marketing package is engineered to accelerate brand visibility, drive qualified organic search traffic, and capture high-intent leads.
    - **Search Engine Optimization (SEO)**: In-depth technical site audit, on-page optimization, meta tags, structured data schema, and authoritative backlink acquisition.
    - **Social Media Marketing**: Engaging brand communication across Instagram, LinkedIn, and Facebook with monthly content calendars.
    - **Paid Search & Display**: Targeted Google Ads and Meta ad campaigns with pixel tracking, audience segmentation, and weekly ROI reporting.
    Deliverables include monthly performance analytics, strategic review calls, and search ranking progress tracking.
  `,

  "Social Media Marketing": `
    Comprehensive social media management and creative storytelling to grow your community, improve brand loyalty, and drive conversions.
    - **Content Production**: High-impact reels, carousel graphics, motion shorts, and promotional posts tailored to your brand identity.
    - **Targeted Paid Advertising**: Paid ad setup on Meta (Instagram/Facebook) and YouTube to maximize reach, engagement, and click-throughs.
    - **Social Media Optimization (SMO)**: Complete profile redesign, bio optimization, highlighted story covers, and hashtag strategy.
    Includes weekly content scheduling, audience comment management, and actionable monthly insights.
  `,

  "Lead Generation & Performance Ads": `
    Data-driven, ROI-focused performance marketing designed to generate qualified business inquiries, bookings, and revenue.
    - **Conversion-Centric Landing Pages**: High-speed, mobile-responsive landing pages crafted specifically for maximum conversion rates.
    - **Multi-Channel Ad Campaigns**: Advanced ad targeting across Google Search, Meta, and YouTube with custom audience personas and A/B ad copy testing.
    - **Automated Lead Management**: Direct integration with your CRM, automated email notifications, and instant WhatsApp response flows.
    Guaranteed low Cost Per Lead (CPL) and transparent live analytics dashboard.
  `,

  "Website Design & Development": `
    Modern, lightning-fast, and responsive web solutions tailored to elevate your business presence and drive conversions.
    - **Custom UI/UX Architecture**: Crafted in Figma with clean wireframes, mobile-first layouts, and accessible design principles.
    - **Cutting-Edge Development**: Developed using Next.js/React or WordPress with semantic HTML5, animations, and high security.
    - **Search & Speed Optimization**: 95+ Google PageSpeed score, integrated schema markup, SSL encryption, and contact forms.
    Includes domain setup, hosting configuration, cross-browser compatibility testing, and CMS training.
  `,

  "E-Commerce Website": `
    Full-featured, conversion-optimized online store designed for seamless shopping experiences and scalable commercial operations.
    - **Product Catalog & Categorization**: Unlimited product listings, SKU variants, inventory stock alerts, and customer review modules.
    - **Secure Payment & Shipping**: Razorpay, Stripe, and COD integrations with automated courier logistics and tracking updates.
    - **Comprehensive Merchant Dashboard**: Order tracking, coupon discounts, abandoned cart recovery, and tax invoice generation.
    Mobile-optimized checkout and PWA-ready capabilities for app-like speed.
  `,

  "Mobile App Development": `
    Enterprise-grade native and cross-platform mobile application development for iOS and Android.
    - **Intuitive Mobile UX/UI**: Clean gesture navigation, dark/light themes, and platform-specific design guidelines.
    - **Cross-Platform Engineering**: Single codebase Flutter/React Native development ensuring native performance, 60fps animations, and lower maintenance costs.
    - **Backend & Cloud Architecture**: Real-time Firebase or Django REST APIs, secure user authentication, push notifications, and payment gateways.
    Complete support for App Store and Google Play Store review, compliance, and deployment.
  `,

  "CRM / ERP Solutions": `
    Tailor-made Enterprise Resource Planning and Customer Relationship Management platforms to unify your business operations.
    - **Sales & Pipeline Management**: Track leads from first inquiry to closed deal with automated follow-up reminders and stage tracking.
    - **Operational Modules**: Integrated inventory, vendor management, HR/payroll tracking, and GST billing.
    - **Role-Based Permissions**: Granular data access, multi-branch support, and executive visual analytics dashboards.
    Includes hands-on staff onboarding, user documentation, and long-term technical support.
  `,

  "Branding & Identity Design": `
    Strategic brand design that transforms business concepts into memorable, recognizable, and emotionally resonant market leaders.
    - **Core Logo Suite**: Primary, secondary, and icon mark logos with vector source files (AI, SVG, PDF, PNG) for print and digital.
    - **Comprehensive Style Guide**: Defined color palette codes (CMYK, RGB, HEX), typography hierarchy, and brand voice rules.
    - **Marketing Collateral Kit**: Business cards, letterhead, corporate presentation decks, and social media template kits.
    Complete ownership transfer with high-resolution production assets.
  `,

  "Graphic Design": `
    High-end graphic design services for print, digital advertising, and enterprise communication.
    - **Marketing Collaterals**: Flyers, tri-fold brochures, product catalogs, roll-up banners, and corporate profiles.
    - **Digital Campaign Assets**: Social media graphics, website hero banners, display network ad banners, and infographics.
    - **Packaging & Print Production**: Print-ready CMYK deliverables with die-cut guidelines and material finish recommendations.
  `,

  "Photoshoot & Video Production": `
    In-house commercial media production to capture your products, facilities, and brand stories in cinematic clarity.
    - **Commercial Brand Photography**: High-end studio lighting, product macro photography, and on-location executive team portraits.
    - **Cinematic Commercials & Promos**: Full HD/4K corporate films, brand manifestos, facility tours, and product demonstration videos.
    - **Aerial & Drone Shoots**: Certified drone videography providing breathtaking perspectives of real estate, events, and venues.
    End-to-end production including scriptwriting, storyboarding, directing, and post-production.
  `,

  "Video Editing & Creative Enhancements": `
    Professional post-production services turning raw footage into viral, attention-grabbing visual assets.
    - **Short-Form Content**: Fast-paced, trending edits for Instagram Reels, YouTube Shorts, and TikTok with dynamic subtitles and sound effects.
    - **Corporate Video Finishing**: Master color grading, audio leveling, background score licensing, and motion graphics.
    - **Visual Effects & Animation**: 3D logo reveals, title lower thirds, transitions, and product callout animations.
  `,

  "SEO & Search Optimization": `
    Data-backed search engine optimization to establish long-term organic authority and dominate keyword rankings on Google.
    - **Technical Architecture Fixes**: Crawl budget optimization, XML sitemaps, robots.txt, Canonical tags, and Core Web Vitals remediation.
    - **Strategic Keyword Targeting**: High-intent commercial keywords, competitor gap analysis, and content cluster architecture.
    - **Safe White-Hat Link Building**: Quality editorial backlinks, guest placements, local citations, and Google Business Profile optimization.
  `,

  "Content Marketing & Copywriting": `
    Persuasive, SEO-optimized copywriting that educates prospects, establishes authority, and inspires action.
    - **SEO Articles & Thought Leadership**: Long-form, research-backed blog posts optimized for primary and semantic keywords.
    - **Conversion Website Copy**: Compelling headlines, value propositions, feature-benefit breakdowns, and persuasive calls-to-action.
    - **Email Sequences**: Welcome onboarding series, lead nurture drip campaigns, and promotional broadcast templates.
  `,

  "Website Maintenance & AMC": `
    Dedicated annual maintenance and cloud hosting support to guarantee 99.9% uptime, airtight security, and fast loading speeds.
    - **Managed Cloud Hosting**: High-speed SSD servers, global Cloudflare CDN, auto-renewing SSL certificates, and firewall protection.
    - **Proactive Maintenance**: Weekly CMS and plugin updates, database defragmentation, and off-site cloud backups.
    - **Priority Bug Fixes**: Fast-response technical support for troubleshooting, layout tweaks, and content additions.
  `,

  "Influencer Marketing & PR": `
    End-to-end influencer marketing campaigns and digital PR to build massive trust and reach targeted demographics.
    - **Creator Matchmaking**: Selecting verified micro and macro influencers aligned with your brand niche and audience geography.
    - **Campaign Orchestration**: Contract management, deliverable timelines, product gifting, and UTM tracking links.
    - **Digital PR Releases**: Featured publications and news syndications across leading online media outlets.
  `,

  "Custom App Development": `
    Full-stack custom software development addressing complex business workflows and enterprise data needs.
    - **System Architecture**: Scalable microservices or modular monoliths utilizing Node.js, Python/Django, and PostgreSQL.
    - **Modern Frontend Interfaces**: Responsive web applications engineered with Next.js, TypeScript, and state management.
    - **Cloud Deployment & DevOps**: Automated CI/CD pipelines, Docker containerization, and AWS/GCP cloud setup.
  `,

  "Project Management": `
    Professional agile project management ensuring your technology and marketing initiatives are delivered on time and within budget.
    - **Sprint Roadmap & Milestones**: Detailed Gantt charts, user story backlogs, and risk management matrices.
    - **Quality Assurance & Testing**: Strict functional testing, cross-device QA, and security validation before every release.
    - **Executive Reporting**: Weekly stakeholder reviews, transparent burn-down charts, and change-request tracking.
  `,

  Campaigns: `
    High-impact seasonal and promotional ad campaigns built to generate massive momentum for new launches and milestone sales.
    - **Search & Display Blitz**: Multi-channel ad bursts across Google Search, Google Shopping, Meta, and YouTube.
    - **Promo Landing Pages**: Limited-time offer pages with countdown timers, dynamic coupon codes, and high-urgency checkout flows.
    - **Full Retargeting Funnels**: Re-engaging past visitors and cart abandoners with dynamic product ads and custom offers.
  `,
};
