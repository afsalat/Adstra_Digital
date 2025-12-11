"use client";

import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Blog.css";
import Image from "next/image";
import { useRouter } from "next/navigation";


export const blogPosts = [
  {
    "title": "10 Reasons Flutter Is the Future of Mobile App Development",
    "slug": "10-reasons-flutter-future-mobile-app-development",
    "excerpt": "Explore why Flutter is revolutionizing mobile app development with cross-platform capabilities, hot reload, cost efficiency, and native-like performance for Android and iOS.",
    "imageUrl": "https://adstradigital.com/media/blog_images/flutter-mobile-app-development.png"
  },
  {
    "title": "Kerala's Most Trusted Mobile App Development Company – Build High-Quality Apps That Grow Your Business",
    "slug": "kerala-trusted-mobile-app-development-company-adstra-digital",
    "excerpt": "Adstra Digital, Kerala's trusted mobile app development company, creates high-quality Android, iOS, and cross-platform apps that drive business growth, user engagement, and ROI.",
    "imageUrl": "https://adstradigital.com/media/blog_images/mobile-app-development-kerala.png"
  },
  {
    "title": "Best Digital Marketing Company in India",
    "slug": "best-digital-marketing-agencies-india",
    "excerpt": "Discover India's top digital marketing agencies that deliver measurable results through SEO, social media, performance marketing, and comprehensive digital solutions.",
    "imageUrl": "https://adstradigital.com/media/blog_images/best-digital-marketing-agencies-india.png"
  },
  {
    "title": "10 Challenges in Social Media Marketing and How Adstra Digital Can Help",
    "slug": "social-media-marketing-challenges-solutions",
    "excerpt": "Struggling with social media marketing? Discover the top 10 challenges businesses face and learn how Adstra Digital's proven strategies can transform your social media presence.",
    "imageUrl": "https://adstradigital.com/media/blog_images/social-media-challenges-solutions.png"
  },
  {
    "title": "Paid vs. Organic Search: Which One Delivers Better ROI for Your Brand?",
    "slug": "paid-vs-organic-search-better-roi",
    "excerpt": "Compare paid vs organic search ROI for your brand. Learn when to use PPC advertising vs SEO strategies and how to combine both for maximum digital marketing results.",
    "imageUrl": "https://adstradigital.com/media/blog_images/organic_vs_paid.png"
  },
  {
    "title": "Adstra Digital – ISO & IAF Certified Agency for Excellence in Digital Marketing",
    "slug": "adstra-digital-iso-iaf-certified-agency-digital-marketing",
    "excerpt": "Adstra Digital is an ISO & IAF certified digital marketing agency in Kerala, delivering trusted SEO, SMM, and branding solutions for measurable business growth.",
    "imageUrl": "https://adstradigital.com/media/blog_images/adstra-digital-iso-iaf-certified-agency.jpg"
  },
  {
    "title": "Need More Traffic? Find Kerala's Top Digital Marketing Agencies",
    "slug": "need-more-traffic-top-digital-marketing-agencies-kerala",
    "excerpt": "Want to boost your website traffic and visibility? Find Kerala's top digital marketing agencies offering SEO, SMM, and web solutions to grow your business.",
    "imageUrl": "https://adstradigital.com/media/blog_images/top-digital-marketing-agencies-kerala.jpg"
  },
  {
    "title": "Google Gemini SEO: Secrets to Getting Your Website Featured in AI Search Results",
    "slug": "google-gemini-seo-secrets-to-rank-in-ai-search-results",
    "excerpt": "Learn Google Gemini SEO secrets to get your website featured in AI search results. Boost visibility, traffic, and brand growth with Adstra Digital's expertise.",
    "imageUrl": "https://adstradigital.com/media/blog_images/google-gemini-seo-ai-results.png"
  },
  {
    "title": "Web 3.0 & Digital Marketing: Complete Guide for Businesses",
    "slug": "web-3-digital-marketing-complete-guide",
    "excerpt": "Discover how Web 3.0 is transforming digital marketing with AI, blockchain, and decentralization. Learn strategies to future-proof your business and connect smarter with customers.",
    "imageUrl": "https://adstradigital.com/media/blog_images/web3-and-digital-marketing-complete-guide-for-businesses.png"
  },
  {
    "title": "AI SEO Strategy: How to Rank in AI-Powered Search Results",
    "slug": "ai-seo-strategy-to-rank-in-ai-powered-search-results",
    "excerpt": "Want your brand to rank in AI-powered search? Explore the advanced SEO strategies and key ranking factors that will keep your brand ahead with Adstra Digital.",
    "imageUrl": "https://adstradigital.com/media/blog_images/ai-seo-strategy-to-rank-in-ai-powered-search-results.png"
  },
  {
    "title": "Social Media Strategy to Boost Your Conversion Rate",
    "slug": "social-media-strategy-boost-conversion-rate",
    "excerpt": "Social media is more than likes and shares—it should drive sales and leads. Learn how to boost your conversion rates with strategies that turn engagement into real business growth.",
    "imageUrl": "https://adstradigital.com/media/blog_images/social-media-strategy-to-boost-your-conversion-rate.jpg"
  },
  {
    "title": "Google Ads Services: How They Can Increase Your Business ROI",
    "slug": "google-ads-services-increase-business-roi",
    "excerpt": "Discover how expert Google Ads services can maximize ROI by targeting the right audience, optimizing ad spend, and driving measurable results.",
    "imageUrl": "https://adstradigital.com/media/blog_images/google-ads-services-increase-business-roi.webp"
  },
  {
    "title": "Ecommerce in India 2025: Growth Trends & Digital Strategy",
    "slug": "ecommerce-in-india-2025-growth-trends-digital-strategy",
    "excerpt": "Explore how ecommerce in India is set to boom by 2025 and the digital strategies businesses need to stay ahead.",
    "imageUrl": "https://adstradigital.com/media/blog_images/ecommerce-india-2025.jpg"
  },
  {
    "title": "What Is Google SGE & AI-Powered Search? How It Will Affect Your Website Traffic",
    "slug": "google-sge-ai-search-impact-2025",
    "excerpt": "Google SGE and AI-powered search are changing how users discover content. Learn what it means for your website traffic and how to adapt your SEO strategy in 2025.",
    "imageUrl": "https://adstradigital.com/media/blog_images/google-sge-ai-2025.jpg"
  },
  {
    "title": "Performance Max 2.0 Explained: The Complete Strategy Guide to AI-Driven Paid Marketing",
    "slug": "performance-max-2-ai-driven-paid-marketing-guide",
    "excerpt": "Google's Performance Max 2.0 is reshaping paid marketing with AI. Learn what's new, when to use it, and how to build high-performing campaigns.",
    "imageUrl": "https://adstradigital.com/media/blog_images/CompleteStategy.jpg"
  },
  {
    "title": "Digital Strategy Essentials 2025: How to Grow Your Brand Online",
    "slug": "digital-strategy-essential-2025",
    "excerpt": "In 2025, every brand needs a strong digital strategy. Adstra Digital helps businesses grow through SEO, ads, and creative branding solutions.",
    "imageUrl": "https://adstradigital.com/media/blog_images/blogbranding2025.jpg"
  },
  {
    "title": "Everything Your Business Needs in 2025: SEO, AEO, GEO & PPC Explained",
    "slug": "seo-aeo-geo-ppc-2025-digital-strategy",
    "excerpt": "Learn how to grow your business online in 2025 by combining SEO, AEO, GEO, and PPC.",
    "imageUrl": "https://adstradigital.com/media/blog_images/blog_2.jpg"
  },
  {
    "title": "Branding Trends 2025: How Logo Design Will Elevate Your Digital Marketing Strategy",
    "slug": "branding-trends-2025-logo-design-marketing",
    "excerpt": "Top logo design trends for 2025 and how they boost your digital marketing results.",
    "imageUrl": "https://adstradigital.com/media/blog_images/blog_1.jpg"
  },
  {
    "title": "AI Marketing: Key Benefits and How It Drives Business Growth",
    "slug": "ai-marketing-benefits-business-growth",
    "excerpt": "How AI works, its key advantages, and how it helps businesses achieve faster, smarter growth.",
    "imageUrl": "https://adstradigital.com/media/blog_images/blog_3.jpg"
  },
  {
    "title": "Mastering the Perfect Video Shoot",
    "slug": "perfect-video-shoot-client-happy",
    "excerpt": "Ace your next video shoot and impress your client with this complete guide.",
    "imageUrl": "https://adstradigital.com/media/blog_images/Cinema_blog.webp"
  },
  {
    "title": "The Birth of Creativity",
    "slug": "the-birth-of-creativity",
    "excerpt": "A fleeting thought, like a breeze brushing against the mind—just a spark.",
    "imageUrl": "https://adstradigital.com/media/blog_images/blog-flight.jpg"
  },
  {
    "title": "The Art of In-House Video & Photography",
    "slug": "in-house-video-photography",
    "excerpt": "Why top brands are building creative powerhouses in-house and transforming storytelling.",
    "imageUrl": "https://adstradigital.com/media/blog_images/shoting-photo-blog.jpeg"
  },
];



const Blog = () => {
  const router = useRouter();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleNavigation = (slug) => {
    router.push(`/blogs/${slug}/`);
  };

  return (
    <>
      <h2 className="blog-heading">Latest Blog Posts</h2>
      <section className="blog-section">
        <div className="blog-card-grid">
          {blogPosts.map((post, index) => (
            <div className="blog-card-wrapper" key={index}>
              <Tilt
                glareEnable={true}
                glareMaxOpacity={0.2}
                scale={1.05}
                transitionSpeed={1000}
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                perspective={2000}
                gyroscope={true}
              >
                <div
                  className="blog-cart"
                  onClick={() => handleNavigation(post.slug)}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  role="button"
                >
                  <div className="blog-card__image">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="blog-card__content">
                    <h3 className="blog-card__title" title={post.title}>
                      {post.title}
                    </h3>
                    <p className="blog-card__excerpt">{post.excerpt}</p>
                  </div>
                </div>
              </Tilt>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Blog;
