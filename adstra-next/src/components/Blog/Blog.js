"use client";

import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Blog.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { blogPosts } from "../../data/services";




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
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="blog-image"
                      priority={index === 0}
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
