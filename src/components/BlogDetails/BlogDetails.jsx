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
import img3 from "../../assets/blog_images/blog_1.jpg";
import img4 from "../../assets/blog_images/blog_2.jpg";
import img5 from "../../assets/blog_images/blog_3.jpg";

const blogPosts = [
  {
    title:
      "Everything Your Business Needs in 2025: SEO, AEO, GEO & PPC Explained",
    slug: "seo-aeo-geo-ppc-2025-digital-strategy",
    author: "Adstra Team",
    publishedDate: "2025-07-01",
    readingTime: "6 min read",
    excerpt:
      "Learn how to grow your business online in 2025 by combining SEO, AEO, GEO, and PPC. Find out how to rank, reach, and convert with AdstraDigital.",
    imageUrl: img4,
    tags: ["SEO", "AEO", "PPC", "Local SEO", "Digital Strategy"],
    content: `
      It takes more than just a website to stand out online in the rapidly evolving digital world of today. Your business needs an integrated strategy that incorporates SEO, AEO, GEO, and PPC if it wants to succeed in 2025.

      Together, these four pillars of contemporary digital marketing increase your online presence, attract relevant traffic, and turn leads into devoted clients.

      What is SEO (Search Engine Optimization)?

      Optimizing your website to rank higher on search engines like Google is known as SEO. It involves:

      Keyword research, On-page optimization, Technical SEO, High-quality content, Backlink building

      When done correctly, SEO increases user and search engine trust while generating steady organic traffic.

      Example: If you own a bakery in Kozhikode, SEO makes your website show up when someone searches for “best cake shop in Kozhikode, Kerala.”

      Visit our SEO Services page to find out more.

      What is AEO (Answer Engine Optimization)?

      The next generation of SEO is AEO. It focuses on making your content more visible in voice searches, featured snippets, and AI-powered assistants like Google Assistant and ChatGPT.

      Key strategies: Content organized in clear Q&A format, Schema markup, Conversational long-tail keywords

      Why AEO matters: In 2025, users are searching by asking questions. Brands that offer direct, clear answers gain the edge.

      What is GEO (Geo-Targeted Marketing & Local SEO)?

      GEO involves optimizing your business to appear in local searches and attract nearby customers.

      Strategies include: Google Business Profile optimization, Local keyword targeting, Local citations & reviews, Geo-fenced ads

      For location-based businesses like those in Kozhikode or Wayanad, GEO ensures you dominate the local search map.

      See our Google Business Management Services

      What is PPC (Pay-Per-Click Advertising)?

      PPC is a model where you pay only when your ad is clicked. It's ideal for: Instant visibility, Launching new products/services, Retargeting previous visitors

      Channels we use: Google Ads, Meta (Facebook & Instagram), LinkedIn, and YouTube.

      Explore our Paid Advertising Services

      Why Your Business Needs a Unified SEO, AEO, GEO & PPC Approach

      In 2025, relying on one channel isn’t enough. Your audience scrolls, speaks, types, and taps across multiple platforms.

      A unified strategy ensures your business: Maintains a consistent presence, Captures both local and global traffic, Converts users through trust-building, Delivers measurable ROI across every stage In 2025,
      
      Elevate Your Brand with AdstraDigital

      At AdstraDigital, we don’t believe in one-size-fits-all. Our team blends SEO, AEO, GEO, and PPC to build custom strategies that grow your business.

      Contact us now for a free consultation and let’s shape the digital future of your brand—together.
  `,
  },
  {
    title:
      "Branding Trends 2025: How Logo Design Will Elevate Your Digital Marketing Strategy",
    slug: "branding-trends-2025-logo-design-marketing",
    author: "Adstra Team",
    publishedDate: "2025-07-01",
    readingTime: "5 min read",
    excerpt:
      "Learn about the top logo design trends for 2025 and how they can boost your digital marketing results.",
    imageUrl: img3,
    tags: ["Branding", "Logo Design", "Digital Marketing", "Trends"],
    content: `
    Introduction
    Your logo is more than just a visual symbol—it's the heartbeat of your brand identity. As we move into 2025, branding continues to evolve, and logo design trends are taking center stage in shaping how consumers perceive and interact with businesses online. At AdstraDigital, we understand that a logo isn't just design—it's a powerful digital marketing tool.

    Why Branding Still Matters in 2025
    With AI-generated content, competitive markets, and short attention spans, your brand needs to stand out instantly. A strong logo design helps:

    Build brand recognition, Establish trust and authority, Enhance recall value across platforms, Create emotional connection
    Want to know how your branding performs? Get a Free Branding Audit!

    Key Logo Design Trends That Will Dominate 2025 Responsive and Scalable Logos Logos must look flawless across devices—mobile apps, smartwatches, social media, even dark mode. Responsive design ensures consistency everywhere.

    Minimalism 2.0
    Think simple but smart. Clever typography, soft gradients, and subtle geometry that communicate more with less.

    Animated Logos Movement draws attention. From reels to ads, animated logos bring brands to life visually.

    3D and Depth-Driven Designs
    Use shadows and layers for a more modern, immersive look—especially useful for tech-forward or creative industries.

    Culturally Rooted Logos From traditional motifs to local typography, regional identity is becoming a core part of branding—particularly powerful for Kerala-based businesses.

    How Logo Design Supports Digital Marketing
    Boosts Social Media Engagement: Great logos boost recognition and consistency across platforms like Instagram and LinkedIn.

    Improves Click-Through on Ads: A professional logo builds trust and increases ad CTR.

    Strengthens SEO Signals: Brand-related searches grow with a recognizable name and logo.

    Supports Trust on Landing Pages: Users decide in 3 seconds—your logo must convey instant credibility.

    Tips from AdstraDigital
    “Don’t just design a logo. Design a brand story that lives in every pixel.”
    At AdstraDigital, our in-house creative team helps businesses in Kozhikode, Wayanad, and across Kerala build future-ready brand identities that work across digital ecosystems.

    Explore our Branding & Identity Design Services

    Final Thoughts: Is Your Logo Ready for 2025?
    The digital landscape in 2025 is faster, smarter, and more visual than ever. Your logo needs to do more than look good—it needs to communicate, convert, and connect.

    Want to revamp your brand for 2025? Let AdstraDigital craft a logo that performs—not just decorates. Contact Us for a Free Brand Consultation


  `,
  },
  {
    title:
      "What is AI Marketing? Key Benefits and How It Drives Business Growth",
    slug: "ai-marketing-benefits-business-growth",
    author: "Adstra Team",
    publishedDate: "2025-07-01",
    readingTime: "6 min read",
    excerpt:
      "What is AI marketing? How AI works, its key advantages, and how it helps businesses achieve faster, smarter, and scalable growth in today’s digital-first world.",
    content: `
    Introduction
    In the fast-paced world of digital marketing, personalization, automation, and real-time data are key. Enter AI Marketing — the game-changing approach that uses artificial intelligence to analyze data, automate tasks, and improve marketing outcomes. Businesses leveraging AI are not only improving efficiency but also driving smarter customer experiences and exponential growth.

    What is AI Marketing?
    AI marketing refers to the use of artificial intelligence technologies such as machine learning, data analytics, predictive algorithms, and automation tools to optimize marketing efforts. This includes:

    Automated content generation, Smart ad targeting, Personalized customer experiences, Predictive customer behavior, Chatbots and voice assistants

    Key Benefits of AI Marketing
    Hyper-Personalization at Scale: Tailor content and experiences based on massive data analysis.

    Smarter, Cost-Efficient Ad Targeting: Optimize spend by targeting high-conversion audiences.

    Faster Decision-Making: Use real-time insights for data-driven strategies.

    Automation of Repetitive Tasks: Save time by automating reports, emails, and workflows.

    Predictive Analytics: Anticipate customer needs and stay ahead of trends.

    How AI Drives Business Growth
    Higher Conversion Rates: Personalization = better engagement.

    Improved Customer Retention: Re-engage customers using AI signals.

    Scalable Campaigns: Grow without increasing manual workload.

    Use AI Chatbots: Assist users 24/7.

    Smart Email Campaigns: Tools like Mailchimp AI or Klaviyo optimize email performance.

    Behavior Analysis: Tools like HubSpot or Zoho segment and understand your audience.

    Real Examples: Top Brands Using AI
    Zara: AI for inventory forecasting by analyzing weather, sales, and trends.

    Lenskart: AI-powered virtual try-ons using facial mapping tech.

    Nykaa: Personalized product feeds tailored by behavior and preferences.

    Domino’s: Predictive ordering via AI for repeat orders and fast checkout.

    OYO: Dynamic pricing engines powered by demand and competitor analysis.

    Conclusion
    AI marketing is no longer optional—it’s essential. Brands that adopt AI early will benefit from smarter, faster, and more scalable growth strategies. At AdstraDigital, we help businesses across Kerala and beyond boost performance using AI-powered tools in advertising, content creation, and CRM.

    Ready to make your marketing smarter? Contact AdstraDigital for a free consultation today.
  `,
    imageUrl: img5,
    tags: ["AI Marketing", "Digital Strategy", "Automation", "Business Growth"],
  },
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
      {!slug || slug === "all" ? (
        <>
          <h1 data-aos="fade-down" className="blog-title">
            Latest Blogs
          </h1>
          <div className="blog-menu-grid">
            {blogPosts.map((post, index) => (
              <Tilt
                style={{ height: "100%" }}
                glareEnable={true}
                glareMaxOpacity={0.2}
                scale={false}
                transitionSpeed={1000}
                tiltMaxAngleX={3}
                tiltMaxAngleY={3}
                perspective={1500}
                gyroscope={false}
              >
                <a
                  href={`/blogs/${post.slug}`}
                  className="blog-card"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div
                    className="blog-imag"
                    style={{ backgroundImage: `url(${post.imageUrl})` }}
                  />
                  <div className="blog-info">
                    <h3>{post.title}</h3>
                    <p className="excerpt">{post.excerpt}</p>
                    <span className="meta">
                      {format(new Date(post.publishedDate), "MMM d, yyyy")} •{" "}
                      {post.readingTime}
                    </span>
                  </div>
                </a>
              </Tilt>
            ))}
          </div>
        </>
      ) : (
        <div className="blog-detail-layout">
          {/* Sidebar */}
          <aside className="blog-sidebar" data-aos="fade-right">
            <h3>Other Blogs</h3>
            <div className="sidebar-card-list">
              {blogPosts
                .filter((b) => b.slug !== slug)
                .map((post, index) => (
                  <a
                    href={`/blogs/${post.slug}`}
                    className="sidebar-card"
                    key={index}
                  >
                    <div
                      className="sidebar-card-img"
                      style={{ backgroundImage: `url(${post.imageUrl})` }}
                    />
                    <div className="sidebar-card-info">
                      <h4>{post.title}</h4>
                      <p>{post.excerpt.slice(0, 60)}...</p>
                    </div>
                  </a>
                ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="blog-main-content">
            {selectedPosts.map((post, index) => (
              <Tilt
                key={index}
                glareEnable={true}
                glareMaxOpacity={0.2}
                scale={false}
                transitionSpeed={5000}
                tiltMaxAngleX={1}
                tiltMaxAngleY={1}
                perspective={1500}
                gyroscope={false}
              >
                <div className="blog-blocks compact" data-aos="fade-up">
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
                    <h1>{post.title}</h1>
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
                        trimmed.length > 0 &&
                        /^[A-Z][^.!?\n]{5,50}$/.test(trimmed);
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
        </div>
      )}
    </div>
  );
}

export default BlogDetail;
