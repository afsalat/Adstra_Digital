import React, { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./ServiceDetail.css";
import { useParams } from "react-router-dom";

const serviceSections = [
  {
    title: "In-House Professional Photography & Video Production",
    slug: "video-production",
    metaTitle:
      "Best In-House Video Production Services in Wayanad & Kozhikode | AdstraDigital",
    metaDescription:
      "Get impactful brand videos with AdstraDigital's in-house video production team. From concept to post-production, we offer video editing and brand storytelling services across Kerala.",
    tagline: "Lights. Camera. Brand Impact.",
    intro:
      "At AdstraDigital, we believe that powerful stories build powerful brands. Our in-house professional photography and video production team brings your brand to life through stunning visuals, crisp editing, and compelling storytelling.",
    overview:
      "Whether you're a startup in Kozhikode, an established brand in Wayanad, or a national business looking for video editing services in India, we provide end-to-end video solutions tailored for your growth.",
    image: "https://adstradigital.com/media/services/studio.jpg",
    services: [
      {
        title: "Brand Video Production",
        description:
          "Professionally crafted brand videos that connect emotionally and reflect your mission and voice.",
      },
      {
        title: "Product & Service Demos",
        description:
          "Clear, informative, and high-quality demos showcasing your product features and benefits.",
      },
      {
        title: "Testimonial & Interview Videos Editing",
        description:
          "Authentic customer stories and expert interviews filmed with professional lighting and sound.",
      },
      {
        title: "Event Coverage & Reels Editing",
        description:
          "HD coverage of corporate events and launches, formatted for social media.",
      },
      {
        title: "Post-Production & Video Editing",
        description:
          "Transitions, audio mixing, color grading, and visual enhancements for final video polish.",
      },
    ],
    benefits: [
      "In-House Creative Team – No outsourcing; our expert cinematographers and editors work with your brand directly.",
      "End-to-End Service – From scripting and shooting to editing and publishing, everything in one place.",
      "Optimized for All Platforms – Reels, YouTube videos, promos — all formats supported.",
      "Results-Driven – Every video is crafted to convert viewers into loyal customers.",
      "Professional Video Editing – VFX, transitions, music sync, and storytelling tailored to your brand.",
    ],
    cta: {
      headline: "Let’s Tell Your Story Visually",
      subtext:
        "From promo reels and product shoots to cinematic brand stories, we deliver visuals that educate, entertain, and elevate.",
      note: "Serving: Kozhikode | Wayanad | Kerala | Pan-India",
      button: "Book a Free Consultation",
    },
  },
  {
    title: "Social Media Marketing & Campaigns",
    slug: "social-media-marketing",
    metaTitle: "Social Media Marketing Company | AdstraDigital",
    metaDescription:
      "Boost your brand with Kerala’s leading Social Media Marketing agency. AdstraDigital offers powerful campaigns, strategy & SMO packages for startups & brands",
    tagline: "Social Media Marketing & Campaigns That Convert",
    intro:
      "Grow Your Brand on the Platforms That Matter. Whether you’re launching a new product, building community, or running lead generation campaigns — social media is where your audience lives. At AdstraDigital, we don’t just post content — we build brand stories, drive engagement, and deliver real results through tailored Social Media Marketing (SMM) services.",
    overview:
      "Our data-driven campaigns help brands stand out, stay consistent, and sell more.",
    image: "https://adstradigital.com/media/services/SocialMedia.jpg",
    services: [
      {
        title: "Social Media Strategy & Planning",
        description:
          "We define your voice, audience, and campaign roadmap with clear monthly calendars.",
      },
      {
        title: "Creative Design & Content",
        description:
          "We craft eye-catching visuals, carousel posts, ad creatives, and reels tailored to your audience.",
      },
      {
        title: "Social Media Consultancy",
        description:
          "We analyze your brand positioning, industry trends, and audience behavior to create customized plans.",
      },
      {
        title: "Social Media Campaigns",
        description:
          "From lead-gen to awareness — we build, run, and optimize ads that perform on Meta, Google, and YouTube.",
      },
      {
        title: "SMO: Social Media Optimization",
        description:
          "We optimize bios, CTAs, highlights, and hashtags to improve discoverability and brand authority.",
      },
      {
        title: "Paid Ads (SEM) & Retargeting",
        description:
          "With precise targeting, we make sure your message reaches and retargets the right people.",
      },
      {
        title: "Weekly Insights & Reporting",
        description:
          "Track your growth, impressions, and ROI with performance updates you can act on.",
      },
    ],
    benefits: [
      "Platform-Specific Strategy (FB, Insta, LinkedIn, YouTube, Pinterest)",
      "High-Quality Creatives + Reels + Motion Graphics",
      "Targeted Campaigns with Paid Ads (SEM, Meta, YouTube)",
      "Social Media Optimization (SMO) for Organic Growth",
      "Weekly Reporting + Performance Insights",
      "Affordable Social Media Packages for all business sizes",
    ],
    cta: {
      headline: "Ready to Boost Your Brand Online?",
      subtext:
        "Let’s create social media content that connects and campaigns that convert.",
      note: "Call us today or book your free social audit.",
      button: "Book Your Free Audit",
    },
  },
  {
    title: "Lead Generation & Performance Marketing",
    slug: "lead-generation-performance-marketing",
    metaTitle:
      "Best Lead Generation & Performance Marketing Company in Kengeri & Wayanad",
    metaDescription:
      "AdstraDigital helps you get high-quality leads & measurable results. Trusted Lead Generation & Performance Marketing agency in Kerala.",
    tagline:
      "Lead Generation & Performance Marketing That Drives Real Business Growth",
    intro:
      "Want to stop wasting ad budgets and start generating qualified leads that convert? At AdstraDigital, we specialize in performance-driven marketing campaigns that align with your goals—whether it's generating inquiries, appointments, or direct sales.",
    overview:
      "Our team blends targeted ad campaigns, funnel optimization, and smart analytics to turn interest into action.",
    image: "https://adstradigital.com/media/services/leadgeneration.webp",
    services: [
      {
        title: "Targeted Lead Generation",
        description:
          "We use Google Ads, Meta Ads & YouTube lead forms with CRM-integrated landing pages and email/remarketing flows to capture qualified leads.",
      },
      {
        title: "Performance Marketing",
        description:
          "We execute ROI-focused campaigns across Meta, Google, LinkedIn, and YouTube with A/B testing and weekly optimizations.",
      },
      {
        title: "Audience Research",
        description:
          "We define your ideal customer persona using industry tools and data insights.",
      },
      {
        title: "Custom Funnel Building",
        description:
          "We create full-funnel strategies with conversion tracking, lead capture pages, and retargeting.",
      },
      {
        title: "Campaign Optimization",
        description:
          "We monitor CPL, ROAS, and engagement metrics to continuously refine ad performance and results.",
      },
    ],
    benefits: [
      "Expertise in Generating Leads Across Industries",
      "Customized Solutions Based on Brand Goals & Budgets",
      "Data-Driven Campaigns for Higher ROI",
      "Scalable Strategies for Local & National Reach",
      "Low-Cost Per Lead with High Quality",
      "Conversion-Centric Ad Creatives & Landing Pages",
      "Live Reporting Dashboards & Weekly Insights",
      "CRM Integration & Marketing Automation",
      "360° Follow-Up Strategy via WhatsApp, Email & SMS",
    ],
    cta: {
      headline: "Ready to Grow?",
      subtext:
        "Whether you're looking to book more calls, sell more products, or generate B2B leads, AdstraDigital builds scalable strategies tailored to your needs.",
      note: "Contact us to discuss your campaign goals today.",
      button: "Book a Strategy Call",
    },
  },
  {
    title: "Branding & Identity Design",
    slug: "branding-identity-design",
    metaTitle:
      "Best Branding & Identity Design Agency | Kozhikode | Kengeri | Wayanad",
    metaDescription:
      "Looking for a professional logo and brand design in Sulthan Bathery or Kozhikode? AdstraDigital offers strategic branding services across Kerala and India. Build a brand that connects.",
    tagline: "Build Brands That Speak, Connect & Convert",
    intro:
      "At AdstraDigital, we don’t just create logos—we build identities that leave lasting impressions. Whether you're a startup in Sulthan Bathery, a retail chain in Kengeri, or a national brand looking to evolve, our branding & identity design services are tailored to create recognizable, memorable, and profitable brands.",
    overview:
      "In today’s crowded market, a compelling brand is more than just a logo. It's your voice, your story, and the emotion people associate with your business. We help you define and design your entire brand personality—so you stand out on every channel, from social media to store shelves.",
    image: "https://adstradigital.com/media/services/branding.jpg",
    services: [
      {
        title: "Logo Design & Visual Identity",
        description:
          "Clean, scalable, and distinct logo creation that reflects your business vision and values.",
      },
      {
        title: "Brand Guidelines",
        description:
          "Cohesive brand manuals including font, color palette, tone, and imagery to ensure consistency across platforms.",
      },
      {
        title: "Brand Positioning & Messaging",
        description:
          "Compelling taglines, tone-of-voice, and messaging strategies that connect with your target audience.",
      },
      {
        title: "Rebranding Services",
        description:
          "Audit and reposition your brand to better fit modern markets and connect with your audience.",
      },
      {
        title: "Marketing Collateral Design",
        description:
          "Designs for brochures, business cards, pitch decks, packaging, and more—aligned with your brand identity.",
      },
    ],
    benefits: [
      "Creative + Strategic Approach to Branding",
      "In-House Team of Designers & Copywriters",
      "Brand Consistency Across All Platforms",
      "Multi-Industry Experience from Local to National Brands",
      "Identity That Reflects Vision, Values, and Voice",
    ],
    cta: {
      headline: "Ready to Build a Brand That Wins?",
      subtext:
        "Let’s build more than a brand—let’s build a legacy with AdstraDigital.",
      note: "Serving businesses in Kozhikode, Wayanad, Kengeri & across India.",
      button: "Book Your Free Branding Consultation",
    },
  },
  {
    title: "SEO & Website Optimization",
    slug: "seo-website-optimization",
    metaTitle: "Top SEO Agency in Kengeri, Bangalore & Wayanad | AdstraDigital",
    metaDescription:
      "Looking for trusted SEO services near you? AdstraDigital is the best SEO agency in Kengeri & Wayanad. We deliver local SEO, on-page SEO, and complete website optimization for business growth.",
    tagline:
      "Boost Your Business Visibility with Proven SEO & Website Optimization",
    intro:
      "At AdstraDigital, we help your brand stand out where your customers are searching. Our SEO strategies are built to rank your website higher, attract quality leads, and increase conversions.",
    overview:
      "Whether you're in Kengeri, Wayanad, or anywhere in Kerala, showing up on the first page of search results builds credibility, traffic, and trust. With personalized SEO strategies, we improve your ranking across Google and other search engines through a mix of content, technical fixes, and link building.",
    image: "https://adstradigital.com/media/services/seo.jpg",
    services: [
      {
        title: "Local SEO",
        description:
          "Optimize Google Business Profile, local citations, and reviews to boost visibility in your region.",
      },
      {
        title: "On-Page SEO",
        description:
          "Keyword-rich content, alt tags, schema, and internal linking for better page-level optimization.",
      },
      {
        title: "Technical SEO",
        description:
          "Fix crawl issues, improve mobile performance, and ensure search engines can index your site properly.",
      },
      {
        title: "Off-Page SEO & Link Building",
        description:
          "Earn quality backlinks through guest posts, directories, digital PR, and influencer collaborations.",
      },
      {
        title: "Website Optimization",
        description:
          "Enhance site speed, improve UX/UI, ensure responsive design, and implement structured data.",
      },
      {
        title: "E-commerce SEO",
        description:
          "Optimize product pages, filters, and categories, with structured data and customer review integrations.",
      },
    ],
    benefits: [
      "Higher Google Rankings & Increased Visibility",
      "More Organic Traffic from Relevant Audiences",
      "Better Conversion Rates Through UX & Speed",
      "Mobile-First & Voice-Search Ready SEO",
      "Measurable ROI from Data-Driven Campaigns",
    ],
    cta: {
      headline: "Let’s Optimize Your Website for Growth",
      subtext: "Ready to attract more leads and get ranked where it matters?",
      note: "Contact our SEO experts today for a Free Website SEO Audit",
      button: "Get My Free SEO Audit",
    },
  },
  {
    title: "Analytics & Reporting",
    slug: "analytics-reporting",
    metaTitle: "Analytics & Reporting for Digital Campaigns | AdstraDigital",
    metaDescription:
      "Track what truly matters. AdstraDigital offers expert analytics and reporting for social media performance, paid campaigns, website traffic, and lead generation.",
    tagline: "Data-Driven Digital Growth Starts Here",
    intro:
      "At AdstraDigital, we believe that you can’t grow what you don’t measure. That’s why every campaign—whether it's SEO, paid advertising, or social media—is backed by solid analytics and performance reporting. We help you understand what’s working, what’s not, and where your biggest opportunities lie.",
    overview:
      "From social insights to traffic funnels, we give you actionable data that drives better decisions and higher returns across your digital marketing channels. Our team builds reports that cut the fluff and focus on your KPIs.",
    image: "https://adstradigital.com/media/services/analytics.jpg",
    services: [
      {
        title: "Social Media Performance",
        description:
          "Track reach, engagement, story/reels insights, and platform-specific performance across Instagram, Facebook, LinkedIn, and YouTube.",
      },
      {
        title: "Paid Campaign Reporting",
        description:
          "Measure ROI, CPL, ROAS, CTR, A/B test results, and funnel behavior for campaigns on Google, Meta, and YouTube.",
      },
      {
        title: "Website Traffic Analysis",
        description:
          "Understand visitor behavior with metrics like heatmaps, bounce rates, top keywords, conversion paths, and exit points.",
      },
      {
        title: "Lead Generation Insights",
        description:
          "See where leads come from, which channels convert best, and how landing pages and CRMs are performing.",
      },
    ],
    benefits: [
      "Identify which strategies to scale or stop",
      "Make decisions based on real-time data",
      "Improve your ROI with targeted optimization",
      "Understand user behavior trends clearly",
      "Align sales and marketing with better insights",
    ],
    cta: {
      headline: "Let’s Make Your Marketing Measurable",
      subtext:
        "From startups to ecommerce brands, we offer custom analytics dashboards and reporting that align with your KPIs.",
      note: "Includes weekly reports, monthly review calls, and interactive dashboards.",
      button: "Contact Us for Reporting Demo",
    },
  },
  {
    title: "Content Marketing & Storytelling",
    slug: "content-marketing",
    metaTitle:
      "Best Content Marketing Agency in Wayanad & Kozhikode | AdstraDigital",
    metaDescription:
      "Fuel your brand with high-performing content. AdstraDigital offers storytelling-led content marketing services in Kozhikode (Calicut) & Wayanad to boost visibility, trust & leads.",
    tagline: "Craft Stories That Connect, Content That Converts",
    intro:
      "At AdstraDigital, we don’t just write content—we create narratives that spark action. Whether you’re a startup or a scaling brand, our content marketing services in Kozhikode & Wayanad help you build authority, drive organic traffic, and earn customer loyalty.",
    overview:
      "Content marketing in 2025 is more than writing—it's about connection. From blog strategies and brand storytelling to funnel content and SEO-rich articles, we fuel your brand with creative, search-optimized, and customer-centric content.",
    image: "https://adstradigital.com/media/services/contentmarketing.jpg",
    services: [
      {
        title: "Content Strategy & Planning",
        description:
          "We audit your voice, audience, and goals to create a monthly or quarterly content roadmap that aligns with your niche.",
      },
      {
        title: "Blog & SEO Article Writing",
        description:
          "Keyword-rich, insightful blogs that rank on Google, answer queries, and drive conversions.",
      },
      {
        title: "Storytelling & Brand Narratives",
        description:
          "Shape your unique brand voice and share compelling stories across digital platforms.",
      },
      {
        title: "Social Media Content",
        description:
          "Captions, infographics, reels, and carousels crafted for engagement and brand consistency.",
      },
      {
        title: "Email & Funnel Content",
        description:
          "Sales sequences, nurturing emails, and automated flows that move users through your funnel.",
      },
      {
        title: "Website & Landing Page Copywriting",
        description:
          "UX-optimized and SEO-friendly content for higher conversions and a stronger digital presence.",
      },
      {
        title: "Scriptwriting for Video Content",
        description:
          "Scripts for reels, explainers, ads, and YouTube—tailored for clarity, retention, and impact.",
      },
    ],
    benefits: [
      "Local Expertise, Global Perspective",
      "SEO + Creativity – Rank on Google and resonate with readers",
      "Data-Driven Execution with performance tracking",
      "Multilingual Writing – English, Malayalam, and more",
      "Industry-Tailored Solutions – Fashion, healthcare, tourism, tech, and beyond",
    ],
    cta: {
      headline: "Ready to Share Your Brand Story?",
      subtext:
        "From SEO blogs to brand scripts and reels, we create content that performs and persuades.",
      note: "Trusted by businesses across Kozhikode, Wayanad, and beyond.",
      button: "Book a FREE Consultation",
    },
  },
  {
    title: "Paid Advertising (PPC & Display Ads)",
    slug: "paid-advertising",
    metaTitle:
      "PPC Advertising Services | Paid Ads Agency in Wayanad & Kozhikode",
    metaDescription:
      "Get instant visibility and high-quality leads with expert PPC advertising services. AdstraDigital – a trusted PPC agency in Kengeri, Wayanad & Kozhikode.",
    tagline: "Accelerate Your Growth with High-Performance Paid Advertising",
    intro:
      "In today’s digital world, organic growth is powerful—but paid ads are your shortcut to scale. At AdstraDigital, we specialize in PPC advertising services that get your business seen by the right people—at the right time—on the right platforms.",
    overview:
      "PPC (Pay-Per-Click) is a results-focused digital ad model where you only pay for clicks. We help businesses appear on Google, Meta, YouTube, and more—driving high-quality traffic, retargeting leads, and scaling ROI with every campaign.",
    image: "https://adstradigital.com/media/services/ppc.jpg",
    services: [
      {
        title: "Google Ads Campaigns",
        description:
          "From high-intent keywords to local targeting, we handle full-funnel Google ad strategies.",
      },
      {
        title: "Display & Banner Ads",
        description:
          "Visually compelling ads designed to build brand visibility and retarget cold traffic.",
      },
      {
        title: "Meta (Facebook + Instagram) Ads",
        description:
          "Drive leads and conversions with scroll-stopping creatives and hyper-targeted social ads.",
      },
      {
        title: "Video Ads (YouTube & Reels)",
        description:
          "Capture attention with compelling short videos for YouTube, Meta, and story placements.",
      },
      {
        title: "Local Ads (GMB & Maps)",
        description:
          "Run location-based campaigns to drive foot traffic, phone calls, and local visibility.",
      },
      {
        title: "Remarketing Campaigns",
        description:
          "Reconnect with visitors who didn’t convert—via tailored, intent-driven remarketing.",
      },
    ],
    benefits: [
      "Keyword-Rich Campaign Planning – Smart targeting, not just popular terms.",
      "Cross-Platform PPC – Google, Meta, YouTube, LinkedIn, Maps, and more.",
      "Optimized Landing Pages – Built for conversions, not just clicks.",
      "ROI-Focused Strategy – From ₹5K/month to ₹50K+, we manage ad spend smartly.",
      "Transparent Reporting – Live dashboards and expert insights.",
    ],
    cta: {
      headline: "Let’s Talk Paid Growth",
      subtext:
        "Boost visibility, drive quality leads, and maximize ROI with AdstraDigital's PPC services.",
      note: "Serving: Wayanad | Kozhikode | Kengeri | Kerala | Pan-India",
      button: "Book a Paid Ad Audit",
    },
  },
  {
    title: "Google Ads – Targeted Advertising for Maximum Reach",
    slug: "google-ads",
    metaTitle:
      "Google Ads Agency in Kerala | Targeted Paid Advertising by AdstraDigital",
    metaDescription:
      "Maximize visibility and drive qualified leads with AdstraDigital’s Google Ads services. Get expert search, display, video, and remarketing campaigns tailored to your business goals.",
    tagline: "Run Smarter Google Ads with AdstraDigital",
    intro:
      "Looking to drive high-converting traffic to your website? Google Ads is one of the fastest and most effective ways to get your business in front of the right audience—exactly when they’re searching for what you offer.",
    overview:
      "At AdstraDigital, we create highly targeted, ROI-focused Google Ads campaigns that boost visibility, generate qualified leads, and turn clicks into conversions.",
    image: "https://adstradigital.com/media/services/gads.webp",
    services: [
      {
        title: "Search Ads",
        description:
          "Appear at the top of Google when users type relevant keywords. We use keyword targeting, compelling ad copy, and optimized landing pages to drive high-intent traffic.",
      },
      {
        title: "Display Ads",
        description:
          "Show visually engaging ads across the Google Display Network to build awareness and drive traffic from passive browsers.",
      },
      {
        title: "Shopping Ads",
        description:
          "Promote your products with image-based ads that appear in search results, showcasing pricing and details directly to shoppers.",
      },
      {
        title: "Video Ads (YouTube Advertising)",
        description:
          "Run skippable, non-skippable, bumper, and discovery ads on YouTube to build brand recall and generate action.",
      },
      {
        title: "Remarketing Ads",
        description:
          "Reconnect with users who visited your site but didn’t convert by showing strategic ads across Google properties.",
      },
    ],
    benefits: [
      "Certified Google Ads Specialists – Trained and experienced team managing your campaigns.",
      "Full-Funnel Strategy – Targeting every stage of the buyer journey.",
      "A/B Testing – Optimize ad creatives and CTAs for better ROI.",
      "Live Dashboards – Transparent and real-time performance tracking.",
      "Conversion-Optimized Landing Pages – Designed to turn clicks into results.",
      "Local & National Targeting – Reach users near you or across India.",
    ],
    cta: {
      headline: "Ready to Launch Ads That Convert?",
      subtext:
        "Your ideal customer is already searching on Google. Let’s make sure they find you—not your competitor.",
      note: "Serving: Kerala | Kozhikode | Wayanad | Pan-India",
      button: "Request a Google Ads Audit",
    },
  },
  {
    title: "Web Development & Design",
    slug: "web-development",
    metaTitle:
      "Web Development & Design Company in Wayanad & Kozhikode | AdstraDigital",
    metaDescription:
      "AdstraDigital offers responsive, SEO-optimized, and high-performing websites. Trusted web design agency in Sulthan Bathery, Kozhikode. Get a custom website that converts.",
    tagline: "Build a Website That Works For You",
    intro:
      "A great website is more than just a digital address—it’s your brand’s first impression, your sales machine, and your trust builder.",
    overview:
      "At AdstraDigital, we combine creative design with powerful development to create custom websites that are fast, functional, mobile-ready, and SEO-friendly. We build digital storefronts designed for visibility, engagement, and conversion.",
    image: "https://adstradigital.com/media/services/web.jpg",
    services: [
      {
        title: "Custom Website Design",
        description:
          "Visually stunning, responsive websites tailored to your brand identity and audience expectations.",
      },
      {
        title: "Front-End & Back-End Development",
        description:
          "Performance-first coding practices ensuring fast load times, secure systems, and smooth functionality.",
      },
      {
        title: "E-Commerce Website Development",
        description:
          "Conversion-driven online stores built on Shopify, WooCommerce, or custom frameworks.",
      },
      {
        title: "WordPress Development",
        description:
          "Flexible, easy-to-manage WordPress websites with custom themes, plugins, and SEO-ready architecture.",
      },
      {
        title: "UI/UX Design",
        description:
          "User journeys designed to maximize engagement, reduce bounce rate, and boost time-on-site.",
      },
      {
        title: "Website Redesign & Migration",
        description:
          "Upgrade your outdated or underperforming site with a fresh, lead-focused redesign and safe migration.",
      },
    ],
    benefits: [
      "Local Expertise – Deep understanding of regional business needs in Kerala.",
      "100% Responsive Designs – Seamless mobile and desktop experiences.",
      "Full Support – From ideation and wireframes to launch and maintenance.",
      "Conversion Focused – Every element is optimized for lead generation.",
      "Transparent Process – Weekly progress updates and dedicated support.",
    ],
    cta: {
      headline: "Let’s Build Something Great",
      subtext:
        "Your website isn’t just a tool—it’s your brand’s online identity. Let’s make it perform.",
      note: "Serving: Wayanad | Kozhikode | Sulthan Bathery | Kerala | Pan-India",
      button: "Book a Free Website Consultation",
    },
  },
];

function FullServices() {
  const { label } = useParams();
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    window.scrollTo(0, 0);
  }, [label]);

  const normalizedLabel = label?.toLowerCase();

  const formattedTitle = normalizedLabel
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const filteredServices =
    normalizedLabel === "all" || !normalizedLabel
      ? serviceSections
      : serviceSections.filter((service) => service.slug === normalizedLabel);

  const handleLearnMore = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  return (
    <div className="full-services">
      <h2 data-aos="fade-down">
        {normalizedLabel === "all" || !normalizedLabel
          ? "Our Specialized Services"
          : `Specialized Service: ${formattedTitle}`}
      </h2>

      {filteredServices.map((service, index) => (
        <Tilt
          key={index}
          glareEnable={true}
          glareMaxOpacity={0.2}
          scale={1.05}
          transitionSpeed={100}
          tiltMaxAngleX={3}
          tiltMaxAngleY={3}
          perspective={2000}
          gyroscope={true}
        >
          <div
            className="service-block"
            data-aos="fade-up"
            data-aos-delay={100}
          >
            <div className="service-content">
              <img
                src={service.image}
                alt={service.title}
                className="service-image"
              />
              <div className="service-text">
                <h3>{service.title}</h3>
                <p>{service.description || service.intro}</p>
                <ul>
                  {(service.points || service.services)
                    ?.slice(0, 3)
                    .map((item, idx) => (
                      <ul key={idx}>
                        <li>
                          {typeof item === "string" ? (
                            item
                          ) : (
                            <>
                              <strong>{item.title}:</strong> {item.description}
                            </>
                          )}
                        </li>
                      </ul>
                    ))}
                </ul>
                <button
                  className="learn-morebtn"
                  onClick={() => handleLearnMore(service)}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </Tilt>
      ))}

      {/* Modal */}
      {showModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✕
            </button>
            <h2>{selectedService.title}</h2>
            <img
              src={selectedService.image}
              alt={selectedService.title}
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            />
            <p>{selectedService.description || selectedService.intro}</p>
            <ul>
              {(selectedService.services || selectedService.points)?.map(
                (item, idx) => (
                  <li key={idx}>
                    {typeof item === "string" ? (
                      item
                    ) : (
                      <>
                        <strong>{item.title}:</strong> {item.description}
                      </>
                    )}
                  </li>
                )
              )}
            </ul>

            {/* Optional Benefits */}
            {selectedService.benefits && (
              <>
                <h4>Why Choose Us</h4>
                <ul>
                  {selectedService.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Optional CTA */}
            {selectedService.cta && (
              <div className="cta-section">
                <h4>{selectedService.cta.headline}</h4>
                <p>{selectedService.cta.subtext}</p>
                <small>{selectedService.cta.note}</small>
                <br />
                <button className="learn-morebtn">
                  {selectedService.cta.button}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FullServices;
