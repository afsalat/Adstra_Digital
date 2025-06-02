import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./BlogDetails.css";
import { useParams } from "react-router-dom";
import img from "../../assets/banner-images/data-analytics-tablet.jpg";

const blogPosts = [
    {
        title: "Mastering UI/UX Basics",
        slug: "ui-ux-basics",
        excerpt: "Discover key principles that shape modern user interfaces and improve UX.",
        content:
            "User experience (UX) and user interface (UI) design form the foundation of modern web applications. In this article, we dive into the fundamentals...",
        imageUrl: img,
        tags: ["UX", "UI", "Design", "Web"],
    },
    {
        title: "React Performance Secrets",
        slug: "react-performance",
        excerpt: "Speed up your apps using these little-known performance tricks.",
        content:
            "Performance is critical in modern applications. This blog explores React performance hacks like memoization, lazy loading, and code splitting...",
        imageUrl: img,
        tags: ["React", "JavaScript", "Web Performance"],
    },
    {
        title: "Modern CSS Magic",
        slug: "modern-css",
        excerpt: "Learn how to use Flexbox, Grid, and new CSS features like a pro.",
        content:
            "CSS has evolved! Learn how to take advantage of Grid, Flexbox, variables, container queries, and more to build responsive designs...",
        imageUrl: img,
        tags: ["CSS", "Responsive Design", "Frontend"],
    },
];

function BlogDetail() {
    const { slug } = useParams();

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const selectedPosts =
        slug === "all"
            ? blogPosts
            : blogPosts.filter((post) => post.slug === slug?.toLowerCase());

    return (
        <div className="blog-detail-container">
            <h1 data-aos="fade-down">
                {slug === "all" || !slug ? "Our Blog" : `Post: ${slug.replace(/-/g, " ")}`}
            </h1>

            {selectedPosts.map((post, index) => (
                <Tilt
                    glareEnable={true}
                    glareMaxOpacity={0.2}        // Reduced glare opacity for subtle effect
                    scale={1.05}                 // Slightly increase scale on hover
                    transitionSpeed={1000}       // Smoother and slower transition
                    tiltMaxAngleX={10}           // Limit max tilt angle for X axis
                    tiltMaxAngleY={10}           // Limit max tilt angle for Y axis
                    perspective={2000}           // Increase perspective for natural depth
                    gyroscope={true}             // Enable device gyroscope for mobile tilt
                    key={index}
                >
                    <div
                        className="blog-block"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                    >
                        <div
                            className="blog-image"
                            style={{ backgroundImage: `url(${post.imageUrl})` }}
                        />
                        <div className="blog-content">
                            <h2>{post.title}</h2>
                            <p>{post.content}</p>
                            <ul className="blog-tags">
                                {post.tags.map((tag, i) => (
                                    <li key={i}>#{tag}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Tilt>
            ))}
        </div>
    );
}

export default BlogDetail;
