"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Sparkles } from "lucide-react";
import { blogPosts } from "@/data/services";
import { getBlogImagePath } from "@/utils/contentImage";
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
  const posts = getSortedPosts();
  const featuredPost = posts[0];
  const spotlightPosts = posts.slice(1, 4);
  const archivePosts = posts.slice(1);
  const topicTags = [...new Set(posts.flatMap((post) => post.tags || []))].slice(0, 6);

  return (
    <>
      <NavBar />
      <section className="bloglist-page">
        <div className="bloglist-shell">
          <header className="bloglist-hero">
            <div className="bloglist-hero__copy">
              <span className="bloglist-kicker">Adstra Journal</span>
              <h1>Ideas, strategy, and digital execution that compound.</h1>
              <p>
                Explore practical writing on SEO, AI search, content, social
                media, branding, and product-led growth. Every article is built
                to be useful for brands making real marketing decisions.
              </p>

              <div className="bloglist-hero__stats">
                <article>
                  <strong>{posts.length}</strong>
                  <span>Published articles</span>
                </article>
                <article>
                  <strong>{topicTags.length}+</strong>
                  <span>Core growth topics</span>
                </article>
                <article>
                  <strong>{formatDate(featuredPost?.publishedDate)}</strong>
                  <span>Latest update</span>
                </article>
              </div>

              <div className="bloglist-topic-rail">
                {topicTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <aside className="bloglist-hero__panel">
              <span className="bloglist-panel__label">
                <Sparkles size={15} />
                What You’ll Find
              </span>
              <h2>Clear analysis over recycled marketing filler.</h2>
              <p>
                The blog is structured around current search behavior, better
                creative systems, and tactics that can actually be implemented.
              </p>
              <ul>
                <li>SEO and AI-search shifts explained without fluff.</li>
                <li>Content and campaign ideas shaped for business outcomes.</li>
                <li>Professional visual presentation with faster scan value.</li>
              </ul>
            </aside>
          </header>

          {featuredPost && (
            <section className="bloglist-featured">
              <Link href={`/blogs/${featuredPost.slug}/`} className="bloglist-featured__lead">
                <div className="bloglist-featured__image">
                  <Image
                    src={getBlogImagePath(featuredPost)}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                  />
                </div>
                <div className="bloglist-featured__overlay" />
                <div className="bloglist-featured__body">
                  <span className="bloglist-card__category">
                    {getCategory(featuredPost)}
                  </span>
                  <h2>{featuredPost.title}</h2>
                  <p>{featuredPost.excerpt}</p>
                  <BlogMeta post={featuredPost} />
                  <span className="bloglist-inline-link">
                    Read Featured Article
                    <ArrowRight size={17} />
                  </span>
                </div>
              </Link>

              <div className="bloglist-featured__stack">
                <div className="bloglist-section-heading">
                  <span>Latest Insights</span>
                  <h3>Fresh articles from the Adstra team.</h3>
                </div>

                {spotlightPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blogs/${post.slug}/`}
                    className="bloglist-spotlight"
                  >
                    <div className="bloglist-spotlight__content">
                      <span className="bloglist-card__category">
                        {getCategory(post)}
                      </span>
                      <h4>{post.title}</h4>
                      <p>{post.excerpt}</p>
                      <BlogMeta post={post} />
                    </div>
                    <div className="bloglist-spotlight__thumb">
                      <Image
                        src={getBlogImagePath(post)}
                        alt={post.title}
                        fill
                        sizes="160px"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="bloglist-archive">
            <div className="bloglist-section-heading bloglist-section-heading--archive">
              <span>All Articles</span>
              <h2>Browse the complete knowledge archive.</h2>
              <p>
                A cleaner index of articles across search, performance, AI,
                content, and digital product growth.
              </p>
            </div>

            <div className="bloglist-grid">
              {archivePosts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}/`}
                  className={`bloglist-card ${
                    index % 5 === 0 ? "bloglist-card--wide" : ""
                  }`}
                >
                  <div className="bloglist-card__image">
                    <Image
                      src={getBlogImagePath(post)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="bloglist-card__body">
                    <span className="bloglist-card__category">
                      {getCategory(post)}
                    </span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="bloglist-card__footer">
                      <BlogMeta post={post} />
                      <span className="bloglist-inline-link">
                        Explore
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
              <span className="bloglist-kicker">Need Execution, Not Just Reading?</span>
              <h2>Turn insight into campaigns, content, and growth systems.</h2>
              <p>
                If you need help applying these ideas to your business, move
                from the blog into strategy, creative, and implementation with
                Adstra Digital.
              </p>
            </div>

            <div className="bloglist-cta__actions">
              <Link href="/#enquiry" className="bloglist-button bloglist-button--primary">
                Start a Project
              </Link>
              <Link
                href="/service/all/"
                className="bloglist-button bloglist-button--secondary"
              >
                Explore Services
              </Link>
            </div>

            <div className="bloglist-blogadda">
              <a
                className="bloglist-blogadda-link"
                href="https://www.blogadda.com"
                title="Visit BlogAdda.com to discover Indian blogs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="bloglist-blogadda-img"
                  src="https://www.blogadda.com/images/blogadda.png"
                  width="120"
                  height="25"
                  alt="Visit BlogAdda.com to discover Indian blogs"
                />
              </a>
              <p className="bloglist-blogadda-text">
                Proud to be part of the BlogAdda community.
              </p>
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </>
  );
}
