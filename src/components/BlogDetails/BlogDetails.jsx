import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./BlogDetails.css";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import img from "../../assets/blog_images/shoting-photo-blog.jpeg";

const blogPosts = [
  {
    title:
      "The Art of In-House Video & Photography: Turning Vision into Reality",
    slug: "in-house-video-photography",
    author: "Adstra Digital",
    publishedDate: "2025-06-01",
    readingTime: "8 min read",
    excerpt: "Building a creative media powerhouse from within your brand.",
    content: `
            The scene unfolds like magic. The studio lights hum softly, casting a golden glow over the set. The camera stands firm, its lens poised to capture the perfect shot. The team moves with quiet precision—adjusting angles, refining details, bringing an idea to life. This isn’t just a photoshoot. It’s the heartbeat of a brand, the silent narrator of a company’s story.

In the fast-paced digital world, where attention spans are fleeting and visual storytelling reigns supreme, brands have realized one crucial truth—outsourcing creative production is no longer the winning strategy. The most powerful brands don’t rely on external agencies to shape their image. They craft their narratives in-house, with a dedicated team of video and photography professionals who know the brand’s DNA like the back of their hand.

But what does it take to build such a powerhouse? More importantly, how can businesses fully harness the potential of an in-house media setup?

Why an In-House Team? The Freedom of Creativity
Imagine an idea striking at midnight—a sudden inspiration for a bold new campaign. With an external team, that idea might remain trapped in emails, waiting for approvals, lost in revision cycles. But with an in-house setup, creativity flows seamlessly. Concepts turn into action, and action turns into polished visuals—all within a fraction of the time it would take elsewhere.

Beyond speed, an in-house team offers control. Every frame aligns with the brand’s voice, every edit reflects its essence. There’s no translation loss, no external interpretations diluting the vision. The message remains pure, consistent, and unmistakably authentic.

The Tools That Make the Magic Happen
Building an in-house production team isn’t just about hiring talent—it’s about equipping them with the right tools. High-end cameras, professional lighting setups, advanced editing software—all these elements turn good footage into cinematic brilliance.

Yet, the true secret lies in the people behind the lens. Skilled photographers and videographers aren’t just technicians; they’re artists. They understand composition, lighting, and storytelling in a way that machines never could. Pairing them with cutting-edge technology creates a dream team that pushes boundaries, experiments with new trends, and crafts visuals that captivate.

Mastering Post-Production: Where Stories Come to Life
While great shots set the foundation, post-production is where the real magic unfolds. This is where raw footage transforms into striking imagery—colors balanced to perfection, transitions crafted to evoke emotion, and every pixel sharpened for impact.

The advantage of an in-house editing team? Flexibility and precision. No need to wait weeks for revisions or settle for compromises. The team understands the brand’s aesthetic inside out, making every frame an intentional masterpiece.
Sophisticated editing tools allow brands to go beyond the basics—motion graphics, layered textures, immersive effects. These elements take content from ordinary to extraordinary, ensuring the audience doesn’t just see the visuals, but feels them.

Beyond Marketing: Expanding Possibilities
An in-house media setup isn’t just for advertisements or social campaigns. It’s a tool for brand storytelling that extends beyond commercial purposes.
Behind-the-scenes footage, employee stories, live event coverage—these raw, unscripted moments create genuine connections with audiences. They humanize the brand, making it more relatable and engaging.

And in today’s digital era, audiences crave authenticity. A brand that shares its journey, its struggles, its victories—all through its own lens—builds loyalty. It becomes more than a company. It becomes an experience.

A Future Where Every Brand is Its Own Studio

The world is shifting, and the rules of branding are changing. In-house video and photography setups are no longer reserved for the elite. With the right investment in talent and technology, any business can own its narrative.

For brands that want to lead—not follow—this is the next step. It’s not just about stunning visuals. It’s about speed, control, and storytelling without limits.
Because in the end, when a brand tells its own story, it doesn’t just capture attention—it captures hearts.
(c)addstra digital
(        `,
    imageUrl: img,
    tags: ["In-house Media", "Branding", "Photography", "Video"],
  },
  // ... other posts
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
      <h1 data-aos="fade-down" className="blog-title">
        {slug === "all" || !slug
          ? "Our Blog"
          : `Post: ${slug.replace(/-/g, " ")}`}
      </h1>

      {selectedPosts.map((post, index) => (
        <Tilt
          key={index}
          glareEnable={true}
          glareMaxOpacity={0.2}
          scale={1.02}
          transitionSpeed={1000}
          tiltMaxAngleX={10}
          tiltMaxAngleY={10}
          perspective={1500}
          gyroscope={true}
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
                <span>
                  By <strong>{post.author}</strong>
                </span>
                <span>
                  {" "}
                  | {format(new Date(post.publishedDate), "MMMM d, yyyy")}
                </span>
                <span> • {post.readingTime}</span>
              </div>
              {post.content.split("\n").map((paragraph, idx) => (
                <p key={idx}>{paragraph.trim()}</p>
              ))}
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
