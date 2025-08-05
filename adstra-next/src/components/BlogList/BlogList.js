"use client";

import { blogPosts } from "@/data/services";
import Link from "next/link";
import NavBar from "../NavBar/navbar";
import Footer from "../Footer/Footer";
import "./BlogList.css";

export default function AllBlogsPage() {
  return (
    <>
      <NavBar />
      <section className="blogs-section text-light">
        <div className="container py-5">
          <h1 className="text-center display-5 fw-bold mb-4 animate-fade-up">
            Explore Our Latest Blogs
          </h1>
          <p className="text-center mb-5 animate-fade-up delay-1">
            Stay updated with our insights, strategies, and innovations.
          </p>

          <div className="row g-4">
            {blogPosts.map((blog, idx) => (
              <div key={blog.slug} className="col-lg-4 col-md-6 d-flex">
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="w-100 text-decoration-none"
                >
                  <div
                    className="blog-card animate-zoom-in h-100"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <img
                      src={blog.imageUrl || "/assets/default-blog.jpg"}
                      alt={blog.title}
                      className="blog-image"
                    />
                    <div className="blog-content">
                      <h2 className="h5 text-primary fw-semibold hover:underline">
                        <a style={{textDecoration: "none"}} href={`/blogs/${blog.slug}`}>
                        {blog.title}
                        </a>
                      </h2>
                      <p className="text-muted">
                        {blog.excerpt?.slice(0, 100)}...
                      </p>
                      <span className="read-more">Read More →</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
