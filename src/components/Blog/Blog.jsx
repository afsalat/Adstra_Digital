import React from "react";
import "./Blog.css";
import img from "../../assets/banner-images/data-analytics-tablet.jpg"

const blogPosts = [
    {
        title: "Mastering UI/UX Basics",
        excerpt: "Discover key principles that shape modern user interfaces and improve UX.",
        imageUrl: img,
        link: "#"
    },
    {
        title: "React Performance Secrets",
        excerpt: "Speed up your apps using these little-known performance tricks.",
        imageUrl: img,
        link: "#"
    },
    {
        title: "Modern CSS Magic",
        excerpt: "Learn how to use Flexbox, Grid, and new CSS features like a pro.",
        imageUrl: img,
        link: "#"
    }
];

const Blog = () => {
    return (
        <section className="blog-section">
            <h2 className="blog-heading">Latest Blog Posts</h2>
            <div className="blog-card-grid">
                {blogPosts.map((post, index) => (
                    <div className="blog-card-wrapper" key={index}>
                        <a href={post.link} className="blog-card">
                            <div
                                className="blog-card__image"
                                style={{ backgroundImage: `url(${post.imageUrl})` }}
                            ></div>
                            <div className="blog-card__content">
                                <h3 className="blog-card__title">{post.title}</h3>
                                <p className="blog-card__excerpt">{post.excerpt}</p>
                            </div>
                        </a>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default Blog;
