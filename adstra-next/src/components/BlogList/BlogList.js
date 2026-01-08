"use client";

import { blogPosts } from "@/data/services";
import Link from "next/link";
import NavBar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import "./BlogList.css";

export default function AllBlogsPage() {
  return (
    <>
      <NavBar />
      <section className="bloglist-section text-light">
        <div className="container py-5">
          <h1 className="text-center display-5 fw-bold mb-4 bloglist-animate-fade-up">
            Explore Our Latest Blogs
          </h1>
          <p className="text-center mb-5 bloglist-animate-fade-up bloglist-delay-1">
            Stay updated with our insights, strategies, and innovations.
          </p>


          {/* Blog Cards */}
          <div className="row g-4">
            {blogPosts.map((blog, idx) => (
              <div key={blog.slug} className="col-lg-4 col-md-6 d-flex">
                <div
                  className="bloglist-card bloglist-animate-zoom-in h-100 w-100"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <img
                    src={blog.imageUrl || "/assets/default-blog.jpg"}
                    alt={blog.title}
                    className="bloglist-image"
                  />
                  <div className="bloglist-content">
                    <h2 className="h5 fw-semibold">
                      <Link
                        href={`/blogs/${blog.slug}/`}
                        style={{ fontWeight: "bold" }}
                        className="bloglist-hoverunderline"
                      >
                        {blog.title}
                      </Link>
                    </h2>
                    <p className="text-white">
                      {blog.excerpt?.slice(0, 100)}...
                    </p>
                    <Link href={`/blogs/${blog.slug}/`} className="bloglist-read-more">
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 🔗 BlogAdda Badge */}
        <div className="text-center mb-5">
          <a
            href="http://www.blogadda.com"
            title="Visit BlogAdda.com to discover Indian blogs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://www.blogadda.com/images/blogadda.png"
              width="120"
              height="25"
              alt="Visit BlogAdda.com to discover Indian blogs"
            />
          </a>
          <h6 style={{ marginTop: "10px" }}>Proud to Be a Part of BlogAdda Community</h6>
        </div>
      </section>
      <Footer />
    </>
  );
}
