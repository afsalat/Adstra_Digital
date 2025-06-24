import React, { useEffect } from "react";
import Tilt from "react-parallax-tilt";
import AOS from "aos";
import "aos/dist/aos.css";
import "./BlogDetails.css";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import img from "../../assets/blog_images/shoting-photo-blog.jpeg";
import img1 from "../../assets/blog_images/blog-flight.jpg";
import img2 from "../../assets/blog_images/Cinema_blog.webp";

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
  {
    title:
      "How to Make Your Video Shoot Perfect (And Keep Your Client Happy Too)",
    slug: "perfect-video-shoot-client-happy",
    author: "Wilson",
    publishedDate: "2025-06-21",
    readingTime: "9 min read",
    excerpt:
      "A step-by-step guide to executing smooth video shoots while keeping clients satisfied.",
    content: ` Video is one of the strongest ways to tell a story or sell an idea. But anyone who’s ever worked on a video shoot knows—it can be chaotic. Equipment, lighting, location, people—there’s a lot to manage. And after all that, there’s one big question left: will the client like it?

If you're planning a video shoot and want to do it right, this blog will walk you through the key steps to make your shoot smooth and successful. We’ll also talk about how to work with your client and validate the results. Because when both the shoot and the relationship are handled well, everyone wins.

1. Understand the Client’s Vision
Before you shoot even one second of video, take time to understand what the client wants. Sit down with them and ask questions like:
- What is the goal of the video?
- Who is the audience?
- What kind of tone or style do you want—fun, professional, emotional?
- Are there examples of videos they like?

The better you understand their needs, the easier it will be to deliver something they’ll love.

2. Make a Clear Plan
Once you know the client’s goals, write a script or a basic plan. This doesn’t need to be complex—a simple shot list will do.

A good plan includes:
- Script or dialogue (if needed)
- Location details
- Camera angles
- People involved
- Backup ideas in case something goes wrong

When you plan properly, your shoot becomes faster, easier, and more professional.

3. Check the Location in Advance
Visit the shoot location before the actual day. Check:
- Lighting: Will you need extra lights?
- Background: Is it clean and not distracting?
- Sound: Is there too much noise nearby?

Make notes. Take test shots if possible. This visit can save you from surprises on the day of the shoot.

4. Get Your Equipment Ready
Always double-check your gear:
- Camera batteries charged
- Memory cards cleared
- Extra cables packed
- Tripods or gimbals tested
- Microphones working

It sounds basic, but many shoots get delayed or ruined because of missing or broken gear. Be ready!

5. Set the Right Mood on Set
How you behave during the shoot affects everyone. Stay calm, polite, and confident. If your team or your client sees you in control, they’ll feel relaxed too.

Be respectful with your direction. Guide people gently. Praise good takes. A little kindness goes a long way, especially when working with non-professional actors or the client themselves.

6. Capture Extra Footage (B-Roll)
Always shoot more than just the main scenes. Take extra shots—close-ups, slow motion, details of the environment. These are called “B-roll” and they help you make the final video richer and more beautiful.

These extra clips can help cover mistakes, make editing smoother, and impress the client.

7. First Review: Share a Rough Cut
Once you finish filming and start editing, don’t wait to show the final version all at once. Send your client a “rough cut” early. This is a basic version without full polish.

Ask them:
- Does the structure feel right?
- Are we telling your story clearly?
- Is there anything you’d like changed?

Make it clear that this is a preview, and you’re open to feedback.

8. How to Handle Feedback
Not all clients speak the language of video. Some may say, “It feels off” without knowing why. Your job is to ask questions and understand what they really want.

At the same time, protect your creative work. If you think a client’s suggestion may hurt the video, explain your view with care. Say something like:

"I understand your point—here’s another idea that might work better and still give the same effect."

Stay calm. Be respectful. Never take feedback personally. This shows you’re a professional.

9. Deliver on Time (or Early!)
If you promise the client a video in five days, try to deliver in four. Punctuality is rare and highly valued. It shows you’re reliable and organized.

Along with the final video, you can also send short clips, behind-the-scenes footage, or thumbnails they can use for social media.

This extra effort makes you stand out.

Final Words
A great video shoot is not just about technical quality—it’s about people. Understand your client, plan carefully, work with a kind attitude, and stay open to feedback. That’s how you not only create a strong video, but also a happy and long-lasting client relationship.

With the right mindset and preparation, every shoot can be a success.

(c)adstra digital
`,
    imageUrl: img2,
    tags: ["Video Production", "Client Work", "Filmmaking", "Creative Process"],
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
              {post.content.split("\n").map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                const isSubheading =
                  trimmed.length > 0 && /^[A-Z][^.!?\n]{5,50}$/.test(trimmed); // heuristic: single line, capitalized, no punctuation

                return isSubheading ? (
                  <h3 key={idx} className="blog-subheading">
                    {trimmed}
                  </h3>
                ) : (
                  <p key={idx}>{trimmed}</p>
                );
              })}

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
