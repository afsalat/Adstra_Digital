"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { blogPosts } from "@/data/services";
import { getBlogImagePath } from "@/utils/contentImage";
import API_BASE_URL from "@/utils/apiBase";
import NavBar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import "./BlogList.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(date) {
  if (!date) {
    return "Latest";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return dateFormatter.format(parsed);
}

function getCategory(post) {
  return post.tags?.[0] || "Digital Growth";
}

function getSortedPosts() {
  return [...blogPosts].sort((left, right) => {
    const leftTime = new Date(left.publishedDate || 0).getTime();
    const rightTime = new Date(right.publishedDate || 0).getTime();

    return rightTime - leftTime;
  });
}

function getTopicSummary(posts) {
  const counts = new Map();

  posts.forEach((post) => {
    if (!post) return;
    (post.tags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([label, count]) => ({ label, count }));
}

function BlogMeta({ post }) {
  return (
    <div className="bloglist-meta">
      <span>
        <CalendarDays size={15} />
        {formatDate(post.publishedDate)}
      </span>
      <span>
        <Clock3 size={15} />
        {post.readingTime || "8 min read"}
      </span>
    </div>
  );
}

export default function AllBlogsPage() {
  const [posts, setPosts] = useState(() => getSortedPosts());

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(`${API_BASE_URL}/blogs/`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setPosts(data);
          }
        }
      } catch (err) {
        console.warn("API endpoint unavailable, fallback to static blogs:", err?.message || err);
      }
    }
    fetchBlogs();
  }, []);

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 5);
  const archivePosts = posts.slice(1);
  const topics = getTopicSummary(posts);

  return (
    <>
      <NavBar />
      <section className="bloglist-page">
        <div className="bloglist-shell">
          <header className="bloglist-intro">
            <div className="bloglist-intro__copy">
              <span className="bloglist-eyebrow">Adstra Journal</span>
              <h1>Clear articles for teams working on growth, search, and digital execution.</h1>
              <p>
                Browse a focused library of practical writing on SEO, AI search,
                content strategy, paid media, websites, and performance-oriented
                marketing decisions.
              </p>
            </div>

            <div className="bloglist-intro__summary">
              <div className="bloglist-stat">
                <span className="bloglist-stat__label">Articles</span>
                <strong>{posts.length}</strong>
              </div>
              <div className="bloglist-stat">
                <span className="bloglist-stat__label">Top topics</span>
                <strong>{topics.length}+</strong>
              </div>
              <div className="bloglist-stat">
                <span className="bloglist-stat__label">Latest update</span>
                <strong>{formatDate(featuredPost?.publishedDate)}</strong>
              </div>
            </div>
          </header>

          <section className="bloglist-overview">
            <div className="bloglist-overview__topics">
              <div className="bloglist-section-head">
                <span>Coverage</span>
                <h2>What the library covers</h2>
              </div>

              <div className="bloglist-topic-grid">
                {topics.map((topic) => (
                  <article key={topic.label} className="bloglist-topic-card">
                    <strong>{topic.label}</strong>
                    <span>{topic.count} articles</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="bloglist-overview__note">
              <span className="bloglist-eyebrow bloglist-eyebrow--muted">Editorial Note</span>
              <h3>Written for teams that need clarity before action.</h3>
              <p>
                Every article is structured to be readable, specific, and useful in
                real client work, not written as generic trend filler.
              </p>
              <p>
                Expect practical breakdowns, current examples, and actionable
                takeaways that help founders, marketers, and operators make better
                decisions across search, content, paid media, and digital growth.
              </p>
            </div>
          </section>

          {featuredPost && (
            <section className="bloglist-lead">
              <div className="bloglist-section-head">
                <span>Featured</span>
                <h2>Lead story and recent publishing</h2>
              </div>

              <div className="bloglist-lead__layout">
                <Link href={`/blogs/${featuredPost.slug}/`} className="bloglist-feature-card">
                  <div className="bloglist-feature-card__media">
                    <Image
                      src={getBlogImagePath(featuredPost)}
                      alt={featuredPost.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      priority
                    />
                  </div>
                  <div className="bloglist-feature-card__body">
                    <span className="bloglist-chip">{getCategory(featuredPost)}</span>
                    <h3>{featuredPost.title}</h3>
                    <p>{featuredPost.excerpt}</p>
                    <BlogMeta post={featuredPost} />
                    <span className="bloglist-inline-link">
                      Read article
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>

                <div className="bloglist-recent-rail">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blogs/${post.slug}/`}
                      className="bloglist-recent-card"
                    >
                      <div className="bloglist-recent-card__content">
                        <span className="bloglist-chip">{getCategory(post)}</span>
                        <h4>{post.title}</h4>
                        <BlogMeta post={post} />
                      </div>
                      <div className="bloglist-recent-card__thumb">
                        <Image
                          src={getBlogImagePath(post)}
                          alt={post.title}
                          fill
                          sizes="120px"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="bloglist-archive">
            <div className="bloglist-section-head">
              <span>Archive</span>
              <h2>Browse the full article archive</h2>
            </div>

            <div className="bloglist-grid">
              {archivePosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}/`}
                  className="bloglist-archive-card"
                >
                  <div className="bloglist-archive-card__image">
                    <Image
                      src={getBlogImagePath(post)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="bloglist-archive-card__body">
                    <span className="bloglist-chip">{getCategory(post)}</span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="bloglist-archive-card__footer">
                      <BlogMeta post={post} />
                      <span className="bloglist-inline-link">
                        Open
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="bloglist-cta">
            <div className="bloglist-cta__copy">
              <span className="bloglist-eyebrow bloglist-eyebrow--muted">Need execution support?</span>
              <h2>Turn these ideas into campaigns, content, and measurable growth.</h2>
              <p>
                If you need help applying these insights to your business, move from
                reading into strategy, production, and implementation with Adstra.
              </p>
            </div>

            <div className="bloglist-cta__actions">
              <Link href="/#enquiry" className="bloglist-button bloglist-button--primary">
                Start a Conversation
              </Link>
              <Link
                href="/service/all/"
                className="bloglist-button bloglist-button--secondary"
              >
                View Services
              </Link>
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </>
  );
}
