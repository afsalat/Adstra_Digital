import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Blog.css";
import img1 from "../../assets/blog_images/shoting-photo-blog.jpeg"
import { Link } from "react-router-dom";

const blogPosts = [
  {
    title: "The Art of In-House Video & Photography",
    slug: "in-house-video-photography",
    excerpt: "Why top brands are building creative powerhouses in-house and how it’s transforming brand storytelling.",
    imageUrl: img1
  },
  {
    title: "Mastering UI/UX Basics",
    slug: "ui-ux-basics",
    excerpt: "Discover key principles that shape modern user interfaces and improve UX.",
    imageUrl: img1
  },
  {
    title: "React Performance Secrets",
    slug: "react-performance-secrets",
    excerpt: "Speed up your apps using these little-known performance tricks.",
    imageUrl: img1
  },
];

const Blog = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section className="blog-section">
      <h2 className="blog-heading">Latest Blog Posts</h2>
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
              key={index}

            >
              <Link to={`/blogs/${post.slug}`} className="blog-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div
                  className="blog-card__image"
                  style={{ backgroundImage: `url(${post.imageUrl})` }}
                ></div>
                <div className="blog-card__content">
                  <h3 className="blog-card__title">{post.title}</h3>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                </div>
              </Link>
            </Tilt>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blog;
