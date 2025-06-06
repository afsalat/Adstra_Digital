import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./BlogDetails.css";
import { useParams } from "react-router-dom";
import { format } from 'date-fns';
import img from "../../assets/banner-images/data-analytics-tablet.jpg";

const blogPosts = [
    {
        title: "Mastering UI/UX Basics",
        slug: "ui-ux-basics",
        author: "Jane Doe",
        publishedDate: "2024-10-15",
        readingTime: "4 min read",
        excerpt: "Discover key principles that shape modern user interfaces and improve UX.",
        content: "User experience (UX) and user interface (UI) design form the foundation of modern web applications. In this article, we dive into the fundamentals, including color theory, layout principles, and accessibility. We'll explore how to enhance user satisfaction by improving usability and interaction design. Expect practical tips, tools, and examples from real-world applications.",
        imageUrl: img,
        tags: ["UX", "UI", "Design", "Web"],
    },
    {
        title: "React Performance Secrets",
        slug: "react-performance",
        author: "John Smith",
        publishedDate: "2025-01-05",
        readingTime: "6 min read",
        excerpt: "Speed up your apps using these little-known performance tricks.",
        content: "Performance is critical in modern applications. This blog explores React performance hacks like memoization, lazy loading, and code splitting. Learn how to use `React.memo`, dynamic imports, React Profiler, and useCallback/useMemo hooks effectively to keep your applications fast and responsive.",
        imageUrl: img,
        tags: ["React", "JavaScript", "Web Performance"],
    },
    {
        title: "Modern CSS Magic",
        slug: "modern-css",
        author: "Alex Rivera",
        publishedDate: "2024-11-20",
        readingTime: "5 min read",
        excerpt: "Learn how to use Flexbox, Grid, and new CSS features like a pro.",
        content: "CSS has evolved! Learn how to take advantage of Grid, Flexbox, variables, container queries, and more to build responsive designs with clean and maintainable code. This post covers real-life use cases, tricks for debugging layout issues, and how to create fluid interfaces with CSS-only techniques.",
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
                    glareMaxOpacity={0.2}
                    scale={1.05}
                    transitionSpeed={1000}
                    tiltMaxAngleX={10}
                    tiltMaxAngleY={10}
                    perspective={2000}
                    gyroscope={true}
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
                            <div className="blog-meta">
                                <span>By <strong>{post.author}</strong></span>
                                <span> | {post.publishedDate}</span>
                                <span> • {post.readingTime}</span>
                            </div>

                            <p>{post.content}</p>
                            <ul className="blog-tags">
                                {post.tags.map((tag, i) => (
                                    <li key={i}>#{tag}</li>
                                ))}
                            </ul>
                            <span> | {format(new Date(post.publishedDate), "MMMM d, yyyy")}</span>
                        </div>
                    </div>
                </Tilt>
            ))}
        </div>
    );
}

export default BlogDetail;
