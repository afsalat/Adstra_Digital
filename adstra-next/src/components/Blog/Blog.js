"use client";

import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Blog.css";
import Image from "next/image";
import { useRouter } from "next/navigation";


const blogPosts = [
  {
    title:
      "Everything Your Business Needs in 2025: SEO, AEO, GEO & PPC Explained",
    slug: "seo-aeo-geo-ppc-2025-digital-strategy",
    excerpt:
      "Learn how to grow your business online in 2025 by combining SEO, AEO, GEO, and PPC.",
    imageUrl: "/assets/blog_images/blog_2.jpg",
  },
  {
    title:
      "Branding Trends 2025: How Logo Design Will Elevate Your Digital Marketing Strategy",
    slug: "branding-trends-2025-logo-design-marketing",
    excerpt:
      "Top logo design trends for 2025 and how they boost your digital marketing results.",
    imageUrl: "/assets/blog_images/blog_1.jpg",
  },
  {
    title: "Key Benefits and How It Drives Business Growth",
    slug: "ai-marketing-benefits-business-growth",
    excerpt:
      "How AI works, its key advantages, and how it helps businesses achieve faster, smarter growth.",
    imageUrl: "/assets/blog_images/blog_3.jpg",
  },
  {
    title: "Mastering the Perfect Video Shoot",
    slug: "perfect-video-shoot-client-happy",
    excerpt:
      "Ace your next video shoot and impress your client with this complete guide.",
    imageUrl: "/assets/blog_images/Cinema_blog.webp",
  },
  {
    title: "The Birth of Creativity",
    slug: "the-birth-of-creativity",
    excerpt:
      "A fleeting thought, like a breeze brushing against the mind—just a spark.",
    imageUrl: "/assets/blog_images/blog-flight.jpg",
  },
  {
    title: "The Art of In-House Video & Photography",
    slug: "in-house-video-photography",
    excerpt:
      "Why top brands are building creative powerhouses in-house and transforming storytelling.",
    imageUrl: "/assets/blog_images/shoting-photo-blog.jpeg",
  },
];

const Blog = () => {
  const router = useRouter();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleNavigation = (slug) => {
    router.push(`/blogs/${slug}`);
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
