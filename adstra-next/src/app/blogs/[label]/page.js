import { blogPosts } from "@/data/services";
import NavBar from "@/components/NavBar/navbar";
import Footer from "@/components/Footer/Footer";
import BlogDetail from "@/components/BlogDetails/BlogDetails";

// Static path generation
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    label: post.slug,
  }));
}

// SEO Metadata
export function generateMetadata({ params }) {
  const blog = blogPosts.find((b) => b.slug === params.label);

  if (!blog) {
    return {
      title: "Blog Not Found | AdstraDigital",
      description: "This blog post could not be found.",
    };
  }

  return {
    title: `${blog.title} | AdstraDigital`,
    description: blog.excerpt || blog.content?.slice(0, 150),
    alternates: {
      canonical: `https://adstradigital.com/blogs/${blog.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: [{ url: blog.imageUrl }],
      type: "article",
      url: `https://adstradigital.com/blogs/${blog.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [blog.imageUrl],
    },
  };
}

// Blog Page Component
export default function BlogDetailPage({ params }) {
  const blog = blogPosts.find((b) => b.slug === params.label);

  if (!blog) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <h2>Blog Not Found</h2>
          <p>The blog you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />

      {/* ✅ Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://adstradigital.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blogs",
                item: "https://adstradigital.com/blogs/all",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: blog.title,
                item: `https://adstradigital.com/blogs/${blog.slug}`,
              },
            ],
          }),
        }}
      />

      <BlogDetail blog={blog} />
      <Footer />
    </>
  );
}