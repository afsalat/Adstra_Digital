import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./BlogDetails.css";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import img from "../../assets/blog_images/shoting-photo-blog.jpeg";
import img1 from "../../assets/blog_images/blog-flight.jpg";

const blogPosts = [
  {
    title:
      "The Art of In-House Video & Photography: Turning Vision into Reality",
    slug: "in-house-video-photography",
    author: "Wilson",
    publishedDate: "2025-06-01",
    readingTime: "8 min read",
    excerpt: "Building a creative media powerhouse from within your brand.",
    content: `
            The scene unfolds like magic. The studio lights hum softly, casting a golden glow over the set. The camera stands firm, its lens poised to capture the perfect shot. The team moves with quiet precision—adjusting angles, refining details, bringing an idea to life. This isn’t just a photoshoot. It’s the heartbeat of a brand, the silent narrator of a company’s story.

In the fast-paced digital world, where attention spans are fleeting and visual storytelling reigns supreme, brands have realized one crucial truth—outsourcing creative production is no longer the winning strategy. The most powerful brands don’t rely on external agencies to shape their image. They craft their narratives in-house, with a dedicated team of video and photography professionals who know the brand’s DNA like the back of their hand.
But what does it take to build such a powerhouse? More importantly, how can businesses fully harness the potential of an in-house media setup?
Why an In-House Team? The Freedom of Creativit
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
(c)addstra digital`,
    imageUrl: img,
    tags: ["In-house Media", "Branding", "Photography", "Video"],
  },
  {
    title:
      "The Birth of Creativity: How Ideas Take FlightIt starts as a whisper",
    slug: "the-birth-of-creativity",
    author: "Wilson",
    publishedDate: "2025-06-19",
    readingTime: "10 min read",
    excerpt:
      "The Birth of Creativity: How Ideas Take FlightIt starts as a whisper",
    content: `A fleeting thought, like a breeze brushing against the edges of the mind. Not loud, not fully formed—just a feeling, a sensation, a spark.
Creativity doesn’t arrive with grand gestures. It sneaks in quietly, finding its way into the pauses between thoughts, the moments of stillness where the world fades just enough for something new to emerge.
Some call it inspiration. Others call it intuition. But at its core, creativity is simply the act of seeing beyond what already exists.
Where It Begins 
No one wakes up and decides, “Today, I will create brilliance.” It happens when the mind starts wandering—when the routine is momentarily interrupted by something unexpected. A conversation, a song, a glimpse of sunlight filtering through an old window.
The first ingredient of creation is awareness. The ability to notice the details that most people overlook. The way a word sounds when spoken softly. The way colors shift in the evening sky. The way a memory resurfaces without warning.
Creativity happens when a person listens to those moments instead of brushing past them. When the ordinary becomes extraordinary simply because someone chooses to see it that way.
The Leap from Thought to Creation
A thought is fragile when it first arrives. It holds uncertainty, hesitation. The mind questions it, doubts it, tries to reason it away.
But creativity is fearless. It refuses to stay contained. It pushes forward, demanding to be shaped, built, expressed.
This is where a creator must make a choice. To trust the thought, to follow where it leads. To let the idea grow—even when it feels strange, even when it doesn’t make sense yet.
The process isn’t always graceful. Sometimes it comes in bursts, like a flood that cannot be stopped. Other times, it’s slow, dragging its feet, reluctant to reveal itself fully.
But creation happens only when someone dares to start. A single stroke of a brush. A single note in a melody. A single word on a page.
Once that first step is taken, everything changes.The Struggle and the Breakthrough Creativity is never easy. It demands patience, resilience, and courage.
There are moments when the mind feels empty—when no idea seems good enough. When frustration builds, and doubt settles deep.
But here’s the truth: creativity is not about perfection. It’s about persistence.
A painter does not get it right on the first try. A writer rewrites sentences dozens of times before they feel just right. A musician plays the same melody over and over until it finally clicks.
The magic happens not in the first attempt, but in the willingness to keep going. To let the mistakes teach, to let failure refine, to let time strengthen the vision.
What It Takes to Create Creation is not limited to artists, writers, musicians. It belongs to anyone who dares to think beyond what already exists.
All it takes is curiosity—a hunger to explore, to imagine, to dream. It takes silence, too—the space to let ideas breathe, to listen to the thoughts that hide beneath the surface.
It takes courage—to believe in an idea before anyone else does, to trust in something that isn’t fully formed yet.
And most of all, it takes action. Because no idea becomes reality without effort, without time, without dedication.
The Moment Creation Comes to Life There is a turning point. A moment when an idea transforms into something real.
The song that started as a hum becomes a melody. The painting that was once a blank canvas now holds emotion in every brushstroke. The words that were scattered thoughts now form a story that speaks to the soul.
That is creativity—the ability to take what never existed before and make it real. And the beautiful part? There is no limit to it.
Every day, every hour, every second—someone, somewhere, is creating. Perhaps today, that someone is you.

(c)adstra digital`,
    imageUrl: img1,
    tags: ["In-house-Media", "Branding", "Photography", "Video"],
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
      <h1 data-aos="fade-down" className="blog-title">
        {slug === "all" || !slug
          ? "Latest Blogs"
          : `Post: ${slug.replace(/-/g, " ")}`}
      </h1>

      {selectedPosts.map((post, index) => (
        <Tilt
          key={index}
          glareEnable={true}
          glareMaxOpacity={0.2}
          scale={false}
          transitionSpeed={1000}
          tiltMaxAngleX={3}
          tiltMaxAngleY={3}
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
            <div className="animated-shapes">
              <span className="shape shape1" />
              <span className="shape shape2" />
              <span className="shape shape3" />
            </div>
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
